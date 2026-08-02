"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  MapPin,
  Star,
  Loader2,
  LayoutGrid,
  List,
  Package,
  SlidersHorizontal,
  RotateCcw,
  Check
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { categoryService } from "@/features/categories/categoryService";
import { Category } from "@/types";
import apiClient from "@/lib/axios";
import { useWishlistStore } from "@/store/wishlistStore";

// Types
interface ProductCard {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price_per_day: number;
  city?: string;
  area?: string;
  avg_rating?: number;
  review_count?: number;
  is_featured?: boolean;
  image_url?: string;
  images?: { url: string; is_primary: boolean }[];
  status?: string;
  badge?: string;
}

const VEHICLE_TYPES = [
  { label: "Car", value: "Car" },
  { label: "Motorcycle", value: "Motorcycle" },
  { label: "Bicycle", value: "Bicycle" },
  { label: "CNG", value: "CNG" },
  { label: "Bus", value: "Bus" },
  { label: "Truck", value: "Truck" },
];

const CITY_AREAS: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohakhali", "Tejgaon", "Gazipur"],
  Chattogram: ["Agrabad", "GEC Circle", "Nasirabad", "Halishahar", "Khulshi", "Chawkbazar"],
  Sylhet: ["Zindabazar", "Amberkhana", "Upashahar", "Shibganj", "Tilagarh"],
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { toggleWishlist: storeToggleWishlist, isWishlisted: checkIsWishlisted } = useWishlistStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Filter States
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [rating4Plus, setRating4Plus] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch Category + Products from Supabase DB
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      categoryService.get(slug),
      apiClient.get<ProductCard[]>("/products", { params: { category_slug: slug } }),
    ])
      .then(([cat, productsRes]) => {
        setCategory(cat);
        const rawProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
        const mapped = rawProducts.map((p) => ({
          ...p,
          badge: p.is_featured
            ? "Popular"
            : (p.avg_rating && p.avg_rating >= 4.8 ? "Verified" : "New"),
        }));
        setAllProducts(mapped);
      })
      .catch(() => {
        router.push("/categories");
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  // Helper to determine vehicle type from product details
  const getVehicleType = (p: ProductCard): string => {
    const text = `${p.title} ${p.description || ""}`.toLowerCase();
    if (text.includes("car") || text.includes("sedan") || text.includes("toyota") || text.includes("honda grace") || text.includes("bmw")) return "Car";
    if (text.includes("motorcycle") || text.includes("bike") || text.includes("yamaha") || text.includes("royal enfield")) return "Motorcycle";
    if (text.includes("bicycle") || text.includes("trek") || text.includes("giant") || text.includes("cycle")) return "Bicycle";
    if (text.includes("cng") || text.includes("rickshaw")) return "CNG";
    if (text.includes("bus") || text.includes("coach") || text.includes("coaster")) return "Bus";
    if (text.includes("truck") || text.includes("cargo") || text.includes("pickup")) return "Truck";
    return "Car";
  };

  // Compute counts per type dynamically
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Car: 0,
      Motorcycle: 0,
      Bicycle: 0,
      CNG: 0,
      Bus: 0,
      Truck: 0,
    };
    allProducts.forEach((p) => {
      const t = getVehicleType(p);
      if (counts[t] !== undefined) counts[t]++;
    });
    return counts;
  }, [allProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Filter by Subcategory Pill
    if (selectedSubcategory !== "All") {
      list = list.filter((p) => getVehicleType(p).toLowerCase() === selectedSubcategory.toLowerCase());
    }

    // Filter by Checkbox Types
    if (selectedTypes.length > 0) {
      list = list.filter((p) => selectedTypes.includes(getVehicleType(p)));
    }

    // Filter by Location
    if (selectedCity) {
      list = list.filter((p) => p.city?.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedArea) {
      list = list.filter((p) => p.area?.toLowerCase() === selectedArea.toLowerCase());
    }

    // Filter by Price
    list = list.filter((p) => p.price_per_day >= priceMin && p.price_per_day <= priceMax);

    // Filter by Rating
    if (rating4Plus) {
      list = list.filter((p) => (p.avg_rating || 0) >= 4.0);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "price_asc") return a.price_per_day - b.price_per_day;
      if (sortBy === "price_desc") return b.price_per_day - a.price_per_day;
      if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

    return list;
  }, [allProducts, selectedSubcategory, selectedTypes, selectedCity, selectedArea, priceMin, priceMax, rating4Plus, sortBy]);

  const availableAreas = useMemo(() => {
    if (selectedCity && CITY_AREAS[selectedCity]) {
      return CITY_AREAS[selectedCity];
    }
    const areaSet = new Set<string>();
    allProducts.forEach((p) => {
      if (p.area) areaSet.add(p.area);
    });
    return Array.from(areaSet);
  }, [selectedCity, allProducts]);

  // Toggle handlers
  const toggleTypeCheckbox = (val: string) => {
    setSelectedTypes((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const product = allProducts.find((p) => p.id === id);
    if (product) storeToggleWishlist({ id: product.id, title: product.title, price_per_day: product.price_per_day, image_url: product.image_url, location: product.location });
  };

  const handleClearAll = () => {
    setSelectedSubcategory("All");
    setSelectedTypes([]);
    setSelectedCity("");
    setSelectedArea("");
    setPriceMin(0);
    setPriceMax(10000);
    setRating4Plus(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center h-full py-32">
          <Loader2 size={40} className="text-indigo-600 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!category) return null;

  // Sidebar Filter Panel Component
  const filterComponent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <SlidersHorizontal size={15} className="text-indigo-600" /> Filters
        </h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
        >
          <RotateCcw size={12} /> Clear All
        </button>
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
          <MapPin size={14} className="text-slate-500" /> Location
        </h3>
        <div className="space-y-2.5">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedArea("");
            }}
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white cursor-pointer font-medium text-slate-800"
          >
            <option value="">All Cities</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chattogram">Chattogram</option>
            <option value="Sylhet">Sylhet</option>
          </select>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white cursor-pointer text-slate-700 font-medium"
          >
            <option value="">Select Area</option>
            {availableAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-900 mb-2.5">Price Range (Per Day)</h3>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">৳</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 bg-slate-50 outline-none focus:border-indigo-500 font-semibold"
            />
          </div>
          <span className="text-slate-400 text-xs">-</span>
          <div className="flex-1 relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">৳</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 bg-slate-50 outline-none focus:border-indigo-500 font-semibold"
            />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={10000}
          step={200}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />
      </div>

      {/* Vehicle Type Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-900 mb-2.5">Vehicle Type</h3>
        <div className="space-y-2">
          {VEHICLE_TYPES.map((vt) => {
            const isChecked = selectedTypes.includes(vt.value);
            const count = typeCounts[vt.value] || 0;
            return (
              <label
                key={vt.value}
                onClick={() => toggleTypeCheckbox(vt.value)}
                className="flex items-center justify-between cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 group-hover:border-indigo-500"
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{vt.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Ratings Filter */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-900 mb-2.5">Ratings</h3>
        <label
          onClick={() => setRating4Plus(!rating4Plus)}
          className="flex items-center justify-between cursor-pointer group hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                rating4Plus ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 group-hover:border-indigo-500"
              }`}
            >
              {rating4Plus && <Check size={11} strokeWidth={3} />}
            </div>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} fill="currentColor" />
              <Star size={12} className="text-slate-300" />
            </div>
            <span className="text-xs font-medium text-slate-700">4.0+</span>
          </div>
        </label>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100">
        <button
          onClick={() => {}}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-100 active:scale-98"
        >
          Apply Filters ({filteredProducts.length})
        </button>
      </div>
    </div>
  );

  return (
    <AppShell sidebarFilter={filterComponent} defaultSidebarMode="filter">
      <div className="p-6 lg:p-8 min-w-0 bg-[#FAFAFA] min-h-full">
        {/* Breadcrumbs & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium mb-3">
            <Link href="/dashboard" className="hover:underline">Home</Link>
            <ChevronRight size={12} className="text-slate-400" />
            <Link href="/categories" className="hover:underline">Categories</Link>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-slate-500 font-semibold">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                {category.name} for Rent
              </h1>
              <p className="text-xs text-slate-500 max-w-xl">
                {category.description || `Find cars, bikes, buses, trucks & CNG for rent from verified owners.`}
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Showing 1-{filteredProducts.length} of {allProducts.length} items
            </p>
          </div>
        </div>

        {/* Top Filter Bar (Subcategory Pills + Sort + View Mode) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
            <button
              onClick={() => setSelectedSubcategory("All")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedSubcategory === "All"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
              }`}
            >
              <LayoutGrid size={13} /> All Vehicles
            </button>
            {VEHICLE_TYPES.map((vt) => (
              <button
                key={vt.value}
                onClick={() => setSelectedSubcategory(vt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedSubcategory === vt.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
                }`}
              >
                {vt.label}
              </button>
            ))}
          </div>

          {/* View Toggles & Sort */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <List size={16} />
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / List */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border border-slate-100 p-6"
          >
            <Package size={56} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-700">No vehicles match your filters</h2>
            <p className="text-slate-400 text-xs mt-2 mb-6">
              Try adjusting your price range or clearing selected vehicle types.
            </p>
            <button
              onClick={handleClearAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((product) => {
              const image =
                product.image_url ??
                product.images?.find((img) => img.is_primary)?.url ??
                product.images?.[0]?.url ??
                "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80";

              const isFav = checkIsWishlisted(product.id);

              let badgeColor = "bg-indigo-500";
              if (product.badge === "Popular") badgeColor = "bg-rose-500";
              if (product.badge === "New") badgeColor = "bg-blue-500";
              if (product.badge === "Verified") badgeColor = "bg-indigo-600";

              const origPrice = Math.round(product.price_per_day * 1.25);
              const discPct = 20;

              const handleWishlistClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                storeToggleWishlist({
                  id: product.id,
                  title: product.title,
                  category: category?.name || "General",
                  image_url: image,
                  price_per_day: product.price_per_day,
                  rating: product.avg_rating || 4.8,
                  review_count: product.review_count || 24,
                  location: product.area ? `${product.area}, ${product.city || "Dhaka"}` : product.city || "Dhaka",
                });
              };

              if (viewMode === "list") {
                return (
                  <motion.div key={product.id} variants={cardVariants}>
                    <Link href={`/products/${product.slug}`} className="block group">
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col md:flex-row gap-5 hover:shadow-lg hover:border-indigo-200 transition-all">
                        <div className="relative h-44 md:w-60 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                            <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md">
                              {discPct}% OFF
                            </span>
                          </div>
                          <button
                            onClick={handleWishlistClick}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
                          >
                            <Heart
                              size={15}
                              className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"}
                            />
                          </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {product.badge && (
                                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${badgeColor}`}>
                                  {product.badge}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold text-slate-700">{product.avg_rating || 4.8}</span>
                                <span className="text-[11px] text-slate-400">({product.review_count || 50})</span>
                              </div>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors mb-2">
                              {product.title}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin size={13} />
                              <span className="text-xs font-medium text-slate-600">
                                {product.area ? `${product.area}, ` : ""}{product.city || "Dhaka"}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400 font-medium">
                                <span className="line-through mr-1">৳ {origPrice.toLocaleString()}</span>
                                <span className="text-rose-500 font-bold">{discPct}% OFF</span>
                              </div>
                              <span className="text-lg font-extrabold text-slate-900">৳ {product.price_per_day.toLocaleString()}</span>
                              <span className="text-xs text-slate-400 font-medium ml-1">/ day</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.div key={product.id} variants={cardVariants}>
                  <Link href={`/products/${product.slug}`} className="block group h-full">
                    <div className="bg-white rounded-[20px] border border-slate-200/80 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full hover:border-indigo-100">
                      {/* Image Container */}
                      <div className="relative h-[180px] w-full overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                          <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md">
                            {discPct}% OFF
                          </span>
                          {product.badge && (
                            <span className={`text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${badgeColor}`}>
                              {product.badge === "Popular" && <span>🔥</span>}
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {/* Heart Icon */}
                        <button
                          onClick={handleWishlistClick}
                          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
                        >
                          <Heart
                            size={15}
                            className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"}
                          />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                            {product.title}
                          </h3>

                          <div className="flex items-center gap-1 mb-3">
                            <Star size={13} className="text-amber-500 fill-amber-500" />
                            <span className="text-xs font-semibold text-slate-700">
                              {product.avg_rating || 4.8}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({product.review_count || 24})
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                          <div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              <span className="line-through text-slate-400 mr-1">৳ {origPrice.toLocaleString()}</span>
                            </div>
                            <div className="font-extrabold text-base text-slate-900 leading-tight">
                              ৳ {product.price_per_day.toLocaleString()}
                              <span className="text-[10px] text-slate-400 font-normal ml-1">/ day</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                              <MapPin size={11} />
                              <span className="text-[11px] font-medium text-slate-500 truncate max-w-[110px]">
                                {product.area ? `${product.area}, ` : ""}{product.city || "Dhaka"}
                              </span>
                            </div>
                          </div>

                          <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Available
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
