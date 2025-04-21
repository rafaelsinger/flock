'use client';

import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { ConversationWithUsers } from '@/types/conversations';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function ConversationsPage() {
  const { data: session } = useSession();
  const messages = useMessageStore((state) => state.messages);
  const [conversations, setConversations] = useState<ConversationWithUsers[] | []>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/conversations`);
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const conversations = await response.json();
        setConversations(conversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [messages, session]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date > new Date(now.setDate(now.getDate() - 7))) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">Messages</h1>
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <motion.div
                animate={{
                  rotate: 360,
                  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                }}
              >
                <MessageCircle className="w-8 h-8 mb-3 text-[#F9C5D1]" />
              </motion.div>
              <p>Loading conversations...</p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                className="flex flex-col gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {conversations.length === 0 ? (
                  <motion.div variants={itemVariants} className="py-12 text-center">
                    <div className="w-16 h-16 bg-[#F9C5D1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-[#F9C5D1]" />
                    </div>
                    <p className="text-gray-500 mb-1">No conversations yet</p>
                    <p className="text-sm text-gray-400">Your messages will appear here</p>
                  </motion.div>
                ) : (
                  conversations.map((conversation) => {
                    const isCurrentUserSender = conversation.senderId === session?.user?.id;
                    const otherUser = isCurrentUserSender
                      ? conversation.receiver
                      : conversation.sender;
                    const unreadCount = isCurrentUserSender
                      ? conversation.senderUnreadCount
                      : conversation.receiverUnreadCount;

                    return (
                      <motion.div key={conversation.id} variants={itemVariants}>
                        <Link href={`/conversations/${otherUser.id}`} className="block w-full">
                          <motion.div
                            className={`border ${unreadCount > 0 ? 'border-[#F9C5D1]/30 bg-[#F9C5D1]/5' : 'border-gray-100'} rounded-xl p-4 hover:shadow-md transition-all cursor-pointer`}
                            whileHover={{
                              scale: 1.01,
                              boxShadow: '0 4px 12px rgba(249, 197, 209, 0.15)',
                            }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`font-medium ${unreadCount > 0 ? 'text-[#333333]' : 'text-gray-700'} truncate`}
                                  >
                                    {otherUser.name || 'Unknown User'}
                                  </p>
                                  {unreadCount > 0 && (
                                    <span className="bg-[#F28B82] text-white text-xs px-2 py-0.5 rounded-full">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-sm ${unreadCount > 0 ? 'text-gray-700' : 'text-gray-500'} line-clamp-1 mt-0.5`}
                                >
                                  {conversation.lastMessagePreview}
                                </p>
                              </div>
                              <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatDate(conversation.lastMessageAt)}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
