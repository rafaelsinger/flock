import { Conversation, User, Message } from '@prisma/client';

export type ConversationWithUsers = Conversation & {
  sender: Pick<User, 'id' | 'name'>;
  receiver: Pick<User, 'id' | 'name'>;
};

export type ConversationWithMessages = ConversationWithUsers & {
  messages: Message[];
};

export interface ConversationUser {
  id: string;
  name: string | null;
}
