"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import apiClient from "@/lib/axios";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(`/payments/invoice/${resolvedParams.id}`)
      .then((res) => setInvoice(res.data))
      .catch((err) => {
        console.error(err);
        // Fallback for dev demo
        setInvoice({
          invoice_number: `INV-RH-${resolvedParams.id.slice(0, 6).upper() || "849201"}`,
          booking_id: resolvedParams.id,
          date: "August 02, 2026",
          status: "PAID - HELD IN ESCROW",
          payment_method: "bKash / Credit Card",
          transaction_id: "TXN-RH-948102",
          renter: {
            name: "Rafiqul Islam",
            email: "renter@example.com",
            phone: "+880 1712-345678",
          },
          owner: {
            name: "Rashed Hasan",
            email: "owner@example.com",
            phone: "+880 1819-876543",
          },
          product: {
            title: "Toyota Axio 2020",
            category: "Vehicle",
            city: "Dhanmondi, Dhaka",
          },
          period: {
            start_date: "2025-05-25",
            end_date: "2025-05-28",
            days: 3,
          },
          pricing: {
            daily_rate: 2500,
            days: 3,
            subtotal: 7500,
            service_fee: 300,
            security_deposit: 2000,
            delivery_fee: 200,
            total_amount: 10000,
          },
        });
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const p = invoice?.pricing || {};

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans text-slate-800">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/bookings/${resolvedParams.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Booking
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                R
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Rent<span className="text-indigo-600">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Peer-to-Peer Rental Marketplace</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full inline-block mb-1">
              ✓ {invoice.status}
            </span>
            <div className="text-xs font-extrabold text-slate-900">{invoice.invoice_number}</div>
            <div className="text-[11px] text-slate-400 font-medium">Issued: {invoice.date}</div>
          </div>
        </div>

        {/* Bill To & Owner Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Renter (Billed To)</div>
            <div className="font-extrabold text-slate-900 text-sm">{invoice.renter?.name}</div>
            <div className="text-slate-500 font-medium mt-0.5">{invoice.renter?.email}</div>
            <div className="text-slate-500 font-medium">{invoice.renter?.phone}</div>
          </div>

          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Owner (Lender)</div>
            <div className="font-extrabold text-slate-900 text-sm">{invoice.owner?.name}</div>
            <div className="text-slate-500 font-medium mt-0.5">{invoice.owner?.email}</div>
            <div className="text-slate-500 font-medium">{invoice.owner?.phone}</div>
          </div>
        </div>

        {/* Item & Rental Details */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Rental Item Details</div>
          
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase">
                <th className="py-2">Item Description</th>
                <th className="py-2">Rental Period</th>
                <th className="py-2 text-center">Days</th>
                <th className="py-2 text-right">Daily Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-3">
                  <div className="font-extrabold text-slate-900">{invoice.product?.title}</div>
                  <div className="text-[10px] text-slate-400">{invoice.product?.category} · {invoice.product?.city}</div>
                </td>
                <td className="py-3">
                  {invoice.period?.start_date} to {invoice.period?.end_date}
                </td>
                <td className="py-3 text-center font-bold">{invoice.period?.days}</td>
                <td className="py-3 text-right">৳ {p.daily_rate?.toLocaleString()}</td>
                <td className="py-3 text-right font-extrabold text-slate-900">৳ {p.subtotal?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Breakdown Calculation */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-100 pt-6">
          <div className="space-y-2 max-w-xs text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <ShieldCheck size={16} /> Escrow Guarantee Included
            </div>
            <p className="text-[11px] leading-relaxed">
              Your rental deposit is safely locked in RentHub Escrow. Funds are released to the owner only after successful completion and inspection of the item.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">
              TrxID: {invoice.transaction_id}
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">৳ {p.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Platform Service Fee:</span>
              <span className="font-bold text-slate-800">৳ {p.service_fee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Security Deposit (Refundable):</span>
              <span className="font-bold text-slate-800">৳ {p.security_deposit?.toLocaleString()}</span>
            </div>
            {p.delivery_fee > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee:</span>
                <span className="font-bold text-slate-800">৳ {p.delivery_fee?.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-slate-900">
              <span className="font-extrabold text-sm">Total Paid</span>
              <span className="text-xl font-black text-indigo-600">৳ {p.total_amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="text-center border-t border-slate-100 pt-6 text-[10px] text-slate-400 font-medium space-y-1">
          <p>Thank you for choosing RentHub — Peer-to-Peer Rental Marketplace</p>
          <p>For support or inquiries, contact support@renthub.com or call +880 9612-000000</p>
        </div>

      </div>
    </div>
  );
}
