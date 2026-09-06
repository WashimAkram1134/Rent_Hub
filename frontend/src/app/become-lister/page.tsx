"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  UploadCloud,
  FileText,
  User,
  MapPin,
  Tag,
  DollarSign,
  Sparkles,
  Lock,
  ChevronRight,
  RefreshCw,
  Building2,
  Check,
  X,
  Phone,
  Mail,
  CarFront,
  Camera,
  Laptop,
  Layers,
  Award,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";

const CATEGORY_OPTIONS = [
  { id: "vehicles", label: "Cars & Vehicles", icon: "🚗" },
  { id: "cameras", label: "Cameras & Lenses", icon: "📷" },
  { id: "electronics", label: "Laptops & Electronics", icon: "💻" },
  { id: "furniture", label: "Home & Furniture", icon: "🛋️" },
  { id: "fashion", label: "Fashion & Costumes", icon: "👔" },
  { id: "sports", label: "Sports & Camping", icon: "⛺" },
  { id: "tools", label: "Tools & Equipment", icon: "🛠️" },
  { id: "spaces", label: "Apartments & Spaces", icon: "🏢" },
];

export default function BecomeListerPage() {
  const router = useRouter();
  const { user, isAuthenticated, setActiveRole, refreshUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState<{
    is_owner: boolean;
    lister_status: string;
    application: any;
  } | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [postalCode, setPostalCode] = useState("");
  const [idType, setIdType] = useState("National ID (NID)");
  const [idNumber, setIdNumber] = useState("");
  const [idFrontUrl, setIdFrontUrl] = useState("");
  const [idBackUrl, setIdBackUrl] = useState("");
  const [experienceBio, setExperienceBio] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["vehicles", "cameras"]);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get("/lister-applications/my-status");
      setStatusData(res.data);

      if (res.data?.application) {
        const app = res.data.application;
        setFullName(app.full_name || "");
        setEmail(app.email || "");
        setPhone(app.phone || "");
        setBusinessName(app.business_name || "");
        setAddressLine(app.address_line || "");
        setCity(app.city || "Dhaka");
        setPostalCode(app.postal_code || "");
        setIdType(app.id_type || "National ID (NID)");
        setIdNumber(app.id_number || "");
        setIdFrontUrl(app.id_front_url || "");
        setIdBackUrl(app.id_back_url || "");
        setExperienceBio(app.experience_bio || "");
        setSelectedCategories(app.categories_intended || ["vehicles", "cameras"]);
      } else if (user) {
        setFullName(`${user.first_name || ""} ${user.last_name || ""}`.trim());
        setEmail(user.email || "");
        setPhone(user.phone || "");
      }
    } catch (err) {
      console.error("Failed to fetch lister status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [isAuthenticated, user]);

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleFileUpload = async (file: File, side: "front" | "back") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (side === "front") setUploadingFront(true);
      else setUploadingBack(true);

      const res = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        if (side === "front") setIdFrontUrl(uploadedUrl);
        else setIdBackUrl(uploadedUrl);
      }
    } catch (err: any) {
      alert("Failed to upload document image. Please try again.");
    } finally {
      if (side === "front") setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName || !email || !phone || !addressLine || !idNumber) {
      setErrorMsg("Please fill in all required fields (Name, Email, Phone, Address, ID Number).");
      return;
    }

    if (!agreedTerms) {
      setErrorMsg("Please accept the Owner & Lister Terms of Service to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        business_name: businessName || null,
        address_line: addressLine,
        city,
        postal_code: postalCode || null,
        country: "Bangladesh",
        id_type: idType,
        id_number: idNumber,
        id_front_url: idFrontUrl || null,
        id_back_url: idBackUrl || null,
        experience_bio: experienceBio || null,
        categories_intended: selectedCategories,
        agreed_terms: true,
      };

      await apiClient.post("/lister-applications/apply", payload);
      setSuccessMsg("Your application has been submitted successfully!");
      setIsEditing(false);
      await fetchStatus();
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Submission failed. Please check your details.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = statusData?.is_owner || user?.is_owner || user?.primary_role === "owner" || user?.role_names?.includes("owner");
  const isPending = !isOwner && statusData?.lister_status === "pending";
  const isRejected = !isOwner && statusData?.lister_status === "rejected";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Top Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-400" />
              <span>RentHub Lister Partner Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Turn Your Idle Assets into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-200">Daily Earnings</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal">
              List your cars, cameras, laptops, furniture, and tools on Bangladesh&apos;s trusted peer-to-peer rental network. Keep renting as a customer while earning as an owner.
            </p>

            {/* Quick Benefits Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Zero Listing Fees</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <ShieldCheck size={15} className="text-blue-400" />
                <span>৳50,000 Damage Protection</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <DollarSign size={15} className="text-amber-400" />
                <span>Fast Bank & bKash Payouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
          {/* If Not Authenticated */}
          {!isAuthenticated ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <User size={32} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Sign in to become a Lister</h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  You don&apos;t need a new account! Sign in with your existing customer account, and we will enable Lister & Owner features for you once verified.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/login?returnUrl=/become-lister"
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  Log In & Apply <ArrowRight size={16} />
                </Link>
                <Link
                  href="/register?returnUrl=/become-lister"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-all"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          ) : isOwner ? (
            /* ── STATE: APPROVED OWNER ── */
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-70" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Award size={32} />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md mb-1.5">
                      <CheckCircle2 size={12} /> Verified Lister Partner
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900">You are an Approved Owner!</h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-lg">
                      Your account has full Customer + Owner dual access. You can list items, accept booking requests, and request payouts.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setActiveRole("owner");
                      router.push("/dashboard");
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                  >
                    <CarFront size={16} /> Open Owner Dashboard
                  </button>
                  <Link
                    href="/products/new"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Add New Listing
                  </Link>
                </div>
              </div>
            </div>
          ) : isPending && !isEditing ? (
            /* ── STATE: APPLICATION UNDER REVIEW ── */
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-amber-200/80 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock size={24} className="animate-spin duration-3000" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Application Under Review
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">We are verifying your documents</h2>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
                >
                  <RefreshCw size={13} /> Update Submitted Info
                </button>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
                    <CheckCircle2 size={16} /> 1. Application Submitted
                  </div>
                  <p className="text-[11px] text-slate-600">Profile & ID documents received</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 ring-2 ring-amber-400/20">
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-1">
                    <Clock size={16} /> 2. Admin Review
                  </div>
                  <p className="text-[11px] text-slate-600">Manual ID & security verification (within 24h)</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 opacity-75">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                    <ShieldCheck size={16} /> 3. Owner Mode Enabled
                  </div>
                  <p className="text-[11px] text-slate-500">Instant access to add & rent listings</p>
                </div>
              </div>

              {/* Application Snapshot */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Submitted Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Applicant:</span>{" "}
                    <span className="font-semibold text-slate-800">{statusData?.application?.full_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>{" "}
                    <span className="font-semibold text-slate-800">{statusData?.application?.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Location:</span>{" "}
                    <span className="font-semibold text-slate-800">{statusData?.application?.city}, {statusData?.application?.address_line}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Document:</span>{" "}
                    <span className="font-semibold text-slate-800">{statusData?.application?.id_type} ({statusData?.application?.id_number})</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── STATE: APPLICATION FORM (New or Reapplying) ── */
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8">
              {/* Rejection Alert if applicable */}
              {isRejected && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3 text-rose-900">
                  <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-sm">Application Revision Required</p>
                    <p className="text-rose-700">{statusData?.application?.rejection_reason || "Please update your submitted details and verify your ID document."}</p>
                    <p className="text-slate-500 text-[11px] pt-1">You can fix the info below and submit your application again.</p>
                  </div>
                </div>
              )}

              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isEditing ? "Update Lister Application" : "Lister Partner Application"}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Complete your verification to list items and receive rental payouts.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" /> {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" /> {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* ── STEP 1: Personal & Contact Information ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                    <h3>Personal & Contact Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Legal Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Washim Akram"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. washim@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1712 345678"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Business / Rental Name (Optional)</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Dhaka Prime Rentals"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── STEP 2: Location & Address ── */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                    <h3>Location & Address</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address / Area *</label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="e.g. House 14, Road 5, Dhanmondi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barisal">Barisal</option>
                        <option value="Rangpur">Rangpur</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── STEP 3: Identity Verification ── */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                    <h3>Identity & Trust Verification</h3>
                  </div>
                  <p className="text-slate-500 text-xs">
                    To maintain trust on RentHub, all listers must provide a valid government-issued ID.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Type *</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                      >
                        <option value="National ID (NID)">National ID (NID)</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Trade License">Trade License / Business Reg</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">ID / Document Number *</label>
                      <input
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="e.g. 19942692589000123"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* ID Upload Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Front Upload */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-300 transition-colors">
                      <input
                        type="file"
                        ref={frontFileRef}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "front")}
                        className="hidden"
                      />
                      {idFrontUrl ? (
                        <div className="relative group">
                          <img
                            src={idFrontUrl}
                            alt="Front Document"
                            className="w-full h-32 object-cover rounded-xl border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setIdFrontUrl("")}
                            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg shadow"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => frontFileRef.current?.click()}
                          className="py-4 cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <UploadCloud size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-indigo-600">
                            {uploadingFront ? "Uploading..." : "Upload Document Front"}
                          </span>
                          <span className="text-[10px] text-slate-400">JPG, PNG (Max 5MB)</span>
                        </div>
                      )}
                    </div>

                    {/* Back Upload */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-300 transition-colors">
                      <input
                        type="file"
                        ref={backFileRef}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "back")}
                        className="hidden"
                      />
                      {idBackUrl ? (
                        <div className="relative group">
                          <img
                            src={idBackUrl}
                            alt="Back Document"
                            className="w-full h-32 object-cover rounded-xl border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setIdBackUrl("")}
                            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg shadow"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => backFileRef.current?.click()}
                          className="py-4 cursor-pointer flex flex-col items-center justify-center gap-1.5"
                        >
                          <UploadCloud size={24} className="text-slate-400" />
                          <span className="text-xs font-bold text-indigo-600">
                            {uploadingBack ? "Uploading..." : "Upload Document Back"}
                          </span>
                          <span className="text-[10px] text-slate-400">JPG, PNG (Optional for passport)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── STEP 4: Rental Categories & Bio ── */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                    <h3>What items do you plan to rent out?</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm"
                              : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/60"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                          {isSelected && <Check size={14} className="text-indigo-600 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Lister Experience / Bio (Optional)</label>
                    <textarea
                      rows={3}
                      value={experienceBio}
                      onChange={(e) => setExperienceBio(e.target.value)}
                      placeholder="Tell customers a bit about your items, experience, or rental policies..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* ── STEP 5: Terms & Submit ── */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I agree to the <span className="font-bold text-slate-900">RentHub Owner & Lister Terms</span>. I certify that all listed items are authentic, functional, and in good condition, and I agree to comply with platform safety, cancellation, and payout policies.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Lister Application <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
