import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const GET = auth(async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const postGradType = searchParams.get('postGradType') as 'work' | 'school' | 'all' | undefined;
    const country = searchParams.get('country') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const industry = searchParams.get('industry') || '';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const where = {
      AND: [
        // Search condition
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { city: { contains: search, mode: 'insensitive' as const } },
                { state: { contains: search, mode: 'insensitive' as const } },
                { company: { contains: search, mode: 'insensitive' as const } },
                { school: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : { OR: [] },
        // Post grad type filter
        postGradType && postGradType !== 'all' ? { postGradType } : { OR: [] },
        // Country filter
        country ? { country } : { OR: [] },
        // State filter
        state ? { state } : { OR: [] },
        // City filter
        city ? { city: { contains: city, mode: 'insensitive' as const } } : { OR: [] },
        // Industry filter
        industry
          ? {
              industry: {
                name: { equals: industry },
              },
            }
          : { OR: [] },
      ],
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        country: true,
        company: true,
        school: true,
        postGradType: true,
        visibilityOptions: true,
        industry: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = auth(async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const userData = await request.json();

    let industryId = null;
    if (userData.postGradType === 'work') {
      const industry = await prisma.industry.findUnique({
        where: {
          name: userData.work.industry,
        },
      });
      industryId = industry?.id;
    }

    // Update the existing user record instead of creating a new one
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        // Map onboarding data to user fields
        name: userData.name || session.user.name,
        city: userData.location?.city,
        state: userData.location?.state,
        country: userData.location?.country || 'United States',
        postGradType: userData.postGradType,
        // Work-specific fields
        company: userData.postGradType === 'work' ? userData.work?.company : null,
        title: userData.postGradType === 'work' ? userData.work?.role : null,
        industryId: industryId,
        // School-specific fields
        school: userData.postGradType === 'school' ? userData.school?.name : null,
        program: userData.postGradType === 'school' ? userData.school?.program : null,
        // Visibility settings
        visibilityOptions: {
          showRole: userData.visibility?.showRole ?? true,
          showProgram: userData.visibility?.showProgram ?? true,
          showCompany: userData.visibility?.showCompany ?? true,
          showSchool: userData.visibility?.showSchool ?? true,
        },
        // Mark as onboarded
        isOnboarded: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});
