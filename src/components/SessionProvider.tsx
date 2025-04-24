'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { useMessageStore } from '@/store/messageStore';
import { useEffect } from 'react';
import supabase from '@/utils/supabase';
import { Message } from '@prisma/client';
import { MessageType } from '@/types/messages';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  useEffect(() => {
    if (!session?.user?.id) return;

    // Fetch initial messages - only care about received messages
    const fetchMessages = async () => {
      const response = await fetch(`/api/messages?type=${MessageType.RECEIVED}`);
      const messages = await response.json();
      useMessageStore.getState().setMessages(messages);
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`,
        },
        (payload) => {
          const message = payload.new as Message;
          useMessageStore.getState().addMessage(message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session.user.id}`,
        },
        (payload) => {
          // not ideal solution but no way to filter on multiple columns yet
          // see: https://github.com/supabase/realtime-js/issues/97
          const message = payload.new as Message;
          if (message.read) {
            useMessageStore.getState().markAsRead(message.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);
  return (
    <NextAuthSessionProvider session={session}>
      <SessionProvider>{children}</SessionProvider>
    </NextAuthSessionProvider>
  );
}
