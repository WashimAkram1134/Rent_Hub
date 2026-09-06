"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/authStore";
import api from "@/lib/axios";
import { Booking } from "@/types";
import ChatWidget from "@/features/bookings/components/ChatWidget";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Booking[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      try {
        const [renterRes, ownerRes] = await Promise.all([
          api.get(`/bookings?renter_id=${user.id}`),
          api.get(`/bookings?owner_id=${user.id}`)
        ]);
        
        // Combine and deduplicate if there are overlapping results
        const combined = [...renterRes.data, ...ownerRes.data];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        // Sort by created_at descending (latest first)
        unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setConversations(unique);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  if (!user) return null;

  const activeBooking = conversations.find(b => b.id === activeBookingId);
  const otherUser = activeBooking ? (activeBooking.renter?.id === user.id ? activeBooking.owner : activeBooking.renter) : null;

  return (
    <div className="p-4 sm:p-6 font-sans bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      
      {/* Back Button */}
      <div className="max-w-[1200px] mx-auto mb-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex h-[750px]">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" /> Inbox
            </h2>
            <p className="text-xs text-slate-500 mt-1">Select a booking to start chatting</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No conversations found.</div>
            ) : (
              conversations.map((booking) => {
                const isRenter = booking.renter?.id === user.id;
                const contact = (isRenter ? booking.owner : booking.renter) || { first_name: "Host", last_name: "", avatar_url: null };
                const isActive = activeBookingId === booking.id;
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => setActiveBookingId(booking.id)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                      isActive ? "bg-indigo-50 border-indigo-100" : "hover:bg-slate-50 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0 text-indigo-700 font-bold text-sm">
                        {contact.avatar_url ? (
                          <img src={contact.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>
                            {contact.first_name?.[0] || "U"}{contact.last_name?.[0] || ""}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-slate-800 text-sm truncate">
                            {contact.first_name || "User"} {contact.last_name || ""}
                          </h4>
                          <span className="text-[9px] font-medium text-slate-400">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate font-medium">
                          {booking.product?.title || "Booking"}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isRenter ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {isRenter ? "Renting" : "Lending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 bg-white flex flex-col">
          {activeBooking && otherUser ? (
            <div className="h-full flex flex-col">
               <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-10">
                 <div>
                   <Link href={`/bookings/${activeBooking.id}`} className="hover:underline">
                     <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                       {activeBooking.product?.title}
                       <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${activeBooking.status === 'approved' || activeBooking.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                         {activeBooking.status.toUpperCase()}
                       </span>
                     </h3>
                   </Link>
                   <p className="text-[11px] text-slate-500 mt-0.5">Booking ID: {activeBooking.id.substring(0, 8).toUpperCase()}</p>
                 </div>
                 <Link href={`/bookings/${activeBooking.id}`} className="text-indigo-600 text-[11px] font-bold flex items-center gap-1 hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                   View Booking
                 </Link>
               </div>
               
               {/* Embed ChatWidget here, we can set h-full because it natively manages its height now, wait ChatWidget has h-[500px] hardcoded, let's fix it later or it's fine */}
               <div className="flex-1 p-4 bg-slate-50">
                 <ChatWidget bookingId={activeBooking.id} otherUser={otherUser} />
               </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm flex-col gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <MessageSquare size={32} className="text-slate-300" />
              </div>
              Select a conversation to start messaging
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
