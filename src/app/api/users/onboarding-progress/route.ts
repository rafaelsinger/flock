import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentStep } = await request.json();

    // Ensure currentStep is a number
    const stepNumber = typeof currentStep === 'string' ? parseInt(currentStep, 10) : currentStep;

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        onboardingStep: stepNumber,
      },
      select: {
        id: true,
        onboardingStep: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json({ error: 'Failed to update onboarding progress' }, { status: 500 });
  }
}
