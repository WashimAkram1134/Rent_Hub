"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  LayoutGrid,
  PackageSearch,
  ShieldCheck,
  Clock,
  BadgeDollarSign,
  ArrowRight,
  X,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { categoryService } from "@/features/categories/categoryService";
import { Category } from "@/types";

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" },
  }),
};

// ─── Trust Badges ─────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { Icon: LayoutGrid, title: "Wide Variety", desc: "Thousands of items across all categories" },
  { Icon: BadgeDollarSign, title: "Affordable Prices", desc: "Best prices for short and long term rentals" },
  { Icon: ShieldCheck, title: "Verified Owners", desc: "All owners are verified for your safety" },
  { Icon: Clock, title: "24/7 Support", desc: "We're here to help you anytime" },
];

// ─── Request Item Modal ───────────────────────────────────────────────────────
function RequestModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request an Item</h2>
            <p className="text-slate-500 text-sm mt-1">Tell us what you're looking for and we'll find it.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Professional Drone"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Describe what you need..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            Submit Request <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const badgesRef = useRef(null);
  const badgesInView = useInView(badgesRef, { once: true, margin: "-80px" });

  useEffect(() => {
    categoryService
      .list(false)
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="p-6 max-w-[1380px] mx-auto">
        {/* Breadcrumbs + Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors font-medium">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-700 font-medium">All Categories</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">All Categories</h1>
              <p className="text-slate-500 mt-1 text-sm">
                Explore all rental categories and find what you need.
              </p>
            </div>
            <p className="text-xs text-slate-400 font-medium shrink-0">
              {loading ? "Loading..." : `Showing all ${categories.length} categories`}
            </p>
          </div>
        </motion.div>

        {/* Category Grid — 3 per row */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-100 animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={cardVariants} className="h-full">
                <Link href={`/categories/${cat.slug}`} className="block group h-full">
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                    {/* Cover Image */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100 shrink-0">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                          <LayoutGrid size={48} className="opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Floating icon badge */}
                      <div className="absolute -bottom-5 left-5 w-10 h-10 bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden z-10">
                        {cat.icon_url ? (
                          <img
                            src={cat.icon_url}
                            alt={cat.name}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                            <LayoutGrid size={18} className="text-indigo-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 pt-8 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {cat.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mt-0.5 shrink-0">
                          {cat.product_count > 0 ? `${cat.product_count}+` : "0"} Items
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-3 flex-1">
                        {cat.description || `Browse ${cat.name.toLowerCase()} for rent`}
                      </p>
                      <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm self-end group-hover:gap-2.5 transition-all">
                        Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Can't find card */}
            <motion.div variants={cardVariants} className="h-full">
              <div className="bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] rounded-2xl border border-indigo-100 p-6 flex flex-col justify-between h-full min-h-[230px] relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                    <PackageSearch size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1.5 leading-tight">
                    Can't find what<br />you're looking for?
                  </h3>
                  <p className="text-xs text-slate-600 mb-5">
                    Let us help you find the perfect item.
                  </p>
                  <button
                    onClick={() => setRequestModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-2 px-5 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:shadow-indigo-200"
                  >
                    Request an Item
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-200/30 rounded-full group-hover:scale-110 transition-transform duration-500" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Trust Badges ─────────────────────────────────────────────── */}
        <div ref={badgesRef} className="mt-10 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TRUST_BADGES.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUpVariants}
                initial="hidden"
                animate={badgesInView ? "visible" : "hidden"}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {requestModalOpen && <RequestModal onClose={() => setRequestModalOpen(false)} />}
      </AnimatePresence>
    </AppShell>
  );
}
