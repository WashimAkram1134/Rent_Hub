"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  ShieldCheck,
  Eye,
  ExternalLink,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  Layers,
  Truck,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import apiClient from "@/lib/axios";

export interface AdminListingReviewModalProps {
  product: any | null;
  onClose: () => void;
  onActionComplete?: (productId: string, action: "approve" | "changes" | "reject") => void;
  showToast?: (message: string) => void;
}

export function AdminListingReviewModal({
  product,
  onClose,
  onActionComplete,
  showToast,
}: AdminListingReviewModalProps) {
  const [fullProduct, setFullProduct] = useState<any>(product);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Operator Checklist
  const [checklist, setChecklist] = useState({
    info: true,
    images: true,
    category: true,
  });

  // Moderation Action State
  const [reviewAction, setReviewAction] = useState<"approve" | "changes" | "reject" | null>(null);
  const [reviewRejectReason, setReviewRejectReason] = useState<string>("Poor or blurry images");
  const [reviewNote, setReviewNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch full product details if available to ensure we have owner info, images, etc.
  useEffect(() => {
    if (!product?.id) return;
    setFullProduct(product);
    setLoadingDetails(true);
    setErrorMessage(null);
    setSelectedImageIndex(0);
    setReviewAction(null);
    setReviewNote("");

    apiClient
      .get(`/products/${product.id}`)
      .then((res) => {
        if (res.data) {
          setFullProduct(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load extended product details, fallback to initial item:", err);
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [product?.id]);

  // Extract all images
  const allImages = useMemo(() => {
    if (!fullProduct) return [];
    const list: string[] = [];

    if (Array.isArray(fullProduct.images) && fullProduct.images.length > 0) {
      fullProduct.images.forEach((img: any) => {
        const url = typeof img === "string" ? img : img?.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }

    if (fullProduct.image_url && !list.includes(fullProduct.image_url)) {
      list.unshift(fullProduct.image_url);
    }

    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80");
    }

    return list;
  }, [fullProduct]);

  if (!product) return null;

  // Normalize owner info
  const owner = fullProduct.owner || {};
  const ownerName =
    fullProduct.owner_name ||
    (owner.first_name || owner.last_name
      ? `${owner.first_name || ""} ${owner.last_name || ""}`.trim()
      : "Verified Host");
  const ownerEmail = fullProduct.owner_email || owner.email || "Not specified";
  const ownerPhone = owner.phone || "Not specified";
  const isOwnerVerified =
    owner.is_identity_verified ||
    owner.identity_verification_status === "APPROVED" ||
    owner.identity_verification_status === "VERIFIED";

  // Category name
  const categoryName = fullProduct.category?.name || fullProduct.category_name || "Rental Asset";

  // Handle Form Submission
  const handleExecuteReview = async () => {
    if (!reviewAction) return;

    if (reviewAction === "changes" && !reviewNote.trim()) {
      setErrorMessage("Please enter an explanation of the revisions the owner needs to make.");
      return;
    }

    if (reviewAction === "reject" && !reviewNote.trim()) {
      setErrorMessage("Please enter an explanation note to the owner for rejection.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const targetStatus =
        reviewAction === "approve"
          ? "APPROVED"
          : reviewAction === "changes"
          ? "PENDING"
          : "REJECTED";

      const payload = {
        status: targetStatus,
        review_action: reviewAction,
        reject_reason: reviewAction === "reject" ? reviewRejectReason : undefined,
        review_note: reviewNote.trim() || undefined,
      };

      await apiClient.patch(`/products/${fullProduct.id}/status`, payload);

      const msg =
        reviewAction === "approve"
          ? `Listing "${fullProduct.title}" approved and published to marketplace!`
          : reviewAction === "changes"
          ? `Revision request sent to owner for "${fullProduct.title}".`
          : `Listing "${fullProduct.title}" has been rejected.`;

      if (showToast) {
        showToast(msg);
      }

      if (onActionComplete) {
        onActionComplete(fullProduct.id, reviewAction);
      }

      onClose();
    } catch (err: any) {
      console.error("Failed to update listing status:", err);
      setErrorMessage(
        err.response?.data?.detail || "Failed to update listing status. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-white dark:bg-[#111625] rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                {categoryName}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Pending Approval
              </span>
              {loadingDetails && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Loading specs...
                </span>
              )}
            </div>
            <h3
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 truncate"
              title={fullProduct.title}
            >
              Review Listing: {fullProduct.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close review modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Row: Photo Gallery & Core Rental Economics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left side: Images (5 cols) */}
            <div className="md:col-span-5 space-y-2">
              <div className="w-full h-52 sm:h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                <img
                  src={allImages[selectedImageIndex] || allImages[0]}
                  alt={fullProduct.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80";
                  }}
                  className="w-full h-full object-cover transition-transform group-hover:scale-102"
                />
                <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Photo {selectedImageIndex + 1} of {allImages.length}
                </span>
              </div>

              {/* Thumbnails if multiple images */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? "border-indigo-600 ring-2 ring-indigo-500/20"
                          : "border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Key Pricing & Specs (7 cols) */}
            <div className="md:col-span-7 space-y-3.5">
              {/* Financial Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">
                    Rental Rate
                  </span>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                    ৳{Number(fullProduct.price_per_day || 0).toLocaleString()}
                    <span className="text-xs font-normal text-slate-500"> / day</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider">
                    Security Deposit
                  </span>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                    ৳{Number(fullProduct.security_deposit || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Badges: Condition, Location, Delivery */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  <Package size={13} className="text-slate-400" />
                  <span>Condition: <strong className="capitalize">{fullProduct.condition?.replace("_", " ") || "Good"}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  <MapPin size={13} className="text-slate-400" />
                  <span>
                    {fullProduct.area ? `${fullProduct.area}, ` : ""}
                    {fullProduct.city || "Dhaka"}
                  </span>
                </div>

                {fullProduct.delivery_option && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    <Truck size={13} className="text-slate-400" />
                    <span>Delivery: <strong className="capitalize">{fullProduct.delivery_option}</strong></span>
                  </div>
                )}
              </div>

              {/* Owner Profile Snippet */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-xs">
                    {ownerName.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ownerName}
                      </p>
                      {isOwnerVerified && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                          Verified Host
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      <span className="flex items-center gap-0.5 truncate">
                        <Mail size={10} /> {ownerEmail}
                      </span>
                      {ownerPhone !== "Not specified" && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Phone size={10} /> {ownerPhone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                  Item Owner
                </span>
              </div>
            </div>
          </div>

          {/* Description Provided by Owner */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Item Description (Submitted by Owner)
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
              {fullProduct.description || "No description provided by host."}
            </div>
          </div>

          {/* 3-Point Operator Quality Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-indigo-600" />
              Listing Verification & Quality Checklist
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.info}
                  onChange={(e) => setChecklist({ ...checklist, info: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px]">Rental terms & rate valid</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.images}
                  onChange={(e) => setChecklist({ ...checklist, images: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px]">Photos sharp & authentic</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.category}
                  onChange={(e) => setChecklist({ ...checklist, category: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px]">Category correctly assigned</span>
              </label>
            </div>
          </div>

          {/* Action Selector: Approve, Request Changes, Reject */}
          <div className="space-y-3 pt-1">
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Select Moderation Action
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setReviewAction("approve")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  reviewAction === "approve"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                }`}
              >
                <CheckCircle size={15} />
                <span>Approve Listing</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewAction("changes")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  reviewAction === "changes"
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/20"
                    : "border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                }`}
              >
                <SlidersHorizontal size={15} />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewAction("reject")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  reviewAction === "reject"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/20"
                    : "border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                }`}
              >
                <XCircle size={15} />
                <span>Reject Listing</span>
              </button>
            </div>

            {/* Sub-form: Rejection reason & note */}
            {reviewAction === "reject" && (
              <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-bold text-rose-900 dark:text-rose-300 block mb-1">
                    Rejection Reason
                  </label>
                  <select
                    value={reviewRejectReason}
                    onChange={(e) => setReviewRejectReason(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Poor or blurry images">Poor or blurry images</option>
                    <option value="Incorrect category or misleading title">Incorrect category or misleading title</option>
                    <option value="Misleading item description">Misleading item description</option>
                    <option value="Inappropriate or prohibited item">Inappropriate or prohibited item</option>
                    <option value="Pricing or deposit issue">Pricing or deposit issue</option>
                    <option value="Suspected fraudulent or duplicate listing">Suspected fraudulent or duplicate listing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-rose-900 dark:text-rose-300 block mb-1">
                    Explanation Note to Owner *
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="e.g. Please upload clear photos showing all angles of the item and verify your deposit amount..."
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Sub-form: Request Changes note */}
            {reviewAction === "changes" && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  Revision Note to Owner *
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Please update the security deposit and provide the brand model number in the description..."
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* Link to view public customer preview in a NEW TAB without leaving admin mode */}
            <a
              href={`/products/${fullProduct.slug || fullProduct.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Open public marketplace view in a new browser tab"
            >
              <span>Preview Customer View</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/listings"
              className="px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
            >
              Manage in Listings
            </Link>

            <button
              type="button"
              disabled={!reviewAction || isSubmitting}
              onClick={handleExecuteReview}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                reviewAction === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : reviewAction === "changes"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : reviewAction === "reject"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-slate-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              <span>
                {reviewAction === "approve"
                  ? "Confirm Approval & Publish"
                  : reviewAction === "changes"
                  ? "Send Revision Request"
                  : reviewAction === "reject"
                  ? "Confirm Rejection"
                  : "Select Action Above"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
