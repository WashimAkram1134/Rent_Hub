"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, Variants } from "framer-motion";
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
  Check,
  ShoppingCart,
  Plus,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { categoryService } from "@/features/categories/categoryService";
import { Category } from "@/types";
import apiClient from "@/lib/axios";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/features/auth/authStore";
import { useFlyToCart } from "@/context/FlyToCartContext";

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

const CATEGORY_FILTERS: Record<string, { label: string; value: string }[]> = {
  vehicles: [
    { label: "Car", value: "Car" },
    { label: "Motorcycle", value: "Motorcycle" },
    { label: "Bicycle", value: "Bicycle" },
    { label: "CNG", value: "CNG" },
    { label: "Bus", value: "Bus" },
    { label: "Truck", value: "Truck" },
  ],
  electronics: [
    { label: "Laptop", value: "Laptop" },
    { label: "Tablet", value: "Tablet" },
    { label: "Console", value: "Console" },
    { label: "Watch", value: "Watch" },
    { label: "TV", value: "TV" },
    { label: "Audio", value: "Audio" },
  ],
  cameras: [
    { label: "DSLR", value: "DSLR" },
    { label: "Mirrorless", value: "Mirrorless" },
    { label: "Lens", value: "Lens" },
    { label: "Action Camera", value: "Action Camera" },
    { label: "Drone", value: "Drone" },
  ],
  apartments: [
    { label: "Apartment", value: "Apartment" },
    { label: "House", value: "House" },
    { label: "Room", value: "Room" },
    { label: "Office", value: "Office" },
  ],
  furniture: [
    { label: "Table", value: "Table" },
    { label: "Sofa", value: "Sofa" },
    { label: "Chair", value: "Chair" },
    { label: "Bed", value: "Bed" },
    { label: "Storage", value: "Storage" },
  ],
  fashion: [
    { label: "Men", value: "Men" },
    { label: "Women", value: "Women" },
    { label: "Wedding", value: "Wedding" },
    { label: "Accessories", value: "Accessories" },
  ],
  sports: [
    { label: "Cricket", value: "Cricket" },
    { label: "Football", value: "Football" },
    { label: "Fitness", value: "Fitness" },
    { label: "Outdoor", value: "Outdoor" },
    { label: "Racket", value: "Racket" },
  ],
  books: [
    { label: "Textbook", value: "Textbook" },
    { label: "Fiction", value: "Fiction" },
    { label: "Self Help", value: "Self Help" },
  ],
};

