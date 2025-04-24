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
    const classYear = searchParams.get('classYear');

    let destinations = [];

    switch (type) {
      case 'companies':
        // Get all companies (without groupBy to handle case insensitivity manually)
        const companyUsers = await prisma.user.findMany({
          where: {
            company: {
              not: null,
            },
            postGradType: {
              in: ['work', 'internship'],
            },
            classYear: classYear ? parseInt(classYear) : undefined,
          },
          select: {
            company: true,
          },
        });

        // Case-insensitive aggregation
        const companyMap = new Map<string, number>();

        companyUsers.forEach((user) => {
          if (!user.company) return;

          const normalizedCompany = user.company.toLowerCase();
          const count = companyMap.get(normalizedCompany) || 0;
          companyMap.set(normalizedCompany, count + 1);
        });

        // Convert to array, sort by count, and format
        const topCompanies = Array.from(companyMap.entries())
          .map(([company, count]) => ({
            company,
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);

        // Format company results with proper capitalization
        destinations = topCompanies.map((item) => {
          // Capitalize first letter of each word
          const formattedName = item.company
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return {
            id: item.company,
            name: formattedName,
            count: item.count,
            type: 'company',
          };
        });
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
            classYear: classYear ? parseInt(classYear) : undefined,
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
        // Get top cities from the locations table
        destinations = await prisma.location.findMany({
          select: {
            id: true,
            city: true,
            state: true,
            _count: {
              select: {
                users: true,
              },
            },
          },
          where: {
            users: {
              every: {
                classYear: classYear ? parseInt(classYear) : undefined,
              },
            },
          },
          orderBy: {
            users: {
              _count: 'desc',
            },
          },
          take: limit,
        });

        // Format city results
        destinations = destinations
          .filter((item) => item._count.users > 0) // Only include locations with users
          .map((item) => ({
            id: item.id,
            name: item.city,
            location: item.state,
            count: item._count.users,
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
