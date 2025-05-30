import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { PostGradType, Prisma } from '@prisma/client';

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
    const postGradType = searchParams.get('postGradType') as
      | 'work'
      | 'school'
      | 'all'
      | 'seeking'
      | 'internship'
      | undefined;
    const country = searchParams.get('country') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const industry = searchParams.get('industry') || '';
    const classYear = searchParams.get('classYear') || '';
    const lookingForRoommate = searchParams.get('lookingForRoommate') === 'true';
    const showAllClassYears = searchParams.get('showAllClassYears') === 'true';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Filter users based on the requesting user's profile
    // Interns can only see other interns from their class year
    let classYearFilter = {};
    if (session.user && session.user.classYear && !showAllClassYears) {
      classYearFilter = { classYear: { equals: session.user.classYear } };
    }

    // Start building where clause with basic visibility requirements
    const where: Prisma.UserWhereInput = {
      AND: [
        // Search condition - modified to respect visibility preferences
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { location: { city: { contains: search, mode: 'insensitive' as const } } },
                { location: { state: { contains: search, mode: 'insensitive' as const } } },
                // For company search, only include users who have made their company visible
                {
                  AND: [
                    { company: { contains: search, mode: 'insensitive' as const } },
                    {
                      OR: [
                        // Include if visibilityOptions is null/undefined (default to visible)
                        { visibilityOptions: { equals: null } },
                        // Include if visibilityOptions is empty object
                        { visibilityOptions: { equals: {} } },
                        // Include if company visibility is explicitly true
                        {
                          visibilityOptions: {
                            path: ['company'],
                            equals: true,
                          },
                        },
                      ],
                    },
                  ],
                },
                // For school search - also respect visibility settings
                {
                  AND: [
                    { school: { contains: search, mode: 'insensitive' as const } },
                    {
                      OR: [
                        // Include if visibilityOptions is null/undefined (default to visible)
                        { visibilityOptions: { equals: null } },
                        // Include if visibilityOptions is empty object
                        { visibilityOptions: { equals: {} } },
                        // Include if school visibility is explicitly true
                        {
                          visibilityOptions: {
                            path: ['school'],
                            equals: true,
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            }
          : {},
        // Post grad type filter - always exclude seeking
        postGradType === 'work'
          ? { postGradType: { equals: PostGradType.work } }
          : postGradType === 'school'
            ? { postGradType: { equals: PostGradType.school } }
            : postGradType === 'internship'
              ? { postGradType: { equals: PostGradType.internship } }
              : { postGradType: { not: PostGradType.seeking } },
        // Class year filter - when explicitly requested or for intern restrictions
        // Only apply class year filter if not showing all class years
        classYear && !showAllClassYears
          ? { classYear: { equals: parseInt(classYear) } }
          : !showAllClassYears
            ? classYearFilter
            : {},
        // Location filters
        country ? { location: { country } } : {},
        state ? { location: { state: { equals: state, mode: 'insensitive' as const } } } : {},
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
        // Always ensure users are onboarded
        { isOnboarded: { equals: true } },
        // Always exclude seeking users
        { postGradType: { not: PostGradType.seeking } },
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
        title: true,
        school: true,
        program: true,
        postGradType: true,
        classYear: true,
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
