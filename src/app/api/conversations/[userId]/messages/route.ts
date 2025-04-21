import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await request.json();
    const { userId } = await params;
    const currentUserId = session.user.id;
    const otherUserId = userId;

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
    });

    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = await prisma.conversation.create({
        data: {
          senderId: currentUserId,
          receiverId: otherUserId,
          lastMessageAt: new Date(),
          lastMessagePreview: content,
        },
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUserId,
        receiverId: otherUserId,
        conversationId: conversation.id,
      },
    });

    // Update conversation with last message info and increment unread count
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content,
        ...(conversation.senderId === currentUserId
          ? { receiverUnreadCount: { increment: 1 } }
          : { senderUnreadCount: { increment: 1 } }),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
