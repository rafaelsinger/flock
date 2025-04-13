import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getStateFullName } from '@/lib/utils';

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
        country: 'USA',
      },
      select: {
        state: true,
      },
    });

    // Count users by state
    const stateCount: Record<string, number> = {};

    users.forEach((user) => {
      if (user.state) {
        // Convert abbreviation to full state name
        const fullStateName = getStateFullName(user.state);

        // Initialize the state count if it doesn't exist
        if (!stateCount[fullStateName]) {
          stateCount[fullStateName] = 0;
        }
        // Increment the count for this state
        stateCount[fullStateName]++;
      }
    });

    return NextResponse.json(stateCount);
  } catch (error) {
    console.error('Error fetching location data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
