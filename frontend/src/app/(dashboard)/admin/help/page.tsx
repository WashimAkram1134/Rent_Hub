"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Scale,
  DollarSign,
  Package,
  AlertTriangle,
  FileText,
  Users,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Printer,
  Copy,
} from "lucide-react";
import Link from "next/link";

interface SOPItem {
  id: string;
  category: "moderation" | "disputes" | "finance" | "verification" | "governance";
  title: string;
  estimatedTime: string;
  priority: "High" | "Medium" | "Standard";
  summary: string;
  targetPage: string;
  targetPageLabel: string;
  steps: {
    title: string;
    description: string;
    warning?: string;
  }[];
  operatorRules: string[];
}

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sopLibrary: SOPItem[] = [
    {
      id: "sop-listing-review",
      category: "moderation",
      title: "How to Evaluate and Moderate New Listings",
      estimatedTime: "2–3 mins per item",
      priority: "High",
      summary: "Quality control criteria for approving, requesting host changes, or rejecting new rental inventory.",
      targetPage: "/admin/listings",
      targetPageLabel: "Go to Listings Moderation",
      steps: [
        {
          title: "1. Inspect Image Quality & Authenticity",
          description: "Verify that the host provided at least 2 clear, well-lit photos of the actual item. Check for watermarks, manufacturer stock renders, or blurry photos.",
          warning: "Never approve listings that use generic Google/Amazon product stock photos without real item shots."
        },
        {
          title: "2. Check Price vs Benchmark",
          description: "Ensure the daily rental price aligns with market norms in Bangladesh (e.g., standard DSLR camera: ৳ 1,500–3,500/day; Sedan car: ৳ 3,500–6,500/day).",
        },
        {
          title: "3. Verify Prohibited Items Policy",
          description: "Confirm the item is legal and safe. Prohibited items include firearms, weapons, illegal narcotics, counterfeit goods, or hazardous chemicals.",
          warning: "Immediately reject and report any prohibited item to Trust & Safety."
        },
        {
          title: "4. Select Operator Action",
          description: "If all 3 checklist points pass, click 'Approve Listing'. If minor photos are needed, click 'Request Changes' with a polite note. If prohibited or spam, click 'Reject' with reason code."
        }
      ],
      operatorRules: [
        "Aim to review all submitted listings within 4 hours of submission.",
        "Always provide a friendly explanation when requesting changes so the host knows what to fix.",
        "Check that the correct category and regional city hub is selected."
      ]
    },
    {
      id: "sop-dispute-resolution",
      category: "disputes",
      title: "Two-Sided Damage & Dispute Adjudication",
      estimatedTime: "10–15 mins per case",
      priority: "High",
      summary: "Neutral evidence evaluation process to resolve disputes between renters and hosts fairly.",
      targetPage: "/admin/disputes",
      targetPageLabel: "Go to Disputes Resolution",
      steps: [
        {
          title: "1. Compare Check-in vs Return Evidence",
          description: "Open the dispute in the Two-Sided Dispute Console. Inspect timestamped photos submitted by the host during item handover and compare against photos taken at return.",
          warning: "Pre-existing scratches or cosmetic scuffs visible at check-in cannot be charged to the renter."
        },
        {
          title: "2. Distinguish Wear & Tear vs Negligence",
          description: "Normal wear (light scratches on camera handles, normal tire dust) is an expected cost of rental. Broken screens, water damage, or lost lenses constitute actionable damage.",
        },
        {
          title: "3. Calculate Fair Compensation",
          description: "If damage is confirmed, deduct only the proven repair/replacement invoice from the renter's security deposit. Release remaining balance to renter.",
        },
        {
          title: "4. Issue Adjudication & Audit Note",
          description: "Select the appropriate resolution: 'Full Refund to Customer', 'Partial Refund / Split', or 'Release Payout to Owner'. You must type a comprehensive operator reasoning note."
        }
      ],
      operatorRules: [
        "Maintain total neutrality. Do not favor hosts over renters or vice-versa.",
        "Both parties automatically receive your operator resolution note.",
        "In cases exceeding ৳ 25,000 in dispute, escalate to Senior Operations Manager before issuing refunds."
      ]
    },
    {
      id: "sop-host-verification",
      category: "verification",
      title: "Host Identity (NID / Passport) Verification SOP",
      estimatedTime: "3–5 mins per applicant",
      priority: "High",
      summary: "Validating Bangladesh National ID cards, Passports, and biometric selfie checks.",
      targetPage: "/admin/users",
      targetPageLabel: "Go to Users & Identity",
      steps: [
        {
          title: "1. Inspect Government Document Legibility",
          description: "Verify that all 4 corners of the Smart NID card or Passport are visible. Check that the name, NID number, and date of birth match the account details.",
        },
        {
          title: "2. Check AI Biometric Face Match",
          description: "Inspect the automated facial confidence score. Scores above 85% indicate verified likeness between the official ID photo and live camera selfie.",
          warning: "If face match is below 70%, request a clearer re-submission with better lighting."
        },
        {
          title: "3. Business Host Documentation",
          description: "For commercial fleet owners or rental studios, verify Trade License (City Corporation / Union Parishad) number.",
        },
        {
          title: "4. Grant Verified Host Status",
          description: "Click 'Approve & Mark Verified'. This automatically activates the trusted green badge on their public profile."
        }
      ],
      operatorRules: [
        "Ensure all identity documents remain strictly confidential and protected.",
        "Never share raw NID numbers in customer support chats.",
        "Revoke verification immediately if identity fraud or forged documents are detected."
      ]
    },
    {
      id: "sop-payout-disbursal",
      category: "finance",
      title: "Host Payout Disbursal & Bank Reconciliation",
      estimatedTime: "5 mins per batch",
      priority: "Medium",
      summary: "Safely disbursing held escrow funds to host bank accounts or MFS wallets (bKash/Nagad).",
      targetPage: "/admin/payouts",
      targetPageLabel: "Go to Host Payouts",
      steps: [
        {
          title: "1. Confirm 24-Hour Rental Hold Period",
          description: "Verify that the booking ended at least 24 hours ago and no open disputes or damage claims are pending from either party.",
        },
        {
          title: "2. Verify Beneficiary Destination",
          description: "Inspect the destination details: Bank Name, Routing Number, Account Number, or verified bKash/Nagad Merchant/Personal wallet.",
          warning: "Do not disburse payouts if the bank account name differs completely from the verified user's legal name."
        },
        {
          title: "3. Validate Net Commission Calculation",
          description: "Ensure platform commission (10%) and tax deductions have been applied automatically to the gross subtotal.",
        },
        {
          title: "4. Authorize Disbursal via Double-Confirmation",
          description: "Click 'Release Payout', review the confirmation dialog showing gross and net amounts, and confirm. Print voucher for weekly accounting."
        }
      ],
      operatorRules: [
        "Payout batches are processed daily at 11:00 AM and 04:00 PM.",
        "If a bank EFTN transfer bounces, mark status as 'On Hold' and alert the host via SMS.",
        "Never enter arbitrary payout amounts manually; always rely on escrow calculations."
      ]
    },
    {
      id: "sop-promotions",
      category: "governance",
      title: "Launching Deals & Marketing Campaigns",
      estimatedTime: "5 mins",
      priority: "Standard",
      summary: "Creating seasonal promo codes, discount percentages, and category flash banners.",
      targetPage: "/admin/promotions",
      targetPageLabel: "Go to Deals & Promotions",
      steps: [
        {
          title: "1. Determine Campaign Scope",
          description: "Define campaign title (e.g., 'Eid Ul Adha Travel Deals'), target audience, and discount percentage (recommended: 10%–20%).",
        },
        {
          title: "2. Check Platform Margin",
          description: "Ensure platform service fee and host commission maintain a positive net contribution margin during discount period.",
        },
        {
          title: "3. Choose Theme Color & Visual Banner",
          description: "Select a banner image and vibrant accent theme color for storefront showcase.",
        },
        {
          title: "4. Set Scheduling Dates",
          description: "Configure campaign start date and auto-expiration timestamp. Click 'Create Campaign' to publish."
        }
      ],
      operatorRules: [
        "Avoid running overlapping discounts on the same product category.",
        "Review promotional redemption rates in Reports & Analytics after 48 hours."
      ]
    },
    {
      id: "sop-user-suspension",
      category: "governance",
      title: "Account Suspension & Trust Escalation SOP",
      estimatedTime: "5 mins",
      priority: "High",
      summary: "Graduated enforcement actions when dealing with policy breaches or fraudulent activity.",
      targetPage: "/admin/users",
      targetPageLabel: "Go to User Management",
      steps: [
        {
          title: "1. Review Evidence & History",
          description: "Open the user's 360° Profile Drawer. Check their past dispute frequency, customer review ratings, and previous warnings.",
        },
        {
          title: "2. Select Proportional Sanction",
          description: "Level 1: Polite advisory warning (via in-app notification). Level 2: 7-Day Cooling Off Suspension. Level 3: 30-Day Extended Suspension. Level 4: Permanent Termination.",
          warning: "Permanent bans should only be applied for fraud, dangerous prohibited items, or repeated willful contract breaches."
        },
        {
          title: "3. Log Mandatory Operator Justification",
          description: "Select the appropriate reason code and provide detailed notes in the suspension dialog. This is recorded in the activity audit trail."
        },
        {
          title: "4. Freeze Active Inventory & Outgoing Payouts",
          description: "Suspending the account automatically hides their listings from search and holds outgoing payouts until resolution."
        }
      ],
      operatorRules: [
        "Every suspended user has the right to appeal via support@renthub.com.bd.",
        "Reactivating an account requires written review and confirmation from an Admin.",
        "Do not delete user records permanently unless mandated by GDPR/privacy regulations; suspension preserves audit trails."
      ]
    }
  ];

  // Filtering
  const filteredSops = sopLibrary.filter((sop) => {
    const matchesCategory = selectedCategory === "all" || sop.category === selectedCategory;
    const matchesSearch =
      sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.steps.some((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/admin/help#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Operator Help Center & SOP Guidelines
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Operating Procedures for non-technical marketplace operators. Run daily operations safely and consistently.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>Print SOP Manual</span>
          </button>
        </div>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-5 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 rounded-2xl shrink-0">
            <PhoneCall size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
              Crisis & Technical Escalations
            </span>
            <h3 className="font-extrabold text-white text-base">Need Immediate Technical or Legal Support?</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Contact Platform Operations Lead: +880 1700-112233 | Database Incident Desk: ops@renthub.com.bd
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 text-xs font-bold border border-white/10">
            Internal Operations Only
          </span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedures (e.g., 'dispute', 'damage photos', 'payout hold')..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
          {[
            { id: "all", label: "All Procedures" },
            { id: "moderation", label: "Moderation" },
            { id: "disputes", label: "Disputes" },
            { id: "verification", label: "Identity & Trust" },
            { id: "finance", label: "Payouts & Escrow" },
            { id: "governance", label: "Governance" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* SOP Procedures Accordion / Cards */}
      <div className="space-y-6">
        {filteredSops.map((sop) => (
          <div
            key={sop.id}
            id={sop.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:shadow-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {sop.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sop.priority === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Priority: {sop.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {sop.estimatedTime}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{sop.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">{sop.summary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyLink(sop.id)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy link to this procedure"
                >
                  {copiedId === sop.id ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
                <Link
                  href={sop.targetPage}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>{sop.targetPageLabel}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Content: Steps + Rules */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Step-by-Step Procedure */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Step-by-Step Execution
                </h4>
                <div className="space-y-3.5">
                  {sop.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl border border-slate-200/70 bg-white hover:border-indigo-200 transition-colors space-y-1.5"
                    >
                      <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0">
                          {i + 1}
                        </span>
                        <span>{st.title}</span>
                      </h5>
                      <p className="text-xs text-slate-600 pl-7 leading-relaxed">{st.description}</p>
                      {st.warning && (
                        <div className="ml-7 mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-start gap-2">
                          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <span>{st.warning}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Operator Policy & Ground Rules */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Golden Operator Rules
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  {sop.operatorRules.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                    Need Help With This Step?
                  </span>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    Always confirm with the senior supervisor if a transaction involves suspected credit card fraud or high-value vehicle total loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredSops.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <HelpCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-800 text-base">No Matching Procedures Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try a different search query or select "All Procedures".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
