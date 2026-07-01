"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Image as ImageIcon, Search, MessageSquare } from "lucide-react";
import Image from "next/image";
import { replyToConversation } from "@/app/actions/messages";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatConversation {
  id: string;
  updated_at: string;
  interlocutor: { id: string; name: string | null; avatar_url: string | null };
  program: { id: string; title_ar: string; cover_image_url: string | null };
  messages: Message[];
}

interface ChatUIProps {
  initialConversations: ChatConversation[];
  currentUserId: string;
  currentUserRole: "admin" | "student";
}

export function ChatUI({ initialConversations, currentUserId, currentUserRole }: ChatUIProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(
    initialConversations.map(c => ({
      ...c,
      messages: c.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }))
  );
  
  const [activeConvId, setActiveConvId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    // Scroll to bottom when active conversation changes or new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleReply = () => {
    if (!replyText.trim() || !activeConvId) return;

    const content = replyText.trim();
    setReplyText("");

    // Optimistic UI update
    const tempMsg: Message = {
      id: Math.random().toString(),
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setConversations(prev => 
      prev.map(c => {
        if (c.id === activeConvId) {
          return { ...c, messages: [...c.messages, tempMsg], updated_at: new Date().toISOString() };
        }
        return c;
      }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );

    startTransition(async () => {
      const result = await replyToConversation(activeConvId, content);
      if (result.error) {
        alert(result.error);
        // Ideally, revert the optimistic update here
      }
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
        <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={40} />
        </div>
        <h3 className="text-xl font-bold mb-2">لا توجد رسائل بعد</h3>
        <p className="text-text-secondary max-w-sm">
          عندما يقوم الطلاب بالاستفسار عن برامجك التعليمية، ستظهر رسائلهم هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="card flex overflow-hidden border border-gray-200 dark:border-gray-800 h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Right Column: Conversations List */}
      <div className="w-1/3 min-w-[280px] border-e border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="البحث في المحادثات..."
              className="w-full bg-gray-50 text-gray-900 dark:text-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isUnread = lastMsg && lastMsg.sender_id !== currentUserId && !lastMsg.is_read;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-start p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex gap-3 ${activeConvId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                  {conv.interlocutor.name?.[0]?.toUpperCase() || (currentUserRole === "admin" ? "م" : "ج")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {conv.interlocutor.name || (currentUserRole === "admin" ? "طالب" : "جهة تعليمية")}
                    </h4>
                    {lastMsg && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {new Date(lastMsg.created_at).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate mb-1">
                    {conv.program.title_ar}
                  </div>
                  {lastMsg && (
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                      {lastMsg.sender_id === currentUserId ? "أنت: " : ""}{lastMsg.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Left Column: Active Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 relative">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                {activeConv.interlocutor.name?.[0]?.toUpperCase() || (currentUserRole === "admin" ? "م" : "ج")}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{activeConv.interlocutor.name || (currentUserRole === "admin" ? "طالب مستفسر" : "الجهة التعليمية")}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  استفسار بخصوص: <span className="font-semibold text-blue-600 dark:text-blue-400">{activeConv.program.title_ar}</span>
                </div>
              </div>
            </div>
            {activeConv.program.cover_image_url && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shrink-0 hidden md:block">
                <Image src={activeConv.program.cover_image_url} alt="Cover" width={48} height={48} className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('/pattern.png')] bg-repeat bg-opacity-5">
            {activeConv.messages.map((msg, idx) => {
              const isCurrentUser = msg.sender_id === currentUserId;
              const showAvatar = idx === 0 || activeConv.messages[idx - 1].sender_id !== msg.sender_id;

              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isCurrentUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
                  {showAvatar ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto
                      ${isCurrentUser ? 'bg-blue-600 text-white dark:bg-blue-700' : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'}
                    `}>
                      {isCurrentUser ? "أنت" : (activeConv.interlocutor.name?.[0]?.toUpperCase() || (currentUserRole === "admin" ? "م" : "ج"))}
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                  
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 px-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed
                      ${isCurrentUser 
                        ? 'bg-blue-600 text-white dark:bg-blue-700 dark:text-white rounded-bl-sm' 
                        : 'bg-gray-100 text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 rounded-br-sm'}
                    `}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-end gap-2">
              <button className="p-3 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors shrink-0">
                <ImageIcon size={20} />
              </button>
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
                placeholder="اكتب ردك هنا... (اضغط Enter للإرسال)"
                rows={1}
                className="w-full bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none max-h-32 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button 
                onClick={handleReply}
                disabled={!replyText.trim() || isPending}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 rounded-xl transition-colors shrink-0 disabled:opacity-50"
              >
                <Send size={20} className={document.dir === 'rtl' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>اختر محادثة للبدء في المراسلة</p>
          </div>
        </div>
      )}
    </div>
  );
}
