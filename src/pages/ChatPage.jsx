import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Users,
  ShieldCheck,
  Building2,
  Paperclip,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (!activeConversation && res.data.conversations.length > 0) {
          setActiveConversation(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${activeConversation._id}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
    }
  }, [activeConversation?._id, socket]);

  // Socket event listeners for real-time messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId === activeConversation?._id) {
        setMessages((prev) => [...prev, newMsg]);
      }
      fetchConversations();
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === activeConversation?._id) {
        setPartnerTyping(data.isTyping);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, activeConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    const msgText = inputMessage;
    setInputMessage('');

    try {
      const res = await api.post('/chat/messages', {
        conversationId: activeConversation._id,
        message: msgText,
      });

      if (res.data.success) {
        if (socket) {
          socket.emit('send_message', res.data.message);
        } else {
          setMessages((prev) => [...prev, res.data.message]);
        }
        fetchConversations();
      }
    } catch (err) {
      console.error('Send message failed:', err);
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    if (socket && activeConversation) {
      socket.emit('typing', {
        conversationId: activeConversation._id,
        userName: user?.name,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.otherParticipant?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#F8FAFC]">
      <div className="h-[750px] rounded-3xl bg-white shadow-card border border-[#E2E8F0] overflow-hidden grid grid-cols-1 md:grid-cols-3">
        
        {/* Left Sidebar: Conversations List */}
        <div className="border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col">
          
          <div className="p-4 border-b border-[#E2E8F0] space-y-3">
            <h2 className="text-base font-extrabold text-[#263247] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#647FE8]" />
              <span>Direct Messages</span>
            </h2>

            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {loadingConv ? (
              <div className="p-6 text-center text-xs text-[#64748B] animate-pulse">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] space-y-2">
                <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p>No active conversations found.</p>
                <p className="text-[11px] text-[#94A3B8]">
                  Visit the Alumni Directory to message mentors directly!
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.otherParticipant;
                const isActive = activeConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition ${
                      isActive ? 'bg-white border-l-4 border-[#647FE8] shadow-xs' : 'hover:bg-white/80'
                    }`}
                  >
                    <img
                      src={
                        partner?.profileImage ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${partner?.name || 'user'}`
                      }
                      alt=""
                      className="w-10 h-10 rounded-2xl object-cover border border-[#647FE8]/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#263247] truncate">
                          {partner?.name || 'User'}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(conv.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#647FE8] font-semibold truncate">
                        {partner?.jobTitle || partner?.department || partner?.role}
                      </p>
                      <p className="text-xs text-[#64748B] truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#647FE8] text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* Right Area: Active Message Stream */}
        <div className="md:col-span-2 flex flex-col bg-white">
          
          {activeConversation ? (
            <>
              {/* Partner Header */}
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      activeConversation.otherParticipant?.profileImage ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${activeConversation.otherParticipant?.name}`
                    }
                    alt=""
                    className="w-10 h-10 rounded-2xl object-cover border border-[#647FE8]/40"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[#263247]">
                        {activeConversation.otherParticipant?.name}
                      </h3>
                      {activeConversation.otherParticipant?.verified && (
                        <ShieldCheck className="w-4 h-4 text-[#647FE8]" />
                      )}
                    </div>
                    <p className="text-xs text-[#647FE8] font-medium">
                      {activeConversation.otherParticipant?.jobTitle} • {activeConversation.otherParticipant?.company || activeConversation.otherParticipant?.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Live
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
                {messages.map((msg) => {
                  const isMine =
                    msg.sender?._id === user?._id || msg.sender === user?._id;

                  return (
                    <div
                      key={msg._id || Math.random()}
                      className={`flex items-end gap-2.5 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={
                            msg.sender?.profileImage ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender?.name || 'sender'}`
                          }
                          alt=""
                          className="w-7 h-7 rounded-xl object-cover mb-1"
                        />
                      )}

                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed space-y-1 shadow-sm ${
                          isMine
                            ? 'bg-[#647FE8] text-white font-medium rounded-br-none'
                            : 'bg-[#F1F5F9] text-[#263247] rounded-bl-none border border-[#E2E8F0]'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <div
                          className={`text-[10px] flex items-center justify-end gap-1 ${
                            isMine ? 'text-blue-100' : 'text-[#94A3B8]'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {partnerTyping && (
                  <div className="text-xs text-[#64748B] italic animate-pulse flex items-center gap-2">
                    <span>{activeConversation.otherParticipant?.name} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleTyping}
                  placeholder="Type a message or discuss mentorship schedule..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-[#CBD5E1] text-xs sm:text-sm text-[#263247] placeholder-[#94A3B8] focus:outline-none focus:border-[#647FE8]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-3 rounded-2xl text-white bg-[#647FE8] hover:bg-[#4D68D9] shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#64748B] space-y-3">
              <MessageSquare className="w-12 h-12 text-[#94A3B8]" />
              <h3 className="text-base font-bold text-[#263247]">No Active Conversation Selected</h3>
              <p className="text-xs text-[#64748B] max-w-sm">
                Select an existing conversation from the sidebar or click "Message" on any alumni profile.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
