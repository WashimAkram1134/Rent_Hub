"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import api from "@/lib/axios";
import { Message, User } from "@/types";
import { useAuthStore } from "@/features/auth/authStore";
import { useWebSocket } from "@/providers/WebSocketProvider";

interface ChatWidgetProps {
  bookingId: string;
  otherUser: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">;
}

export default function ChatWidget({ bookingId, otherUser }: ChatWidgetProps) {
  const { user } = useAuthStore();
  const { latestMessage } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${bookingId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();
  }, [bookingId]);

  useEffect(() => {
    if (latestMessage && latestMessage.booking_id === bookingId) {
      setMessages((prev) => {
        // Prevent duplicates if REST API returned it first
        if (prev.some(m => m.id === latestMessage.id)) return prev;
        return [...prev, latestMessage];
      });
    }
  }, [latestMessage, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    try {
      const res = await api.post("/messages", {
        booking_id: bookingId,
        receiver_id: otherUser.id,
        content: newMessage.trim(),
      });
      // The websocket might also push this, but we update locally first for responsiveness
      setMessages((prev) => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm h-full min-h-[500px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
           {otherUser.avatar_url ? (
             <img src={otherUser.avatar_url} alt="avatar" className="w-full h-full object-cover" />
           ) : (
             <span className="text-slate-500 font-bold text-sm">
               {otherUser.first_name?.[0] || ""}{otherUser.last_name?.[0] || ""}
             </span>
           )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{otherUser.first_name} {otherUser.last_name}</h3>
          <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center px-4">
            No messages yet. Send a message to start the conversation!
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isMine 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-[9px] mt-1 text-right ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100 rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
