"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Camera,
  MapPin,
  Tag,
  Image as ImageIcon,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  UploadCloud,
  X,
  Link as LinkIcon,
  Plus,
  Star,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";

export interface ListingPhoto {
  id: string;
  url: string;
  tag: "front" | "back" | "inside" | "side" | "detail" | "other";
  isPrimary: boolean;
}

const PHOTO_TAGS: { value: ListingPhoto["tag"]; label: string; icon: string; desc: string }[] = [
  { value: "front", label: "Front View", icon: "🚗", desc: "Main / Cover angle" },
  { value: "back", label: "Back View", icon: "🔙", desc: "Rear / Back angle" },
  { value: "inside", label: "Inside / Interior", icon: "💺", desc: "Cabin / Cockpit / Screen" },
  { value: "side", label: "Side View", icon: "🚘", desc: "Left / Right profile" },
  { value: "detail", label: "Close-up / Specs", icon: "🔍", desc: "Accessories or details" },
  { value: "other", label: "Other Angle", icon: "📸", desc: "Additional view" },
];

export default function AddListingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [categories, setCategories] = useState<{ id: string; name: string; slug?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "link">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [urlTag, setUrlTag] = useState<ListingPhoto["tag"]>("front");

  // Multi-photo state
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent("/products/new")}`);
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    condition: "Excellent",
    description: "",
    price_per_day: "",
    security_deposit: "",
    city: "Dhaka",
    area: "",
    delivery_option: "Pickup Only",
  });

  useEffect(() => {
    apiClient.get("/cms/categories")
      .then((res) => {
        const data = res.data || [];
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
        }
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to suggest next available tag
  const getNextSuggestedTag = (currentPhotos: ListingPhoto[]): ListingPhoto["tag"] => {
    const usedTags = new Set(currentPhotos.map((p) => p.tag));
    if (!usedTags.has("front")) return "front";
    if (!usedTags.has("back")) return "back";
    if (!usedTags.has("inside")) return "inside";
    if (!usedTags.has("side")) return "side";
    if (!usedTags.has("detail")) return "detail";
    return "other";
  };

  // Upload single or multiple files
  const handleFilesUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formDataObj = new FormData();
        formDataObj.append("file", file);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/v1/upload`, {
          method: "POST",
          body: formDataObj,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        }
      }
      addUploadedPhotos(uploadedUrls);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image(s). Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addUploadedPhotos = (urls: string[]) => {
    setPhotos((prev) => {
      let current = [...prev];
      urls.forEach((url) => {
        const nextTag = getNextSuggestedTag(current);
        const isFirst = current.length === 0;
        current.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url,
          tag: nextTag,
          isPrimary: isFirst,
        });
      });
      return current;
    });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setPhotos((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: urlInput.trim(),
        tag: urlTag,
        isPrimary: prev.length === 0,
      },
    ]);
    setUrlInput("");
    setUrlTag(getNextSuggestedTag([...photos, { id: "temp", url: urlInput, tag: urlTag, isPrimary: false }]));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      handleFilesUpload(files);
    }
  };

  const setAsCover = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      const rest = prev.filter((p) => p.id !== id);
      return [
        { ...target, isPrimary: true },
        ...rest.map((p) => ({ ...p, isPrimary: false })),
      ];
    });
  };

  const updatePhotoTag = (id: string, newTag: ListingPhoto["tag"]) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tag: newTag } : p))
    );
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const movePhoto = (idx: number, direction: "left" | "right") => {
    setPhotos((prev) => {
      const copy = [...prev];
      const targetIdx = direction === "left" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((p, i) => ({ ...p, isPrimary: i === 0 }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      alert("Please upload at least one photo (e.g. Front View) for your listing.");
      return;
    }

    setLoading(true);

    try {
      const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];
      const orderedPhotos = [primaryPhoto, ...photos.filter((p) => p.id !== primaryPhoto.id)];
      const imageUrls = orderedPhotos.map((p) => p.url);

      const payload = {
        ...formData,
        price_per_day: parseFloat(formData.price_per_day),
        security_deposit: parseFloat(formData.security_deposit || "0"),
        image_url: primaryPhoto.url,
        images: imageUrls,
        owner_id: user?.id,
        status: "PENDING",
      };

      await apiClient.post("/products", payload);

      setSuccess(true);
      setTimeout(() => {
        router.push("/listings");
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const hasFront = photos.some((p) => p.tag === "front");
  const hasBack = photos.some((p) => p.tag === "back");
  const hasInside = photos.some((p) => p.tag === "inside");

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Listing Submitted!</h1>
        <p className="text-slate-500">Your item has been submitted for approval and added to your rental listings.</p>
        <p className="text-sm text-slate-400 mt-2">Redirecting you to your listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16">
      <Navbar />

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-2">Add New Listing</h1>
          <p className="text-slate-500 text-sm">Upload multiple views (Front, Back, Inside) to unlock 360° view & get 3x more bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Tag size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">General Information</h2>
                <p className="text-xs text-slate-400">Title, category, and condition of your item</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Item Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Sony Alpha A7 IV Camera, Toyota Allion Sedan 2018..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                  >
                    <option>Brand New</option>
                    <option>Like New / Mint</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item, key features, package inclusions, and rental rules..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Location */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pricing & Location</h2>
                <p className="text-xs text-slate-400">Set daily rental rate and pickup zone</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Price Per Day (BDT ৳) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    name="price_per_day"
                    required
                    value={formData.price_per_day}
                    onChange={handleChange}
                    placeholder="1500"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Security Deposit (BDT ৳)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    name="security_deposit"
                    value={formData.security_deposit}
                    onChange={handleChange}
                    placeholder="3000 (Refundable)"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                >
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                  <option>Rajshahi</option>
                  <option>Khulna</option>
                  <option>Barisal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Dhanmondi, Gulshan, Uttara..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Delivery</label>
                <select
                  name="delivery_option"
                  value={formData.delivery_option}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium"
                >
                  <option>Pickup Only</option>
                  <option>Delivery Available</option>
                  <option>Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Multi-Photos (Front, Back, Inside) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <Camera size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Photos & Angles
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      {photos.length} Added
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Upload multiple angles: Front, Back, Inside, Side</p>
                </div>
              </div>

              {/* Angle Checklist Badges */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <span className={`px-2 py-1 rounded-lg border flex items-center gap-1 ${hasFront ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {hasFront ? <Check size={12} className="stroke-[3]" /> : "○"} Front
                </span>
                <span className={`px-2 py-1 rounded-lg border flex items-center gap-1 ${hasBack ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {hasBack ? <Check size={12} className="stroke-[3]" /> : "○"} Back
                </span>
                <span className={`px-2 py-1 rounded-lg border flex items-center gap-1 ${hasInside ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {hasInside ? <Check size={12} className="stroke-[3]" /> : "○"} Inside
                </span>
              </div>
            </div>

            {/* Tip Banner */}
            <div className="mb-6 p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
              <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <p>
                <span className="font-bold">Pro Tip:</span> Uploading <span className="font-extrabold text-indigo-700">Front</span>, <span className="font-extrabold text-indigo-700">Back</span>, and <span className="font-extrabold text-indigo-700">Inside</span> photos enables the interactive 360° angle switcher on your listing and boosts renter confidence!
              </p>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod("upload")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  uploadMethod === "upload"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <UploadCloud size={15} /> Upload Multiple Files / Paste
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("link")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  uploadMethod === "link"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <LinkIcon size={15} /> Add Image Link
              </button>
            </div>

            {/* Upload Method: Link input */}
            {uploadMethod === "link" && (
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 pl-9 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-xs"
                    />
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  </div>
                  <select
                    value={urlTag}
                    onChange={(e) => setUrlTag(e.target.value as any)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none"
                  >
                    {PHOTO_TAGS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shrink-0"
                  >
                    + Add Photo
                  </button>
                </div>
              </div>
            )}

            {/* Multi-Photo Grid (Existing Photos) */}
            {photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
                {photos.map((photo, index) => {
                  return (
                    <div
                      key={photo.id}
                      className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 shadow-sm flex flex-col ${
                        photo.isPrimary
                          ? "border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10"
                          : "border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {/* Thumbnail container */}
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                        <img
                          src={photo.url}
                          alt={photo.tag}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Overlay Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                          {photo.isPrimary ? (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                              <Star size={10} className="fill-white" /> Primary Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAsCover(photo.id)}
                              className="bg-black/60 hover:bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm transition-all"
                            >
                              Make Cover
                            </button>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-sm"
                            title="Remove this photo"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        {/* Order Reorder Controls */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-0.5 rounded-lg">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => movePhoto(index, "left")}
                            className="p-1 text-white disabled:opacity-30 hover:text-indigo-300"
                            title="Move photo earlier"
                          >
                            <ArrowLeft size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={index === photos.length - 1}
                            onClick={() => movePhoto(index, "right")}
                            className="p-1 text-white disabled:opacity-30 hover:text-indigo-300"
                            title="Move photo later"
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Tag Selector Bar */}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Angle:
                        </span>
                        <select
                          value={photo.tag}
                          onChange={(e) => updatePhotoTag(photo.id, e.target.value as any)}
                          className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 outline-none flex-1 max-w-[140px]"
                        >
                          {PHOTO_TAGS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onPaste={handlePaste}
              className={`w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all ${
                isUploading
                  ? "border-indigo-400 bg-indigo-50/70"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-400"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-indigo-600 py-4">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-xs font-bold">Uploading Photos...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 mb-2">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5">
                    {photos.length === 0 ? "Upload Front, Back, and Inside Photos" : "Add More Photos"}
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3 max-w-sm">
                    Drag and drop multiple files here, paste (<span className="font-bold">Cmd+V</span>), or browse from device
                  </p>
                  <label className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5">
                    <Plus size={14} />
                    Browse Photos (Multi-select)
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg, image/png, image/webp, image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFilesUpload(e.target.files);
                        }
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={18} className="text-emerald-500" />
              Verified photos get prioritized in search results.
            </div>
            <button
              type="submit"
              disabled={loading || photos.length === 0}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all text-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                `Publish Listing (${photos.length} ${photos.length === 1 ? 'Photo' : 'Photos'})`
              )}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
