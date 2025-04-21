import { Message, User } from '@prisma/client';

export enum MessageType {
  ALL = 'all',
  SENT = 'sent',
  RECEIVED = 'received',
}

export interface MessageQueryParams {
  type?: MessageType;
}

export type MessageWithUsers = Message & { sender: User; receiver: User };
