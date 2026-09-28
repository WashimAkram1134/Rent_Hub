"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Tag,
  Calendar,
  Percent,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Trash2,
  Edit3,
  PauseCircle,
  PlayCircle,
  Clock,
  RefreshCw,
  Palette,
  Layout,
  Sun,
  Moon,
  Zap,
  Image as ImageIcon,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Sliders,
  CarFront,
  Camera,
  MonitorSmartphone,
  Building,
  Armchair,
  Trophy,
  Shirt,
  BookOpen,
} from "lucide-react";
import apiClient from "@/lib/axios";
import RentHubBannerRenderer, {
  DesignSpec,
  LockedOfferData,
} from "@/components/banners/RentHubBannerRenderer";

interface CampaignItem {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  discount_display: string;
  promo_code: string;
  applicable_categories: string[];
  target_audience: string;
  placement: string;
  cta_text: string;
  cta_url: string;
  start_at: string;
  end_at: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "PAUSED" | "EXPIRED";
  selected_template: string;
  design_spec_json: DesignSpec;
  variations_json: DesignSpec[];
  visual_asset_url?: string;
  campaign_theme: string;
  views_count: number;
  clicks_count: number;
  created_at: string;
}

const CATEGORY_OPTIONS = [
  { label: "Vehicles", icon: CarFront },
  { label: "Cameras", icon: Camera },
  { label: "Electronics", icon: MonitorSmartphone },
  { label: "Apartments", icon: Building },
  { label: "Furniture", icon: Armchair },
  { label: "Sports", icon: Trophy },
  { label: "Fashion", icon: Shirt },
  { label: "Books", icon: BookOpen },
];

const PLACEMENT_OPTIONS = [
  { label: "Homepage Hero Banner", value: "HOMEPAGE_HERO", desc: "Rotates in Explore & Rent hero carousel alongside other banners" },
  { label: "Deals & Offers Page", value: "DEALS_PAGE", desc: "Featured spotlight banner on /offers" },
];

