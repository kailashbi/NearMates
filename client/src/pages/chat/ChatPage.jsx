import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportModal from '../../components/common/ReportModal';
import {
  MessageSquare,
  Send,
  Users,
  Calendar,
  AlertCircle,
  Wifi,
  WifiOff,
  Smile,
  Flag
} from 'lucide-react';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const activityParam = searchParams.get('activity');
  const userParam = searchParams.get('user');

  const { profile } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeDirect, setActiveDirect] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myActivities, setMyActivities] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user's conversations and approved activities
  useEffect(() => {
    async function initChat() {
      setLoading(true);
      try {
        const [convRes, actRes] = await Promise.all([
          api.get('/chat/conversations'),
          api.get('/activities')
        ]);
        setConversations(convRes.data.items || []);

        // Filter activities where user is host or member
        const myActs = (actRes.data.items || []).filter(
          a => a.hostProfileId === profile?.profileId || a.isHost
        );
        setMyActivities(actRes.data.items || []);

        // If activityParam is passed in URL, load it
        if (activityParam) {
          const act = actRes.data.items?.find(a => a.activityId === activityParam);
          if (act) {
            selectActivityChat(act);
          } else {
            // Fetch direct
            const single = await api.get(`/activities/${activityParam}`);
            selectActivityChat(single.data);
          }
        } else if (userParam) {
          // Start direct conversation
          const startRes = await api.post('/chat/conversations', { targetProfileId: userParam });
          const targetProf = await api.get(`/users/${userParam}`);
          selectDirectChat({
            conversationId: startRes.data.conversationId,
            partner: targetProf.data
          });
        } else if (actRes.data.items?.length > 0) {
          selectActivityChat(actRes.data.items[0]);
        }
      } catch (err) {
        console.error('Failed to init chat:', err);
      } finally {
        setLoading(false);
      }
    }
    initChat();
  }, [activityParam, userParam, profile]);

  const selectActivityChat = async (act) => {
    setActiveDirect(null);
    setActiveActivity(act);
    setMessages([]);
    try {
      const res = await api.get(`/chat/activities/${act.activityId}/messages`);
      setMessages(res.data.items || []);
      // Join socket room
      if (socket) {
        socket.emit('join_activity', { activityId: act.activityId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectDirectChat = async (conv) => {
    setActiveActivity(null);
    setActiveDirect(conv);
    setMessages([]);
    try {
      const res = await api.get(`/chat/conversations/${conv.conversationId}/messages`);
      setMessages(res.data.items || []);
      if (socket) {
        socket.emit('direct:join', { conversationId: conv.conversationId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeActivity && msg.activityId === activeActivity.activityId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleDirectMessage = (msg) => {
      if (activeDirect && msg.conversationId === activeDirect.conversationId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleActivityTyping = ({ profileId, displayName, isTyping }) => {
      if (isTyping && profileId !== profile?.profileId) {
        setTypingUser(displayName);
      } else {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_created', handleNewMessage);
    socket.on('direct:new_message', handleDirectMessage);
    socket.on('activity:typing', handleActivityTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_created', handleNewMessage);
      socket.off('direct:new_message', handleDirectMessage);
      socket.off('activity:typing', handleActivityTyping);
    };
  }, [socket, activeActivity, activeDirect, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const text = content.trim();
    setContent('');

    if (activeActivity) {
      if (socket && isConnected) {
        socket.emit('activity:send_message', {
          activityId: activeActivity.activityId,
          content: text
        });
      } else {
        // Fallback to REST
        try {
          const res = await api.post(`/chat/activities/${activeActivity.activityId}/messages`, {
            content: text
          });
          setMessages(prev => [...prev, res.data]);
        } catch (err) {
          console.error(err);
        }
      }
    } else if (activeDirect) {
      if (socket && isConnected) {
        socket.emit('direct:send_message', {
          conversationId: activeDirect.conversationId,
          recipientProfileId: activeDirect.partner?.profileId,
          content: text
        });
      } else {
        try {
          const res = await api.post(`/chat/conversations/${activeDirect.conversationId}/messages`, {
            content: text
          });
          setMessages(prev => [...prev, res.data]);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] bg-white rounded-card border border-slate-border shadow-card flex overflow-hidden">
      {/* Sidebar Channels / Conversations */}
      <div className="w-full sm:w-80 border-r border-slate-border flex flex-col justify-between bg-slate-50/50">
        <div className="p-4 border-b border-slate-border">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-navy">Chat & Coordination</h2>
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
              {isConnected ? (
                <span className="flex items-center text-emerald-600" title="Socket.IO connected">
                  <Wifi className="w-3.5 h-3.5 mr-1" /> Live
                </span>
              ) : (
                <span className="flex items-center text-amber-600" title="Connecting...">
                  <WifiOff className="w-3.5 h-3.5 mr-1" /> Reconnecting
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Section: Activity Group Chats */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Activity Group Chats
            </p>
            <div className="space-y-1">
              {myActivities.map((act) => {
                const isSelected = activeActivity?.activityId === act.activityId;
                return (
                  <button
                    key={act.activityId}
                    onClick={() => selectActivityChat(act)}
                    className={`w-full text-left p-2.5 rounded-btn transition-colors flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'hover:bg-slate-100 text-navy'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-primary-light text-primary'
                    }`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{act.title}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {act.categoryName || act.category} • {act.participantCount || 1} members
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Direct 1-on-1 Chats */}
          {conversations.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Direct Messages
              </p>
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const isSelected = activeDirect?.conversationId === conv.conversationId;
                  const isOnline = onlineUsers.has(conv.partner?.profileId);
                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => selectDirectChat(conv)}
                      className={`w-full text-left p-2.5 rounded-btn transition-colors flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-primary text-white shadow-sm'
                          : 'hover:bg-slate-100 text-navy'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.partner?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{conv.partner?.displayName}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {conv.lastMessage?.content || 'Say hi!'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Conversation View */}
      <div className="hidden sm:flex flex-1 flex-col justify-between bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-border flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {activeActivity ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy truncate">{activeActivity.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    Activity Group • {activeActivity.locationName}
                  </p>
                </div>
              </>
            ) : activeDirect ? (
              <>
                <img
                  src={activeDirect.partner?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-navy truncate">{activeDirect.partner?.displayName}</h3>
                  <p className="text-[11px] text-slate-500">Direct Message</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">Select a conversation</p>
            )}
          </div>

          {(activeDirect || activeActivity) && (
            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex items-center space-x-1"
              title={activeActivity ? "Report this activity" : "Report member for harassment or abusive messages"}
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline text-[11px] font-bold text-slate-600 hover:text-rose-600">Report</span>
            </button>
          )}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
              <p>No messages yet. Send a message to get things started!</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.senderProfileId === profile?.profileId || m.senderId === profile?.profileId;
              const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={m.messageId || idx} className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <img
                      src={m.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover mb-1 flex-shrink-0"
                    />
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-primary text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 text-navy rounded-bl-none'
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold text-primary mb-0.5">{m.senderName}</p>}
                    <p className="whitespace-pre-line">{m.content}</p>
                    <span className={`text-[9px] mt-1 block text-right ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                      {time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {typingUser && (
            <p className="text-[11px] text-slate-400 italic">
              {typingUser} is typing...
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-border flex items-center space-x-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message to teammates..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-btn text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-btn transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType={activeActivity ? 'activity' : 'user'}
        targetId={activeActivity ? activeActivity.activityId : activeDirect?.partner?.profileId}
        targetName={activeActivity ? activeActivity.title : activeDirect?.partner?.displayName}
        defaultCategory={activeActivity ? 'suspicious_activity' : 'abusive_message'}
      />
    </div>
  );
}

