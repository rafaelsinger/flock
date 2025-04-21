import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { MessageType } from '@/types/messages';

// get messages for the current user based on type (all, sent, or received)
export const GET = async (request: Request) => {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') as MessageType) || MessageType.ALL;
  const id = session.user.id;
  const includeReceived = type === MessageType.ALL || type === MessageType.RECEIVED;
  const includeSent = type === MessageType.ALL || type === MessageType.SENT;

  const whereConditions = [];

  if (includeReceived) {
    whereConditions.push({ receiverId: id });
  }

  if (includeSent) {
    whereConditions.push({ senderId: id });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: whereConditions,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};
