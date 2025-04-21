'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { ConversationWithUsers } from '@/types/conversations';

export default function ConversationsPage() {
  const { data: session } = useSession();
  const messages = useMessageStore((state) => state.messages);
  const [conversations, setConversations] = useState<ConversationWithUsers[] | []>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // fetch conversations
    const fetchConversations = async () => {
      const response = await fetch(`/api/conversations`);
      const conversations = await response.json();
      setConversations(conversations);
    };

    fetchConversations();
  }, [messages, session]);

  return (
    <div className="min-h-screen bg-[#FFF9F8] flex flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-grow">
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#333333]">Messages</h1>
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conversation) => {
                const isCurrentUserSender = conversation.senderId === session?.user?.id;
                const otherUser = isCurrentUserSender ? conversation.receiver : conversation.sender;
                const unreadCount = isCurrentUserSender
                  ? conversation.senderUnreadCount
                  : conversation.receiverUnreadCount;

                return (
                  <Link
                    href={`/conversations/${otherUser.id}`}
                    key={conversation.id}
                    className="w-full"
                  >
                    <motion.div
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#333333]">
                              {otherUser.name || 'Unknown User'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(conversation.lastMessageAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 line-clamp-2">
                        {conversation.lastMessagePreview}
                      </p>
                    </motion.div>
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
