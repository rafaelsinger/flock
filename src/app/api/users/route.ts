import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    console.log({ country, city, state, industry });

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
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    let industryId = null;
    if (data.postGradType === 'work') {
      const industry = await prisma.industry.findUnique({
        where: {
          name: data.work?.industry,
        },
      });
      industryId = industry?.id;
    }

    const user = await prisma.user.create({
      data: {
        name: session.user.name!,
        bcEmail: session.user.email,
        postGradType: data.postGradType,
        company: data.postGradType === 'work' ? data.work?.company : null,
        title: data.postGradType === 'work' ? data.work?.role : null,
        school: data.postGradType === 'school' ? data.school?.name : null,
        program: data.postGradType === 'school' ? data.school?.program : null,
        country: data.location.country || 'US',
        state: data.location.state,
        city: data.location.city,
        boroughDistrict: data.location.borough || null,
        industryId: industryId,
        visibilityOptions: data.visibility || {},
        isOnboarded: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
  }
}
