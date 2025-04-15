import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';

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
});

// think we never use this route
// export const POST = auth(async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Parse the request body
//     const userData = await request.json();

//     let industryId = null;
//     if (userData.postGradType === 'work') {
//       const industry = await prisma.industry.findUnique({
//         where: {
//           name: userData.work.industry,
//         },
//       });
//       industryId = industry?.id;
//     }

//     // Update the existing user record instead of creating a new one
//     const updatedUser = await prisma.user.update({
//       where: {
//         id: session.user.id,
//       },
//       data: {
//         // Map onboarding data to user fields
//         name: userData.name || session.user.name,
//         location: {
//           create: {
//             city: userData.location?.city,
//             state: userData.location?.state,
//             country: userData.location?.country || 'United States',
//             latitude: userData.location?.latitude || 0,
//             longitude: userData.location?.longitude || 0,
//           },
//         },
//         postGradType: userData.postGradType,
//         // Work-specific fields
//         company: userData.postGradType === 'work' ? userData.work?.company : null,
//         title: userData.postGradType === 'work' ? userData.work?.role : null,
//         industryId: industryId,
//         // School-specific fields
//         school: userData.postGradType === 'school' ? userData.school?.name : null,
//         program: userData.postGradType === 'school' ? userData.school?.program : null,
//         // Roommate preference
//         lookingForRoommate: userData.lookingForRoommate ?? false,
//         // Visibility settings
//         visibilityOptions: {
//           showRole: userData.visibility?.showRole ?? true,
//           showProgram: userData.visibility?.showProgram ?? true,
//           showCompany: userData.visibility?.showCompany ?? true,
//           showSchool: userData.visibility?.showSchool ?? true,
//         },
//         // Mark as onboarded
//         isOnboarded: true,
//       },
//     });

//     return NextResponse.json(updatedUser);
//   } catch (error) {
//     console.error('Error updating user:', error);
//     return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
//   }
// });