const CITY_AREAS: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohakhali", "Tejgaon", "Gazipur"],
  Chattogram: ["Agrabad", "GEC Circle", "Nasirabad", "Halishahar", "Khulshi", "Chawkbazar"],
  Sylhet: ["Zindabazar", "Amberkhana", "Upashahar", "Shibganj", "Tilagarh"],
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.93, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ── 3D Tilt Card with Shine ──────────────────────────────────────────────────
function TiltProductCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
    shineX.set(((e.clientX - rect.left) / rect.width) * 100);
    shineY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {/* Shine overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 rounded-[20px] opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [shineX, shineY],
            ([sx, sy]) => `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.18) 0%, transparent 70%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
}

// ── Fallback Categories & Products ───────────────────────────────────────────
const FALLBACK_CATEGORIES: Record<string, Category> = {
  vehicles: {
    id: "vehicles",
    name: "Vehicles & 360° Cars",
    slug: "vehicles",
    description: "Range Rovers, BMWs, Sedans, Bikes & Microbuses with 360° rotation.",
    product_count: 450,
    sort_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  cameras: {
    id: "cameras",
    name: "Cameras & Cinema Lenses",
    slug: "cameras",
    description: "Sony A7 IV, Canon EOS R6, Blackmagic 6K, DJI Drones & Prime Lenses.",
    product_count: 380,
    sort_order: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  electronics: {
    id: "electronics",
    name: "Electronics & MacBooks",
    slug: "electronics",
    description: "MacBook Pro M3 Max, iPads, PS5 Consoles, VR Headsets & Audio.",
    product_count: 620,
    sort_order: 3,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  apartments: {
    id: "apartments",
    name: "Apartments & Vacation Stays",
    slug: "apartments",
    description: "Gulshan lakeview flats, Cox's Bazar beach villas & studios.",
    product_count: 290,
    sort_order: 4,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  furniture: {
    id: "furniture",
    name: "Furniture & Decor",
    slug: "furniture",
    description: "Herman Miller ergonomic chairs, dining sets & electric recliners.",
    product_count: 180,
    sort_order: 5,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  fashion: {
    id: "fashion",
    name: "Fashion & Designer Wear",
    slug: "fashion",
    description: "Wedding lehengas, tuxedo suits, luxury watches & designer jewelry.",
    product_count: 310,
    sort_order: 6,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  sports: {
    id: "sports",
    name: "Sports & Fitness Gear",
    slug: "sports",
    description: "Trek mountain bikes, camping tents, cricket kits & treadmills.",
    product_count: 220,
    sort_order: 7,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  books: {
    id: "books",
    name: "Books & Educational Kits",
    slug: "books",
    description: "Medical, engineering textbooks, rare fiction & self-improvement books.",
    product_count: 540,
    sort_order: 8,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
};

const FALLBACK_CATEGORY_PRODUCTS: Record<string, ProductCard[]> = {
  vehicles: [
    {
      id: "range-rover-velar-360",
      title: "Range Rover Velar R-Dynamic 2024 (360° View)",
      slug: "range-rover-velar-360",
      description: "Car: Flagship luxury SUV with 360 rotation and multi-angle condition photos.",
      price_per_day: 14000,
      city: "Dhaka",
      area: "Gulshan",
      avg_rating: 4.95,
      review_count: 86,
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=85",
      badge: "Popular",
    },
    {
      id: "bmw-m5-competition-360",
      title: "BMW M5 Competition 2024 (360° View)",
      slug: "bmw-m5-competition-360",
      description: "Car: High performance sports executive sedan with twin-turbo V8.",
      price_per_day: 16500,
      city: "Dhaka",
      area: "Banani",
      avg_rating: 5.0,
      review_count: 52,
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=85",
      badge: "Verified",
    },
    {
      id: "yamaha-r15-v4",
      title: "Yamaha R15 V4 Racing Blue",
      slug: "yamaha-r15-v4",
      description: "Motorcycle: Quick-shifter, dual-channel ABS sports bike.",
      price_per_day: 1800,
      city: "Dhaka",
      area: "Mirpur",
      avg_rating: 4.85,
      review_count: 39,
      image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
      badge: "Verified",
    },
  ],
  cameras: [
    {
      id: "sony-a7-iv",
      title: "Sony Alpha A7 IV Cinema Camera + 24-70mm GM",
      slug: "sony-a7-iv",
      description: "Mirrorless: 33MP sensor, 4K 60p 10-bit recording, real-time autofocus.",
      price_per_day: 3000,
      city: "Dhaka",
      area: "Banani",
      avg_rating: 4.9,
      review_count: 64,
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
      badge: "Popular",
    },
    {
      id: "dji-mini-4-pro",
      title: "DJI Mini 4 Pro 4K Drone (Fly More Combo)",
      slug: "dji-mini-4-pro",
      description: "Drone: 4K HDR video, obstacle sensing, and 34-min flight time.",
      price_per_day: 2200,
      city: "Dhaka",
      area: "Uttara",
      avg_rating: 4.88,
      review_count: 48,
      image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
      badge: "Verified",
    },
  ],
  electronics: [
    {
      id: "macbook-air-m2",
      title: "MacBook Pro 16\" M3 Max (36GB RAM / 1TB SSD)",
      slug: "macbook-air-m2",
      description: "Laptop: 16-core CPU, Liquid Retina XDR display, pro video editing.",
      price_per_day: 3200,
      city: "Dhaka",
      area: "Dhanmondi",
      avg_rating: 4.95,
      review_count: 76,
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      badge: "Popular",
    },
  ],
  apartments: [
    {
      id: "gulshan-lakeview-flat",
      title: "Luxury 3BHK Lakeview Apartment with Balcony",
      slug: "gulshan-lakeview-flat",
      description: "Apartment: Fully furnished lakeview apartment with modern amenities.",
      price_per_day: 4800,
      city: "Dhaka",
      area: "Gulshan",
      avg_rating: 4.92,
      review_count: 34,
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      badge: "Verified",
    },
  ],
  furniture: [
    {
      id: "herman-miller-aeron",
      title: "Herman Miller Aeron Ergonomic Task Chair",
      slug: "herman-miller-aeron",
      description: "Chair: World-class ergonomic seating for long coding sessions.",
      price_per_day: 650,
      city: "Dhaka",
      area: "Mohakhali",
      avg_rating: 4.95,
      review_count: 42,
      image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      badge: "Popular",
    },
  ],
  fashion: [
    {
      id: "bridal-lehenga-red",
      title: "Designer Crimson Silk Bridal Lehenga & Jewelry Set",
      slug: "bridal-lehenga-red",
      description: "Wedding: Dry-cleaned couture bridal wear with matching jewelry.",
      price_per_day: 3500,
      city: "Dhaka",
      area: "Dhanmondi",
      avg_rating: 4.96,
      review_count: 36,
      image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      badge: "Verified",
    },
  ],
  sports: [
    {
      id: "trek-mountain-bike",
      title: "Trek Marlin 7 All-Terrain Mountain Bike",
      slug: "trek-mountain-bike",
      description: "Fitness: 29-inch wheels, hydraulic disc brakes for outdoor trails.",
      price_per_day: 850,
      city: "Sylhet",
      area: "Zindabazar",
      avg_rating: 4.8,
      review_count: 21,
      image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      badge: "Popular",
    },
  ],
  books: [
    {
      id: "atomic-habits-special",
      title: "Atomic Habits & Leadership Classics Bundle",
      slug: "atomic-habits-special",
      description: "Self Help: Bestselling self-improvement books collection.",
      price_per_day: 80,
      city: "Dhaka",
      area: "Nilkhet",
      avg_rating: 4.9,
      review_count: 55,
      image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      badge: "Verified",
    },
  ],
};

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { toggleWishlist: storeToggleWishlist, isWishlisted: checkIsWishlisted } = useWishlistStore();
  const { addItem: addCartItem, isInCart: checkIsInCart } = useCartStore();
  const { triggerFlyToCart } = useFlyToCart();
  const [justAddedIds, setJustAddedIds] = useState<Record<string, boolean>>({});
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

  // Fetch Category + Products from DB
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.allSettled([
      categoryService.get(slug),
      apiClient.get<ProductCard[]>("/products", { params: { category_slug: slug } }),
    ])
      .then(([catRes, productsRes]) => {
        const catSlugStr = String(slug).toLowerCase();

        if (catRes.status === "fulfilled" && catRes.value) {
          setCategory(catRes.value);
        } else if (FALLBACK_CATEGORIES[catSlugStr]) {
          setCategory(FALLBACK_CATEGORIES[catSlugStr]);
        } else {
          // Dynamic category fallback
          setCategory({
            id: catSlugStr,
            name: catSlugStr.charAt(0).toUpperCase() + catSlugStr.slice(1),
            slug: catSlugStr,
            description: `Explore all ${catSlugStr} for rent in Bangladesh.`,
            product_count: 50,
            sort_order: 99,
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
          });
        }

        let productsLoaded: ProductCard[] = [];
        if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value.data) && productsRes.value.data.length > 0) {
          productsLoaded = productsRes.value.data.map((p) => ({
            ...p,
            badge: p.is_featured
              ? "Popular"
              : (p.avg_rating && p.avg_rating >= 4.8 ? "Verified" : "New"),
          }));
        } else if (FALLBACK_CATEGORY_PRODUCTS[catSlugStr]) {
          productsLoaded = FALLBACK_CATEGORY_PRODUCTS[catSlugStr];
        }

        setAllProducts(productsLoaded);
      })
      .catch((err) => {
        const catSlugStr = String(slug).toLowerCase();
        if (FALLBACK_CATEGORIES[catSlugStr]) {
          setCategory(FALLBACK_CATEGORIES[catSlugStr]);
          setAllProducts(FALLBACK_CATEGORY_PRODUCTS[catSlugStr] || []);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  // Helper to determine product type from product details based on category
  const getProductType = (p: ProductCard, catSlug: string): string => {
    const text = `${p.title} ${p.description || ""}`.toLowerCase();
    
    if (catSlug === "vehicles") {
      if (text.includes("car") || text.includes("sedan") || text.includes("toyota") || text.includes("honda grace") || text.includes("bmw")) return "Car";
      if (text.includes("motorcycle") || text.includes("bike") || text.includes("yamaha") || text.includes("royal enfield")) return "Motorcycle";
      if (text.includes("bicycle") || text.includes("trek") || text.includes("giant") || text.includes("cycle")) return "Bicycle";
      if (text.includes("cng") || text.includes("rickshaw")) return "CNG";
      if (text.includes("bus") || text.includes("coach") || text.includes("coaster")) return "Bus";
      if (text.includes("truck") || text.includes("cargo") || text.includes("pickup")) return "Truck";
      return "Car";
    }
    
    if (catSlug === "electronics") {
      if (text.includes("macbook") || text.includes("xps") || text.includes("laptop")) return "Laptop";
      if (text.includes("ipad") || text.includes("tab")) return "Tablet";
      if (text.includes("playstation") || text.includes("xbox") || text.includes("switch")) return "Console";
      if (text.includes("watch")) return "Watch";
      if (text.includes("tv")) return "TV";
      if (text.includes("earbuds") || text.includes("audio")) return "Audio";
      return "Laptop";
    }
    
    if (catSlug === "cameras") {
      if (text.includes("eos") || text.includes("dslr")) return "DSLR";
      if (text.includes("sony a7") || text.includes("lumix") || text.includes("z6") || text.includes("x-t4")) return "Mirrorless";
      if (text.includes("lens") || text.includes("35mm") || text.includes("70-200mm") || text.includes("24-70mm")) return "Lens";
      if (text.includes("gopro") || text.includes("action")) return "Action Camera";
      if (text.includes("mavic") || text.includes("drone")) return "Drone";
      return "Mirrorless";
    }
    
    if (catSlug === "apartments") {
      if (text.includes("2bhk") || text.includes("3bhk") || text.includes("flat") || text.includes("apartment")) return "Apartment";
      if (text.includes("house") || text.includes("duplex")) return "House";
      if (text.includes("room")) return "Room";
      if (text.includes("office") || text.includes("commercial") || text.includes("shop")) return "Office";
      return "Apartment";
    }
    
    if (catSlug === "furniture") {
      if (text.includes("table") || text.includes("desk")) return "Table";
      if (text.includes("sofa")) return "Sofa";
      if (text.includes("chair") || text.includes("bean bag")) return "Chair";
      if (text.includes("bed")) return "Bed";
      if (text.includes("wardrobe") || text.includes("bookshelf") || text.includes("almirah")) return "Storage";
      return "Table";
    }
  
    if (catSlug === "fashion") {
      if (text.includes("panjabi") || text.includes("sherwani") || text.includes("suit")) return "Men";
      if (text.includes("lehenga") || text.includes("saree") || text.includes("dress")) return "Women";
      if (text.includes("wedding") || text.includes("bridal")) return "Wedding";
      if (text.includes("handbag") || text.includes("sunglasses")) return "Accessories";
      return "Men";
    }
  
    if (catSlug === "sports") {
      if (text.includes("cricket") || text.includes("bat")) return "Cricket";
      if (text.includes("football")) return "Football";
      if (text.includes("treadmill") || text.includes("dumbbell") || text.includes("yoga")) return "Fitness";
      if (text.includes("tent") || text.includes("camping")) return "Outdoor";
      if (text.includes("racket") || text.includes("tennis") || text.includes("badminton")) return "Racket";
      return "Fitness";
    }
  
    if (catSlug === "books") {
      if (text.includes("textbook") || text.includes("mathematics") || text.includes("anatomy") || text.includes("coursebook") || text.includes("ielts")) return "Textbook";
      if (text.includes("potter") || text.includes("rings") || text.includes("novel") || text.includes("fiction")) return "Fiction";
      if (text.includes("self") || text.includes("biography")) return "Self Help";
      return "Textbook";
    }
    
    return "Other";
  };

  // Compute counts per type dynamically
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const filters = CATEGORY_FILTERS[slug] || [];
    filters.forEach(f => { counts[f.value] = 0; });
    
    allProducts.forEach((p) => {
      const t = getProductType(p, slug);
      if (counts[t] !== undefined) counts[t]++;
    });
    return counts;
  }, [allProducts, slug]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Filter by Subcategory Pill
    if (selectedSubcategory !== "All") {
      list = list.filter((p) => getProductType(p, slug).toLowerCase() === selectedSubcategory.toLowerCase());
    }

    // Filter by Checkbox Types
    if (selectedTypes.length > 0) {
      list = list.filter((p) => selectedTypes.includes(getProductType(p, slug)));
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
    if (product) storeToggleWishlist({
      id: product.id,
      title: product.title,
      price_per_day: product.price_per_day,
      image_url: product.image_url || product.images?.[0]?.url || "",
      location: product.area ? `${product.area}, ${product.city || "Dhaka"}` : product.city || "Dhaka"
    });
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
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 size={40} className="text-indigo-600" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-sm text-slate-400 font-medium"
            >
              Loading products...
            </motion.p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!category) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <Package size={56} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Category Not Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            We couldn't find the category you're looking for. It may have been removed or renamed.
          </p>
          <Link
            href="/categories"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-100"
          >
            Browse All Categories
          </Link>
        </div>
      </AppShell>
    );
  }

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

      {/* Type Filter */}
      {(CATEGORY_FILTERS[slug] || []).length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-900 mb-2.5">Category Type</h3>
          <div className="space-y-2">
            {(CATEGORY_FILTERS[slug] || []).map((vt) => {
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
      )}

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
              <LayoutGrid size={13} /> All {category.name}
            </button>
            {(CATEGORY_FILTERS[slug] || []).map((vt) => (
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
            <h2 className="text-xl font-bold text-slate-700">No {category.name.toLowerCase()} match your filters</h2>
            <p className="text-slate-400 text-xs mt-2 mb-6">
              Try adjusting your price range or clearing selected {category.name.toLowerCase()} types.
            </p>
            <button
              onClick={handleClearAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
          <motion.div
            key={`${selectedSubcategory}-${sortBy}-${viewMode}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
                if (!isAuthenticated || !user) {
                  const returnUrl = window.location.pathname + window.location.search;
                  router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                  return;
                }
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

              const handleAddToCartClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!isAuthenticated || !user) {
                  router.push(`/login?returnUrl=${encodeURIComponent(`/categories/${slug}`)}`);
                  return;
                }
                
                triggerFlyToCart({
                  image,
                  startElement: e.currentTarget as HTMLElement,
                  item: {
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    price_per_day: product.price_per_day,
                    image_url: image,
                    category: category?.name || "General",
                    owner_id: "owner-id",
                    owner_name: "Verified Owner",
                  },
                });

                setJustAddedIds((prev) => ({ ...prev, [product.id]: true }));
                setTimeout(() => {
                  setJustAddedIds((prev) => ({ ...prev, [product.id]: false }));
                }, 2000);
              };

              const isAdded = checkIsInCart(product.id) || justAddedIds[product.id];

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

                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <MapPin size={13} />
                                <span className="text-xs font-medium text-slate-600">
                                  {product.area ? `${product.area}, ` : ""}{product.city || "Dhaka"}
                                </span>
                              </div>
                              <button
                                onClick={handleAddToCartClick}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all w-fit active:scale-95 shadow-sm ${
                                  isAdded
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 border border-emerald-500"
                                    : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={13} className="stroke-[3]" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={13} className="stroke-[2.5]" />
                                    <span>Add to Cart</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-right flex flex-col justify-end h-full">
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
                  <TiltProductCard className="h-full">
                  <Link href={`/products/${product.slug}`} className="block group h-full">
                    <div className="bg-white rounded-[20px] border border-slate-200/80 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/60 transition-all duration-400 flex flex-col h-full hover:border-indigo-200">
                      {/* Image Container */}
                      <div className="relative h-[190px] w-full overflow-hidden bg-slate-100 shrink-0">
                        <motion.img
                          src={image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.09 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md"
                          >
                            {discPct}% OFF
                          </motion.span>
                          {product.badge && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.15, type: "spring" }}
                              className={`text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${badgeColor}`}
                            >
                              {product.badge === "Popular" && <span>🔥</span>}
                              {product.badge}
                            </motion.span>
                          )}
                        </div>

                        {/* Heart Icon */}
                        <motion.button
                          onClick={handleWishlistClick}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
                        >
                          <Heart
                            size={15}
                            className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"}
                          />
                        </motion.button>

                        {/* View 360 hint on hover */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 whitespace-nowrap">
                          <RotateCcw size={10} /> View all angles
                        </div>
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

                        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                <span className="line-through text-slate-400 mr-1">৳ {origPrice.toLocaleString()}</span>
                              </div>
                              <motion.div
                                key={product.price_per_day}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-extrabold text-base text-slate-900 leading-tight"
                              >
                                ৳ {product.price_per_day.toLocaleString()}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">/ day</span>
                              </motion.div>
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

                          <motion.button
                            onClick={handleAddToCartClick}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-full text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                              isAdded
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 border border-emerald-500"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check size={13} className="stroke-[3]" />
                                <span>Added to Cart</span>
                              </>
                            ) : (
                              <>
                                <Plus size={13} className="stroke-[2.5]" />
                                <span>+ Add to Cart</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </Link>
                  </TiltProductCard>
                </motion.div>
              );
            })}
          </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}
