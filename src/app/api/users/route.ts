import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

export const GET = async (request: NextRequest) => {
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
    const lookingForRoommate = searchParams.get('lookingForRoommate') === 'true';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Start building where clause with basic visibility requirements
    const where: Prisma.UserWhereInput = {
      AND: [
        // Search condition
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { location: { city: { contains: search, mode: 'insensitive' as const } } },
                { location: { state: { contains: search, mode: 'insensitive' as const } } },
                { company: { contains: search, mode: 'insensitive' as const } },
                { school: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        // Post grad type filter
        postGradType && postGradType !== 'all' ? { postGradType } : {},
        // Location filters
        country ? { location: { country } } : {},
        state ? { location: { state } } : {},
        city ? { location: { city: { contains: city, mode: 'insensitive' as const } } } : {},
        // Industry filter
        industry
          ? {
              industry: {
                name: { equals: industry },
              },
            }
          : {},
        // Roommate filter
        lookingForRoommate ? { lookingForRoommate: { equals: true } } : {},
      ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        location: {
          select: {
            city: true,
            state: true,
            country: true,
          },
        },
        company: true,
        school: true,
        postGradType: true,
        lookingForRoommate: true,
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
};
