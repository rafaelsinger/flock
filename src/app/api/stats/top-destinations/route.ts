import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'companies';
    const limit = parseInt(searchParams.get('limit') || '6'); // Support for expanded view

    let destinations = [];

    switch (type) {
      case 'companies':
        // Get top companies
        destinations = await prisma.user.groupBy({
          by: ['company'],
          where: {
            company: {
              not: null,
            },
            postGradType: 'work',
          },
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: limit,
        });

        // Format company results
        destinations = destinations
          .filter((item) => item.company) // Filter out null companies
          .map((item) => ({
            id: item.company,
            name: item.company,
            count: item._count.id,
            type: 'company',
          }));
        break;

      case 'schools':
        // Get top schools
        destinations = await prisma.user.groupBy({
          by: ['school'],
          where: {
            school: {
              not: null,
            },
            postGradType: 'school',
          },
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: limit,
        });

        // Format school results
        destinations = destinations
          .filter((item) => item.school) // Filter out null schools
          .map((item) => ({
            id: item.school,
            name: item.school,
            count: item._count.id,
            type: 'school',
          }));
        break;

      case 'cities':
        // Get top cities
        destinations = await prisma.user.groupBy({
          by: ['city', 'state'],
          where: {
            city: {
              not: null,
            },
          },
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: limit,
        });

        // Format city results
        destinations = destinations
          .filter((item) => item.city) // Filter out null cities
          .map((item) => ({
            id: `${item.city}-${item.state || ''}`,
            name: item.city,
            location: item.state ? `${item.state}` : undefined,
            count: item._count.id,
            type: 'city',
          }));
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching top destinations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
