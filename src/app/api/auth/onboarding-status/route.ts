import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token?.email) {
    return NextResponse.json({ isOnboarded: false, currentStep: null });
  }

  const user = await prisma.user.findUnique({
    where: { bcEmail: token.email },
    select: {
      isOnboarded: true,
      onboardingStep: true,
    },
  });

  return NextResponse.json({
    isOnboarded: !!user?.isOnboarded,
    currentStep: user?.onboardingStep || null,
  });
}
