import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with state information
    const users = await prisma.user.findMany({
      where: {
        // Only include users in the US
        country: 'US',
      },
      select: {
        state: true,
      },
    });

    // Count users by state
    const stateCount: Record<string, number> = {};

    users.forEach((user) => {
      if (user.state) {
        // Initialize the state count if it doesn't exist
        if (!stateCount[user.state]) {
          stateCount[user.state] = 0;
        }
        // Increment the count for this state
        stateCount[user.state]++;
      }
    });

    return NextResponse.json(stateCount);
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
