import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const user = await prisma.user.create({
      data: {
        name: session.user.name!,
        bcEmail: session.user.email,
        postGradType: data.postGradType,
        company: data.postGradType === "work" ? data.work?.company : null,
        title: data.postGradType === "work" ? data.work?.role : null,
        school: data.postGradType === "school" ? data.school?.name : null,
        program: data.postGradType === "school" ? data.school?.program : null,
        country: data.location.country || "US",
        state: data.location.state,
        city: data.location.city,
        boroughDistrict: data.location.borough || null,
        industryId: data.postGradType === "work" ? data.work?.industryId : null,
        visibilityOptions: data.visibility || {},
        isOnboarded: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }
}
