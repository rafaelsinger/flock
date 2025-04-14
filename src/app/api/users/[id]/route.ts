import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { UserUpdate } from '@/types/user';

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
  const id = await params.id;
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

    const userData: UserUpdate = await request.json();

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
        city: userData.city,
        state: userData.state,
        country: userData.country,
        visibilityOptions: userData.visibilityOptions,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
