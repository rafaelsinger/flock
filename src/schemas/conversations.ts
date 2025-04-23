import { z } from 'zod';
import { userSchema } from '@/schemas/user';

export const conversationSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  senderId: z.string(),
  receiverId: z.string(),
  lastMessageAt: z.coerce.date(),
  lastMessagePreview: z.string().nullable(),
  senderUnreadCount: z.number(),
  receiverUnreadCount: z.number(),
});

export const conversationWithUserSchema = conversationSchema.extend({
  sender: userSchema.pick({ id: true, name: true }),
  receiver: userSchema.pick({ id: true, name: true }),
});
