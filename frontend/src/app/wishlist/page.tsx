"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { Heart, Trash2, ArrowLeft, Filter, Search, ShoppingBag, MapPin, Star } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const { items, toggleWishlist, clearWishlist } = useWishlistStore();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["all", "Vehicles", "Cameras", "Electronics", "Apartments", "Furniture", "Sports"];

  const filteredItems = items.filter((item) => {
    const matchesCat =
      selectedCat === "all" ||
      (item.category && item.category.toLowerCase().includes(selectedCat.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <AppShell>
      <div className="p-6 font-sans bg-[#F8FAFC] min-h-screen text-slate-800">
        <div className="max-w-[1360px] mx-auto space-y-6">

          {/* Top Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline mb-1"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
                <span className="bg-rose-100 text-rose-600 text-xs font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                  {items.length} Saved Items
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                All rental items you clicked love on in one place.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear your entire wishlist?")) {
                    clearWishlist();
                  }
                }}
                className="flex items-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
              >
                <Trash2 size={14} /> Clear Wishlist
              </button>
            )}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap ${
                    selectedCat === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat === "all" ? "All Items" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search saved items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Wishlist Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-6 shadow-sm">
              <Heart size={44} className="text-slate-300 mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-lg font-bold text-slate-800">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {items.length === 0
                  ? "You haven't clicked love on any items yet. Explore categories and click the heart icon on items you love!"
                  : "No items match your filter criteria."}
              </p>
              <Link
                href="/categories"
                className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
              >
                <ShoppingBag size={15} /> Explore Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                        {item.category}
                      </span>
                    )}
                    {/* Toggle Love / Remove from Wishlist */}
                    <button
                      onClick={() => toggleWishlist({ id: item.id })}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all"
                      title="Remove from Wishlist"
                    >
                      <Heart size={15} className="fill-rose-500 text-rose-500" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400" />
                        <span>{item.rating || 4.8}</span>
                        <span className="text-slate-400 font-normal">({item.review_count || 18} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{item.location || "Dhaka"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Daily Rate</div>
                        <div className="text-base font-black text-indigo-600">
                          ৳ {(item.price_per_day || item.price || 2000).toLocaleString()}
                        </div>
                      </div>
                      <Link
                        href={`/products/${item.id}`}
                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Rent Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
