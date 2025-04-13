import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        bcEmail: {
          startsWith: `${params.id}@`,
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email?.split("@")[0] !== params.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userData = await request.json();

    const updatedUser = await prisma.user.update({
      where: {
        bcEmail: `${params.id}@bc.edu`,
      },
      data: {
        name: userData.name,
        postGradType: userData.postGradType,
        title: userData.title,
        program: userData.program,
        company: userData.company,
        school: userData.school,
        city: userData.city,
        state: userData.state,
        country: userData.country,
        visibilityOptions: userData.visibilityOptions,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
