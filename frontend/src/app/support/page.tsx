"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  FileQuestion,
  ShieldCheck,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export default function SupportPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("payout");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    showToast("Support ticket #TK-4819 created! Our Dhaka operations team will respond within 2 hours.");
    setSubject("");
    setMessage("");
  };

  const faqs = [
    {
      q: "When and how do I receive payouts for my rented items?",
      a: "Payouts are automatically disbursed bi-weekly to your registered bank account (BRAC Bank, City Bank, etc.) or bKash merchant account. Earnings are net of the 10% platform fee.",
    },
    {
      q: "What happens if a renter damages or returns my item late?",
      a: "Every booking includes a mandatory refundable security deposit held in platform escrow. In case of damage or delay, you can file a dispute within 48 hours to claim the full deposit plus insurance coverage.",
    },
    {
      q: "Is government NID face verification mandatory for renters?",
      a: "Yes, RentHub strictly enforces AI biometric face match and government NID verification before renters can pickup high-value vehicles, cameras, and luxury electronics.",
    },
  ];

  return (
    <AppShell>
      <div className="p-6 font-sans text-slate-800 space-y-6 pb-16">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Sparkles size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Help & Owner Support</h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                24/7 Dedicated Concierge
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Get assistance with booking disputes, payout schedules, damage claims, and listing optimization
            </p>
          </div>
        </div>

        {/* 3 Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Phone size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Host Hotline</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">+880 1700-112233</h3>
              <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Available 9 AM – 10 PM</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Owner Support Email</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">support@renthub.com.bd</h3>
              <p className="text-purple-600 text-[11px] font-semibold mt-0.5">Under 2 hours response</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Host Guarantee Program</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">৳ 500,000 Cover</h3>
              <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">Damage Protection</p>
            </div>
          </div>
        </div>

        {/* Ticket Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Ticket */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Open an Official Support Ticket</h3>
              <p className="text-xs text-slate-400">Describe your inquiry and our team will contact you</p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="payout">Payout & Disbursal Inquiry</option>
                  <option value="damage">Damage Claim / Escrow Dispute</option>
                  <option value="renter">Renter Verification / Late Return</option>
                  <option value="listing">Listing Approval & Category Assignment</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiry regarding Aug 16-25 Payout Settlement"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide all details including booking ID, customer name, or item title..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Send size={14} />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-400">Common questions from RentHub item hosts</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <FileQuestion size={14} className="text-indigo-600 shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
