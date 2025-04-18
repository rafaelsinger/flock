import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { UpdateUser } from '@/types/user';
import { Prisma } from '@prisma/client';

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

    // Prepare the data object with non-problematic fields first
    const updateData: Prisma.UserUpdateInput = {
      name: userData.name,
      postGradType: userData.postGradType,
      title: userData.title,
      program: userData.program,
      discipline: userData.discipline,
      company: userData.company,
      school: userData.school,
      isOnboarded: userData.isOnboarded,
      lookingForRoommate: userData.lookingForRoommate,
      visibilityOptions: userData.visibilityOptions,
      classYear: userData.classYear,
    };

    // Add relations
    if (locationId) {
      updateData.location = {
        connect: {
          id: locationId,
        },
      };
    }

    // Set industry using proper enum syntax
    if (userData.industry) {
      updateData.industry = userData.industry;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: updateData,
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

    // First check if the user exists
    const userExists = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!userExists) {
      return new NextResponse(JSON.stringify({ success: false, message: 'User not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
  } catch (error: unknown) {
    console.error('Error deleting user account:', error);

    // Check if it's a Prisma error (more detailed error handling)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Account not found or already deleted',
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Error deleting account',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