export default function AIOfferStudioPage() {
  const [activeTab, setActiveTab] = useState<"studio" | "campaigns">("studio");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Form State ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState("Eid Rental Festival 2026");
  const [description, setDescription] = useState("Get 20% off selected verified rentals across Dhaka and Chittagong.");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [promoCode, setPromoCode] = useState("EID20");
  const [startAt, setStartAt] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });
  const [endAt, setEndAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 16);
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Vehicles", "Cameras"]);
  const [targetAudience, setTargetAudience] = useState("CUSTOMERS");
  const [ctaText, setCtaText] = useState("Explore Offers");
  const [ctaUrl, setCtaUrl] = useState("/offers");
  const [placement, setPlacement] = useState("HOMEPAGE_HERO");
  const [campaignTheme, setCampaignTheme] = useState("festive_eid");
  const [customImageUrl, setCustomImageUrl] = useState("");

  // ── AI Generation State ──────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [tweaking, setTweaking] = useState(false);
  const [variations, setVariations] = useState<DesignSpec[]>([]);
  const [selectedVariationIdx, setSelectedVariationIdx] = useState(0);
  const [activeSpec, setActiveSpec] = useState<DesignSpec | null>(null);

  // ── Publishing & Approval Modal ──────────────────────────────────────────
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // ── Fetch Existing Campaigns ─────────────────────────────────────────────
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const res = await apiClient.get("/offer-studio/campaigns");
      setCampaigns(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Fallback empty
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // Generate initial designs on mount
    handleGenerateDesigns();
  }, []);

  // ── Generate 3 Design Variations ─────────────────────────────────────────
  const handleGenerateDesigns = async () => {
    try {
      setGenerating(true);
      const effectiveCtaUrl =
        ctaUrl && ctaUrl !== "/offers" && !ctaUrl.startsWith("/search?categories=")
          ? ctaUrl
          : selectedCategories.length > 0
          ? `/search?categories=${encodeURIComponent(selectedCategories.join(","))}&promo=${encodeURIComponent(promoCode.trim().toUpperCase())}`
          : "/offers";

      const payload = {
        title,
        description,
        discount_type: discountType,
        discount_value: Number(discountValue) || 20,
        promo_code: promoCode,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        applicable_categories: selectedCategories,
        target_audience: targetAudience,
        cta_text: ctaText,
        cta_url: effectiveCtaUrl,
        placement,
        campaign_theme: campaignTheme || undefined,
        custom_image_url: customImageUrl || undefined,
      };

      const res = await apiClient.post("/offer-studio/generate", payload);
      if (res.data?.variations?.length) {
        setVariations(res.data.variations);
        setSelectedVariationIdx(0);
        setActiveSpec(res.data.variations[0]);
        showToast("✨ 3 Brand-Compliant Design Variations Generated!");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to generate designs. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Apply AI Quick Tweak ─────────────────────────────────────────────────
  const handleApplyTweak = async (action: string) => {
    if (!activeSpec) return;
    try {
      setTweaking(true);
      const res = await apiClient.post("/offer-studio/tweak", {
        design_spec: activeSpec,
        action,
        category: selectedCategories[0] || "Vehicles",
        campaign_theme: campaignTheme,
      });

      if (res.data?.design_spec) {
        setActiveSpec(res.data.design_spec);
        // Also update variation array
        const updated = [...variations];
        updated[selectedVariationIdx] = res.data.design_spec;
        setVariations(updated);
        showToast(`✨ Applied AI Action: ${action.replace(/_/g, " ")}`);
      }
    } catch {
      showToast("Error updating design specification.");
    } finally {
      setTweaking(false);
    }
  };

  // ── Save or Publish Campaign ─────────────────────────────────────────────
  const handleSaveCampaign = async (status: "DRAFT" | "PUBLISHED") => {
    if (!activeSpec) return;
    try {
      setPublishing(true);
      const effectiveCtaUrl =
        ctaUrl && ctaUrl !== "/offers" && !ctaUrl.startsWith("/search?categories=")
          ? ctaUrl
          : selectedCategories.length > 0
          ? `/search?categories=${encodeURIComponent(selectedCategories.join(","))}&promo=${encodeURIComponent(promoCode.trim().toUpperCase())}`
          : "/offers";

      const payload = {
        title,
        description,
        discount_type: discountType,
        discount_value: Number(discountValue),
        promo_code: promoCode.trim().toUpperCase(),
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        applicable_categories: selectedCategories,
        target_audience: targetAudience,
        cta_text: ctaText,
        cta_url: effectiveCtaUrl,
        placement,
        status,
        selected_template: activeSpec.template || "split_hero",
        design_spec_json: activeSpec,
        variations_json: variations,
        visual_asset_url: activeSpec.visual?.asset_url,
        campaign_theme: campaignTheme,
      };

      const res = await apiClient.post("/offer-studio/campaigns", payload);
      showToast(
        status === "PUBLISHED"
          ? "🚀 Campaign approved & published live to RentHub storefront!"
          : "💾 Campaign saved to drafts successfully."
      );
      setShowApprovalModal(false);
      fetchCampaigns();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to save campaign.");
    } finally {
      setPublishing(false);
    }
  };

  // ── Actions for Existing Campaigns ───────────────────────────────────────
  const handleToggleStatus = async (campaign: CampaignItem) => {
    try {
      if (campaign.status === "PUBLISHED") {
        await apiClient.post(`/offer-studio/campaigns/${campaign.id}/pause`);
        showToast(`Paused campaign: ${campaign.title}`);
      } else {
        await apiClient.post(`/offer-studio/campaigns/${campaign.id}/publish`);
        showToast(`Published campaign: ${campaign.title}`);
      }
      fetchCampaigns();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Action failed.");
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    try {
      await apiClient.delete(`/offer-studio/campaigns/${id}`);
      showToast("Campaign deleted successfully.");
      fetchCampaigns();
    } catch {
      showToast("Failed to delete campaign.");
    }
  };

  const handleLoadExistingIntoStudio = (campaign: CampaignItem) => {
    setTitle(campaign.title);
    setDescription(campaign.description);
    setDiscountType(campaign.discount_type as any);
    setDiscountValue(campaign.discount_value);
    setPromoCode(campaign.promo_code);
    setSelectedCategories(campaign.applicable_categories || []);
    setTargetAudience(campaign.target_audience || "CUSTOMERS");
    setCtaText(campaign.cta_text);
    setCtaUrl(campaign.cta_url);
    setPlacement(campaign.placement);
    setCampaignTheme(campaign.campaign_theme);
    if (campaign.design_spec_json) {
      setActiveSpec(campaign.design_spec_json);
      setVariations(campaign.variations_json?.length ? campaign.variations_json : [campaign.design_spec_json]);
      setSelectedVariationIdx(0);
    }
    setActiveTab("studio");
    showToast(`Loaded campaign "${campaign.title}" into Studio`);
  };

  const activeBusinessData: LockedOfferData = {
    title,
    description,
    discount_display: discountType === "PERCENTAGE" ? `${discountValue}% OFF` : `৳${discountValue} OFF`,
    promo_code: promoCode,
    valid_until: new Date(endAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    cta_text: ctaText,
    cta_url: ctaUrl,
    applicable_categories: selectedCategories,
    target_audience: targetAudience,
    placement,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-violet-500/40 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-violet-400 shrink-0 animate-spin-slow" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Header & Navigation ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Offer Studio</h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  Business Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Generate brand-compliant, high-converting promotional banners in seconds without design skills.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "studio"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={14} />
            <span>Offer Studio</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("campaigns");
              fetchCampaigns();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "campaigns"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers size={14} />
            <span>Campaigns</span>
            {campaigns.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-violet-100 text-violet-700 text-[10px]">
                {campaigns.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "studio" ? (
        /* ── STUDIO VIEW ─────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Offer Details Form (Inputs Only) ─────────────── */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Step 1 — Provide Offer Information</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Zero design knowledge needed</span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Offer Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Eid Rental Festival 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-slate-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Promotional Description *</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Get 20% off selected rentals with verified hosts across Bangladesh."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-slate-900 resize-none"
              />
            </div>

            {/* Discount & Promo Code Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Value *</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-l-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-bold text-slate-900"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="px-2.5 py-2.5 bg-slate-50 border-y border-r border-slate-200 rounded-r-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="PERCENTAGE">% OFF</option>
                    <option value="FIXED_AMOUNT">৳ Flat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Promo Coupon Code *</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="e.g. EID20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono font-bold tracking-wider text-violet-700 uppercase"
                />
              </div>
            </div>

            {/* Start Date & Expiration Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Valid Until *</label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Applicable Categories */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Applicable Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map(({ label, icon: Icon }) => {
                  const active = selectedCategories.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleCategory(label)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? "bg-violet-50 border-violet-500 text-violet-700 shadow-sm"
                          : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={14} className={active ? "text-violet-600" : "text-slate-400"} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience & Banner Placement */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="CUSTOMERS">Renters & Customers</option>
                  <option value="OWNERS">Owners & Hosts</option>
                  <option value="STUDENTS">Students & Campus</option>
                  <option value="EVERYONE">Everyone (Universal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Placement</label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA Text & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">CTA Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">CTA URL Destination</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Campaign Theme */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Theme (Optional Hint)</label>
              <select
                value={campaignTheme}
                onChange={(e) => setCampaignTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="festive_eid">🌙 Eid & Festive Holiday</option>
                <option value="dark_luxury">💎 Dark Luxury & VIP Gear</option>
                <option value="monsoon_adventure">🌧️ Monsoon & Roadtrip Adventure</option>
                <option value="winter_wonder">❄️ Winter & New Year Pass</option>
                <option value="student_season">🎓 Student & Creator Special</option>
                <option value="flash_surge">⚡ High-Urgency Flash Sale</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateDesigns}
              disabled={generating}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Design System...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate 3 Design Variations ✨</span>
                </>
              )}
            </button>
          </div>

          {/* ── Right Column: AI Variations & Live Interactive Canvas ──────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 2: 3 Variations Selector */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-violet-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Step 2 — Pick a Design Variation</h3>
                </div>
                <span className="text-[11px] text-slate-400">All 3 preserve your locked business facts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {variations.map((v, idx) => {
                  const isSelected = selectedVariationIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedVariationIdx(idx);
                        setActiveSpec(v);
                      }}
                      className={`cursor-pointer rounded-xl p-3.5 border-2 transition-all text-left relative overflow-hidden ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/50 shadow-md ring-2 ring-violet-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-violet-600 text-white">
                          <Check size={12} />
                        </div>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        Option 0{idx + 1}
                      </span>
                      <p className="text-xs font-extrabold text-slate-900 line-clamp-1">{v.variation_label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                        Template: {v.template.replace(/_/g, " ")}
                      </p>

                      {/* Mini preview bar */}
                      <div
                        className="mt-2.5 h-1.5 rounded-full w-full"
                        style={{
                          background: `linear-gradient(90deg, ${v.palette?.bg_primary || "#111827"} 0%, ${
                            v.palette?.accent || "#6366f1"
                          } 100%)`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Live Interactive Canvas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Step 3 — Live Canvas Preview</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Deterministic Render
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Placement: <span className="font-bold text-slate-800">{placement.replace(/_/g, " ")}</span>
                </div>
              </div>

              {/* Banner Rendering Area */}
              <div className="relative">
                {activeSpec ? (
                  <RentHubBannerRenderer
                    spec={activeSpec}
                    businessData={activeBusinessData}
                    placement={placement}
                    isPreview={true}
                  />
                ) : (
                  <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    Click "Generate Design" to create preview
                  </div>
                )}
              </div>

              {/* Step 4: AI Tweak Actions Toolbar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                    <Sparkles size={13} className="text-violet-600" />
                    <span>AI Quick Actions (Refine Design Spec)</span>
                  </div>
                  {tweaking && (
                    <span className="text-[10px] text-violet-600 font-bold flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" />
                      Adjusting tokens...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyTweak("make_more_premium")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-300 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <span>💎 Make More Premium</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTweak("make_offer_prominent")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <span>⚡ Make Offer Bigger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTweak("make_more_minimal")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <span>⚪ More Minimal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTweak("change_visual")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <ImageIcon size={13} className="text-blue-500" />
                    <span>Change Visual Asset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTweak("change_layout")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <Layout size={13} className="text-indigo-500" />
                    <span>Switch Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTweak("switch_dark_theme")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-800 hover:text-white text-slate-700 text-xs font-semibold transition-all"
                  >
                    <Moon size={13} />
                    <span>Dark Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyTweak("switch_light_theme")}
                    disabled={tweaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-100 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <Sun size={13} />
                    <span>Light Theme</span>
                  </button>
                </div>
              </div>

              {/* Step 5: Save Draft & Publish Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveCampaign("DRAFT")}
                  disabled={publishing || !activeSpec}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Save as Draft
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowApprovalModal(true)}
                    disabled={publishing || !activeSpec}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ShieldCheck size={16} />
                    <span>Review & Publish Live 🚀</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── CAMPAIGNS MANAGER VIEW ───────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">All Scheduled & Published Campaigns</h2>
              <p className="text-xs text-slate-500">
                Manage promotional offers generated by AI Offer Studio.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("studio")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-all shadow-md"
            >
              <Sparkles size={14} />
              <span>Create New Offer</span>
            </button>
          </div>

          {loadingCampaigns ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              <span className="text-xs">Loading campaign registry...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No campaigns created yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use the AI Offer Studio to design your first promotional campaign in 30 seconds.
              </p>
              <button
                onClick={() => setActiveTab("studio")}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs"
              >
                Launch Studio
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-3">Offer Title & Code</th>
                    <th className="py-3 px-3">Discount</th>
                    <th className="py-3 px-3">Placement</th>
                    <th className="py-3 px-3">Schedule</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {campaigns.map((c) => {
                    const isLive = c.status === "PUBLISHED";
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-violet-700 font-extrabold bg-violet-50 px-2 py-0.5 rounded border border-violet-200 text-[11px]">
                              {c.promo_code}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {c.applicable_categories?.join(", ") || "All Categories"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-slate-900">
                          {c.discount_display}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            {c.placement.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock size={12} className="text-slate-400" />
                            <span>
                              {new Date(c.start_at).toLocaleDateString()} — {new Date(c.end_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              c.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.status === "SCHEDULED"
                                ? "bg-blue-100 text-blue-800"
                                : c.status === "PAUSED"
                                ? "bg-amber-100 text-amber-800"
                                : c.status === "EXPIRED"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.status === "PUBLISHED"
                                  ? "bg-emerald-500 animate-pulse"
                                  : c.status === "SCHEDULED"
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleLoadExistingIntoStudio(c)}
                              title="Edit in Studio"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(c)}
                              title={isLive ? "Pause Campaign" : "Publish Campaign"}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isLive
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {isLive ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCampaign(c.id, c.title)}
                              title="Delete Campaign"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SAFETY APPROVAL MODAL ─────────────────────────────────────────── */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Campaign Approval & Publish</h3>
                  <p className="text-xs text-slate-500">Confirm business terms before pushing to production</p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Locked Facts Verification Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verified Business Facts (Source of Truth)
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  LOCKED & ENFORCED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Campaign Title:</span>
                  <span className="font-bold text-slate-900">{title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Promo Code:</span>
                  <span className="font-mono font-extrabold text-violet-700">{promoCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Discount:</span>
                  <span className="font-bold text-emerald-600">
                    {discountType === "PERCENTAGE" ? `${discountValue}% OFF` : `৳${discountValue} Flat`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Placement:</span>
                  <span className="font-semibold text-slate-800">{placement.replace(/_/g, " ")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Active Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(startAt).toLocaleString()} until {new Date(endAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed bg-blue-50 p-3.5 rounded-xl border border-blue-200/70 text-blue-900">
              ℹ️ <strong>System Note:</strong> Once published, this offer will immediately be delivered to users
              at the designated placement. An immutable audit record will be logged with your administrator signature.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Back to Editing
              </button>
              <button
                type="button"
                onClick={() => handleSaveCampaign("PUBLISHED")}
                disabled={publishing}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {publishing ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                <span>Confirm & Publish Live 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
