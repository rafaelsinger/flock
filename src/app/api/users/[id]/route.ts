import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { UpdateUser } from '@/types/user';

export const GET = async (request: NextRequest) => {
  const id = request.url.split('/users/')[1];
  if (!id) {
    return new NextResponse('No ID provided', { status: 400 });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        location: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const PUT = async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { params } = await context;
  const { id } = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse('Unauthorized - No session', { status: 401 });
    }

    if (!id) {
      return new NextResponse('Bad Request - Missing ID parameter', { status: 400 });
    }

    if (session.user.id !== id) {
      return new NextResponse('Unauthorized - User ID mismatch', { status: 401 });
    }

    const userData: UpdateUser = await request.json();

    let locationId: string | null = null;
    // if user wants to update their location
    if (userData.location) {
      // check if location exists
      const location = await prisma.location.findFirst({
        where: {
          country: userData.location?.country,
          state: userData.location?.state,
          city: userData.location?.city,
        },
      });

      // if not, then create a new location
      if (!location) {
        const createdLocation = await prisma.location.create({
          data: {
            country: userData.location.country,
            state: userData.location.state,
            city: userData.location.city,
            latitude: userData.location.lat,
            longitude: userData.location.lon,
          },
        });
        locationId = createdLocation.id;
      } else {
        locationId = location.id;
      }
    }

    let industryId: string | null = null;
    if (userData.industry) {
      const industry = await prisma.industry.findFirst({
        where: {
          name: userData.industry,
        },
      });
      if (industry) {
        industryId = industry.id;
      } else {
        console.error(`Industry with name ${userData.industry} not found`);
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: userData.name,
        postGradType: userData.postGradType,
        title: userData.title,
        program: userData.program,
        discipline: userData.discipline,
        company: userData.company,
        school: userData.school,
        isOnboarded: userData.isOnboarded,
        locationId: locationId,
        industryId: industryId,
        lookingForRoommate: userData.lookingForRoommate,
        visibilityOptions: userData.visibilityOptions,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const { params } = await context;
  const { id } = await params;

  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse('Unauthorized - No session', { status: 401 });
    }

    if (!id) {
      return new NextResponse('Bad Request - Missing ID parameter', { status: 400 });
    }

    if (session.user.id !== id) {
      return new NextResponse('Unauthorized - Cannot delete another user account', { status: 401 });
    }

    // Delete user account (Prisma will cascade delete related data thanks to our schema setup)
    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting user account:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
