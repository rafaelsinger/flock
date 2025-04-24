import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getStateFullName } from '@/lib/utils';
import { PostGradType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    const classYear = searchParams.get('classYear');

    if (state) {
      // If a state parameter is provided, get city-level data within that state
      const cityData = await prisma.location.findMany({
        where: {
          state,
          users: {
            some: {
              // Exclude users with 'seeking' postGradType
              postGradType: {
                not: PostGradType.seeking,
              },
              classYear: classYear ? parseInt(classYear) : undefined,
            },
          },
        },
        select: {
          city: true,
          latitude: true,
          longitude: true,
          _count: {
            select: {
              users: {
                where: {
                  // Count only non-seeking users
                  postGradType: {
                    not: PostGradType.seeking,
                  },
                  classYear: classYear ? parseInt(classYear) : undefined,
                },
              },
            },
          },
        },
      });

      // Transform data into the format expected by the Map component
      const cityCountMap: Record<string, number> = {};
      const cityCoordinates: Record<string, [number, number]> = {};

      // TODO: jank, fix
      cityData.forEach((location) => {
        if (location.city in cityCountMap) {
          cityCountMap[location.city] += location._count.users;
        } else {
          cityCountMap[location.city] = location._count.users;
        }
        cityCoordinates[location.city] = [location.longitude, location.latitude];
      });

      return NextResponse.json({
        locations: cityCountMap,
        coordinates: cityCoordinates,
      });
    } else {
      // Get state-level data
      const locationsWithUsers = await prisma.location.findMany({
        where: {
          users: {
            some: {
              // Exclude users with 'seeking' postGradType
              postGradType: {
                not: PostGradType.seeking,
              },
              classYear: classYear ? parseInt(classYear) : undefined,
            },
          },
        },
        select: {
          state: true,
          _count: {
            select: {
              users: {
                where: {
                  // Count only non-seeking users
                  postGradType: {
                    not: PostGradType.seeking,
                  },
                  classYear: classYear ? parseInt(classYear) : undefined,
                },
              },
            },
          },
        },
      });

      // Count users by state
      const stateCount: Record<string, number> = {};

      locationsWithUsers.forEach((location) => {
        if (location.state) {
          // Convert abbreviation to full state name
          const fullStateName = getStateFullName(location.state);

          // Initialize or increment the state count
          stateCount[fullStateName] = (stateCount[fullStateName] || 0) + location._count.users;
        }
      });

      return NextResponse.json(stateCount);
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
