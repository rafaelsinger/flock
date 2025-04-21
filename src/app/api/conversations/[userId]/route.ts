import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await params;
  const currentUserId = session.user.id;
  const otherUserId = userId;

  try {
    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [{ senderId: currentUserId }, { receiverId: otherUserId }],
          },
          {
            AND: [{ senderId: otherUserId }, { receiverId: currentUserId }],
          },
        ],
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          senderId: currentUserId,
          receiverId: otherUserId,
          lastMessageAt: new Date(),
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    // Reset unread count for the current user
    if (conversation.senderId === currentUserId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { senderUnreadCount: 0 },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { receiverUnreadCount: 0 },
      });
    }

    // Mark all messages as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        receiverId: currentUserId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}
