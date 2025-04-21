'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { ConversationWithMessages } from '@/types/conversations';
import { usePathname } from 'next/navigation';

export default function ConversationPage() {
  const { data: session } = useSession();
  const messages = useMessageStore((state) => state.messages);
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = usePathname().split('/')[2];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchConversation = async () => {
      const response = await fetch(`/api/conversations/${userId}`);
      const data = await response.json();
      setConversation(data);
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
      // You might want to show an error toast here
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#FFF9F8] flex flex-col">
        <div className="container max-w-4xl mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-center text-gray-500">Loading conversation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const otherUser =
    conversation.senderId === session?.user?.id ? conversation.receiver : conversation.sender;

  return (
    <div className="min-h-screen bg-[#FFF9F8] flex flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-grow">
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col h-[80vh]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/conversations"
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
              <h1 className="text-2xl font-bold text-[#333333]">
                {otherUser.name || 'Unknown User'}
              </h1>
            </div>
          </div>

          <div className="flex-grow space-y-4 overflow-y-auto mb-6">
            {conversation.messages.map((message, index) => {
              const isCurrentUser = message.senderId === session?.user?.id;
              const messageDate = new Date(message.createdAt);

              // Show date divider if this is the first message or if the date is different from the previous message
              const showDateDivider =
                index === 0 ||
                new Date(conversation.messages[index - 1].createdAt).toDateString() !==
                  messageDate.toDateString();

              // Format the date
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

              return (
                <div key={message.id}>
                  {showDateDivider && (
                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <div className="mx-4 text-sm text-gray-500">{formatDate(messageDate)}</div>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                  )}
                  <motion.div
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">{messageDate.toLocaleTimeString()}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow text-[#333] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
