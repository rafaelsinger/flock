import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { UserOnboarding } from '@/types/user';

export const GET = auth(async function GET(request: NextRequest) {
  const id = request.url.split('/users/')[1];
  if (!id) {
    return new NextResponse('No ID provided', { status: 400 });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: id,
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
});

export async function PUT(request: Request, context: { params: { id: string } }) {
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

    const userData: UserOnboarding = await request.json();

    // check if location exists
    const location = await prisma.location.findFirst({
      where: {
        country: userData.country,
        state: userData.state,
        city: userData.city,
      },
    });

    // if not, then create a new location
    let locationId: string;
    if (!location) {
      const createdLocation = await prisma.location.create({
        data: {
          country: userData.country,
          state: userData.state,
          city: userData.city,
          latitude: userData.lat,
          longitude: userData.lon,
        },
      });
      locationId = createdLocation.id;
    } else {
      locationId = location.id;
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
        company: userData.company,
        school: userData.school,
        isOnboarded: userData.isOnboarded,
        locationId: locationId,
        lookingForRoommate: userData.lookingForRoommate,
        visibilityOptions: userData.visibilityOptions,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
