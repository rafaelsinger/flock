import { Message } from '@prisma/client';
import { create } from 'zustand';

interface MessageStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  markAsRead: (id: string) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) =>
    set(() => ({
      messages,
    })),

  markAsRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
    })),

  clearMessages: () =>
    set(() => ({
      messages: [],
    })),
}));
