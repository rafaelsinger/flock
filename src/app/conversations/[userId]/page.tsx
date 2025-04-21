'use client';

import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { ConversationWithMessages } from '@/types/conversations';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';

export default function ConversationPage() {
  const { data: session } = useSession();
  const messages = useMessageStore((state) => state.messages);
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const userId = usePathname().split('/')[2];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchConversation = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/conversations/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch conversation');
        const data = await response.json();
        setConversation(data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [userId, session, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/conversations/${userId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();

      // Update local conversation state
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, message],
          lastMessageAt: new Date(),
          lastMessagePreview: newMessage,
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Format the date for message groups
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Format time in a more readable way
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F8] flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-xl shadow-md p-6 h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  rotate: 360,
                  transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                }}
              >
                <Loader2 className="w-8 h-8 mb-3 text-[#F9C5D1]" />
              </motion.div>
              <p className="text-gray-500">Loading conversation...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const otherUser =
    conversation?.senderId === session?.user?.id ? conversation?.receiver : conversation?.sender;

  return (
    <div className="min-h-screen bg-[#FFF9F8] flex flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-grow">
        <motion.div
          className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[80vh]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-4 flex items-center sticky top-0 z-10 shadow-sm">
            <Link
              href="/conversations"
              className="flex items-center justify-center w-8 h-8 mr-3 text-gray-600 hover:text-[#F28B82] hover:bg-gray-50 rounded-full transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {otherUser && (
              <div className="flex items-center flex-grow">
                <div className="bg-[#F9C5D1]/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-[#F28B82]" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[#333333]">
                    {otherUser.name || 'Unknown User'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {conversation?.messages.length
                      ? `Last active ${formatDate(new Date(conversation.lastMessageAt)).toLowerCase()}`
                      : 'New conversation'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div
            ref={messageContainerRef}
            className="flex-grow p-5 overflow-y-auto space-y-4 bg-gray-50/50"
          >
            {!conversation || conversation.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-[#F9C5D1]/10 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-[#F9C5D1]" />
                </div>
                <p className="text-gray-500 mb-1">No messages yet</p>
                <p className="text-sm text-gray-400">Send a message to start the conversation</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {conversation.messages.map((message, index) => {
                    const isCurrentUser = message.senderId === session?.user?.id;
                    const messageDate = new Date(message.createdAt);

                    // Show date divider if this is the first message or if the date is different from the previous message
                    const showDateDivider =
                      index === 0 ||
                      new Date(conversation.messages[index - 1].createdAt).toDateString() !==
                        messageDate.toDateString();

                    // Check if this is a consecutive message from the same sender
                    const isConsecutive =
                      index > 0 &&
                      conversation.messages[index - 1].senderId === message.senderId &&
                      !showDateDivider;

                    return (
                      <div key={message.id}>
                        {showDateDivider && (
                          <motion.div
                            className="flex items-center my-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex-grow border-t border-gray-200"></div>
                            <div className="mx-4 text-xs font-medium text-gray-400 bg-gray-50/50 px-3 py-1 rounded-full">
                              {formatDate(messageDate)}
                            </div>
                            <div className="flex-grow border-t border-gray-200"></div>
                          </motion.div>
                        )}
                        <motion.div
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mb-3 mt-3'}`}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { type: 'spring', stiffness: 500, damping: 30 },
                            },
                          }}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3.5 ${isConsecutive ? 'rounded-2xl' : isCurrentUser ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'} shadow-sm ${
                              isCurrentUser
                                ? 'bg-gradient-to-br from-[#F28B82] to-[#F9C5D1] text-white'
                                : 'bg-white border border-gray-100 text-[#333333]'
                            }`}
                          >
                            <p className="text-sm sm:text-base leading-relaxed break-words">
                              {message.content}
                            </p>
                            <p
                              className={`text-[10px] sm:text-xs mt-1 ${isCurrentUser ? 'text-white/90' : 'text-gray-500'} text-right`}
                            >
                              {formatTime(messageDate)}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Message input */}
          <div className="border-t border-gray-100 p-3 sm:p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-5 py-3 text-[#333] bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F9C5D1] focus:border-transparent transition-all"
                disabled={isSending}
              />
              <motion.button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="p-3.5 rounded-full bg-gradient-to-r from-[#F28B82] to-[#F9C5D1] text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
