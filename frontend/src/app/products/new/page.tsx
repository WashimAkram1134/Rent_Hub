"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Camera, MapPin, Tag, Image as ImageIcon, DollarSign, Info, ShieldCheck, CheckCircle, UploadCloud, X, Link as LinkIcon } from "lucide-react";
import apiClient from "@/lib/axios";

export default function AddListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "link">("upload");

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
    image_url: "",
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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formDataObj,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) handleFileUpload(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price_per_day: parseFloat(formData.price_per_day),
        security_deposit: parseFloat(formData.security_deposit || "0"),
      };

      const res = await fetch("http://localhost:8000/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create product");
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?role=owner");
      }, 2000);
      
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Listing Published!</h1>
        <p className="text-slate-500">Your item is now live on the marketplace.</p>
        <p className="text-sm text-slate-400 mt-2">Redirecting you to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">Add New Listing</h1>
          <p className="text-slate-500">Fill out the details below to start renting out your item.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Details */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Info size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Basic Details</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Listing Title</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Sony A7IV Mirrorless Camera"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <div className="relative">
                    <select
                      required
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Item Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option>Brand New</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your item, what's included, and any rules for renters..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Location */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pricing & Delivery</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price per day (৳)</label>
                <input
                  required
                  type="number"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Security Deposit (৳)</label>
                <input
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleChange}
                  placeholder="Optional"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Area / Location</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., Dhanmondi"
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Option</label>
                <select
                  name="delivery_option"
                  value={formData.delivery_option}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                  <option>Pickup Only</option>
                  <option>Delivery Available</option>
                  <option>Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Media */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Camera size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Photos</h2>
            </div>
            
            <div className="flex gap-4 mb-6">
              <button 
                type="button" 
                onClick={() => setUploadMethod("upload")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${uploadMethod === "upload" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <UploadCloud size={16} /> Upload / Paste
              </button>
              <button 
                type="button" 
                onClick={() => setUploadMethod("link")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${uploadMethod === "link" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <LinkIcon size={16} /> Image URL
              </button>
            </div>

            {formData.image_url && uploadMethod === "upload" ? (
              <div className="relative w-full h-64 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 group">
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))} 
                    className="bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <X size={16} /> Remove Photo
                  </button>
                </div>
              </div>
            ) : uploadMethod === "upload" ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onPaste={handlePaste}
                className={`w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors relative ${isUploading ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300'}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 text-indigo-600">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-bold">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={40} className="text-slate-400 mb-4" />
                    <p className="text-slate-600 font-medium mb-1">Drag and drop an image here</p>
                    <p className="text-xs text-slate-400 mb-4">or click to browse from device, or <span className="font-bold">Cmd+V</span> to paste</p>
                    <label className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 shadow-sm transition-all">
                      Browse Files
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp, image/gif" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
                        }} 
                      />
                    </label>
                  </>
                )}
                {/* Invisible input to catch focus for paste event if user clicks into dropzone */}
                <input type="text" className="absolute opacity-0 w-0 h-0" autoFocus />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image Link</label>
                <div className="relative mb-6">
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
                {formData.image_url && (
                  <div className="w-full h-48 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 relative">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={18} className="text-emerald-500" />
              Your listing will be reviewed before going live.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
            >
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
