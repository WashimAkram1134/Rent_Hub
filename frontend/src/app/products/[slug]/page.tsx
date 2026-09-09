"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Star, MapPin, ChevronRight, Shield, ChevronLeft, ChevronDown,
  Heart, MessageCircle, ShoppingCart, Check, RotateCcw,
  Wifi, Wind, Zap, Settings, Eye, Lock, Camera, Music, Fuel, Users,
  Package, Loader2, AlertTriangle, Play, Pause, Maximize2, Move3d, ShieldAlert
} from "lucide-react";
import dayjs from "dayjs";
import apiClient from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useAuthStore } from "@/features/auth/authStore";
import { useFlyToCart } from "@/context/FlyToCartContext";

// ── Feature Highlights ─────────────────────────────────────────────────────────
const FEATURE_KEYWORDS: { label: string; icon: React.ReactNode }[] = [
  { label: "Automatic", icon: <Settings size={14} /> },
  { label: "Fuel Efficient", icon: <Fuel size={14} /> },
  { label: "5 Seats", icon: <Users size={14} /> },
  { label: "Air Condition", icon: <Wind size={14} /> },
  { label: "Bluetooth", icon: <Wifi size={14} /> },
  { label: "Well Maintained", icon: <Check size={14} /> },
  { label: "Music System", icon: <Music size={14} /> },
  { label: "Camera", icon: <Camera size={14} /> },
  { label: "USB Charger", icon: <Zap size={14} /> },
  { label: "Central Lock", icon: <Lock size={14} /> },
  { label: "ABS Brakes", icon: <Shield size={14} /> },
  { label: "Power Steering", icon: <Settings size={14} /> },
  { label: "Airbags", icon: <Shield size={14} /> },
  { label: "Rear Camera", icon: <Camera size={14} /> },
];

function getHighlightsFromDescription(desc: string): typeof FEATURE_KEYWORDS {
  if (!desc) return FEATURE_KEYWORDS.slice(0, 6);
  const lower = desc.toLowerCase();
  const matched = FEATURE_KEYWORDS.filter((f) => lower.includes(f.label.toLowerCase()));
  return matched.length >= 3 ? matched : FEATURE_KEYWORDS.slice(0, 6);
}

const TABS = ["Overview", "Features", "Specifications", "Reviews", "Location"];
type DurationMode = "Daily" | "Weekly" | "Monthly";
type DeliveryMode = "Pick-up" | "Delivery";

// ── Dynamic Semantic Angle Helpers ──────────────────────────────────────────
function getAngleInfo(index: number, total: number, categorySlug?: string) {
  const cat = (categorySlug || "").toLowerCase();
  if (cat.includes("vehic") || cat.includes("car") || cat.includes("bike")) {
    const carAngles = [
      { label: "Front Exterior", icon: "🚗", short: "Front" },
      { label: "Front Angle (3/4)", icon: "📐", short: "Front-Angle" },
      { label: "Outside / Side Profile", icon: "🚘", short: "Outside" },
      { label: "Back / Rear View", icon: "🔙", short: "Back" },
      { label: "Inside Cockpit & Dash", icon: "💺", short: "Inside" },
      { label: "Inside Luxury Cabin", icon: "🛋️", short: "Cabin" },
    ];
    return carAngles[index] || { label: `Angle ${index + 1}`, icon: "📸", short: `Angle ${index + 1}` };
  }
  const generalAngles = [
    { label: "Main Front View", icon: "✨", short: "Front" },
    { label: "Angle Profile", icon: "📐", short: "Angle" },
    { label: "Back View", icon: "🔙", short: "Back" },
    { label: "Side View", icon: "🚘", short: "Side" },
    { label: "Interior View", icon: "💺", short: "Inside" },
    { label: "Close-up Detail", icon: "🔍", short: "Detail" },
  ];
  return generalAngles[index] || { label: `Photo ${index + 1}`, icon: "📸", short: `Photo ${index + 1}` };
}

// ── Animated 360° Viewer Component ────────────────────────────────────────────
function View360({ images, onClose, categorySlug }: { images: string[]; onClose?: () => void; categorySlug?: string }) {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [dragStart, setDragStart] = useState(0);
  const [lastAngle, setLastAngle] = useState(0);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const totalFrames = images.length;
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const currentIdx = Math.floor((normalizedAngle / 360) * totalFrames) % totalFrames;
  const currentImage = images[currentIdx] || images[0];
  const degrees = Math.round(normalizedAngle);
  const angleInfo = getAngleInfo(currentIdx, totalFrames, categorySlug || "vehicles");

  useEffect(() => {
    if (isAutoRotating && !isDragging) {
      autoRotateRef.current = setInterval(() => {
        setAngle((a) => a + 0.6);
      }, 25);
    } else {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    }
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [isAutoRotating, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setDragStart(e.clientX);
    setLastAngle(angle);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStart;
    setAngle(lastAngle + delta * 0.45);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full select-none bg-slate-950 overflow-hidden flex flex-col justify-between">
      {/* 360 Drag Viewport */}
      <div
        className={`relative w-full h-full overflow-hidden flex items-center justify-center ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          key={currentIdx}
          src={currentImage}
          alt={`360-frame-${currentIdx}`}
          className="w-full h-full object-cover transition-opacity duration-75 select-none pointer-events-none"
          draggable={false}
        />

        {/* Top-left: 360 Status & Compass Degree Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          <div className="bg-black/60 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
            <RotateCcw size={13} className={isAutoRotating && !isDragging ? "animate-spin text-indigo-400" : "text-indigo-400"} />
            <span>360° Interactive Angle</span>
          </div>
          <div className="bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-indigo-400/30">
            {degrees}°
          </div>
        </div>

        {/* Top-right: Exit 360° Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border border-white/20 shadow-lg"
          >
            ✕ Exit 360°
          </button>
        )}

        {/* Center: Drag Guide Overlay */}
        <AnimatePresence>
          {!isDragging && isAutoRotating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 flex items-center gap-2.5 text-white text-xs font-bold shadow-2xl">
                <Move3d size={16} className="text-indigo-400 animate-pulse" />
                <span>Drag to spin 360°</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Angle Label Badge */}
        <motion.div
          key={angleInfo.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/10 shadow-lg z-20 flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>{angleInfo.icon}</span>
          <span>{angleInfo.label}</span>
          <span className="text-slate-400">• Frame {currentIdx + 1}/{totalFrames}</span>
        </motion.div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors border border-white/10"
          >
            {isAutoRotating && !isDragging ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoRotating && !isDragging ? "Pause" : "Auto Spin"}</span>
          </button>
          <button
            onClick={() => { setAngle(0); setIsAutoRotating(false); }}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors border border-white/10"
          >
            <RotateCcw size={12} />
            <span>Front (0°)</span>
          </button>
        </div>

        {/* Frame Jump Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAngle((i / totalFrames) * 360);
                setIsAutoRotating(false);
              }}
              title={getAngleInfo(i, totalFrames, categorySlug).label}
              className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all flex items-center justify-center ${
                currentIdx === i
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400 scale-110"
                  : "bg-white/20 text-white/80 hover:bg-white/30"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Magnetic Button ────────────────────────────────────────────────────────────
function MagneticButton({ children, className, onClick, disabled }: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.18);
    y.set((e.clientY - cy) * 0.18);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

// ── Animated Stat Card ─────────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(99,102,241,0.12)" }}
      className="bg-white border border-slate-100 rounded-2xl p-4 text-center cursor-default"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-lg font-black text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-500 font-medium">{label}</div>
    </motion.div>
  );
}

// ── Scroll Reveal Wrapper ──────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Tilt Card ─────────────────────────────────────────────────────────────────
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 15 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 15 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 8);
    rotateY.set(x * 8);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Overview");
  const [view360Mode, setView360Mode] = useState(false);
  const [durationMode, setDurationMode] = useState<DurationMode>("Daily");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("Pick-up");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [pickupDate, setPickupDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [returnDate, setReturnDate] = useState(dayjs().add(3, "day").format("YYYY-MM-DD"));
  const [returnTime, setReturnTime] = useState("10:00 AM");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [chatWarning, setChatWarning] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);
  const { triggerFlyToCart } = useFlyToCart();
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  // Parallax scroll
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], ["0%", "10%"]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.04]);

  const { user, isAuthenticated } = useAuthStore();

  const isOwner = Boolean(
    isAuthenticated &&
    user &&
    product &&
    (
      (product.owner_id && String(user.id) === String(product.owner_id)) ||
      (product.owner?.id && String(user.id) === String(product.owner.id)) ||
      (user.email && product.owner?.email && user.email.toLowerCase() === product.owner.email.toLowerCase())
    )
  );

  const requireAuth = (action?: () => void): boolean => {
    if (!isAuthenticated || !user) {
      if (typeof window !== "undefined") {
        const returnUrl = window.location.pathname + window.location.search;
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      } else {
        router.push("/login");
      }
      return false;
    }
    if (action) action();
    return true;
  };

  const handleBookNow = async () => {
    if (!product) return;
    if (isOwner) {
      setBookingError("You cannot book your own listing.");
      return;
    }
    if (!requireAuth()) return;
    setBookingLoading(true);
    setBookingError(null);
    setChatWarning(false);
    try {
      await apiClient.post("/bookings", {
        product_id: product.id,
        start_date: pickupDate,
        end_date: returnDate,
        delivery_option: deliveryMode,
      });
      setBookingSuccess(true);
      setTimeout(() => router.push("/bookings"), 1200);
    } catch (e: any) {
      if (e.response?.status === 403 && e.response?.data?.error?.code === "IDENTITY_VERIFICATION_REQUIRED") {
        const returnUrl = window.location.pathname + window.location.search;
        sessionStorage.setItem("renthub_verify_return_url", returnUrl);
        router.push(`/verify-identity?returnUrl=${encodeURIComponent(returnUrl)}`);
      } else {
        setBookingError(e.response?.data?.error?.message || "Failed to submit booking request. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

// ── Fallback Product Resolver ────────────────────────────────────────────────
const FALLBACK_PRODUCT_CATALOG: Record<string, any> = {
  "range-rover-velar-360": {
    id: "range-rover-velar-360",
    slug: "range-rover-velar-360",
    title: "Range Rover Velar R-Dynamic 2024 (360° View)",
    description: "Flagship luxury SUV with intelligent AWD, panoramic sliding sunroof, 3D surround camera, Meridian sound system, and perforated Windsor leather interior. Includes full 360° interactive rotation and dedicated front, back, inside, outside viewing angles. Perfect for executive transport, VIP events, and weddings.",
    price_per_day: 14000,
    security_deposit: 25000,
    condition: "Like New",
    delivery_option: "both",
    city: "Dhaka",
    area: "Gulshan",
    avg_rating: 4.95,
    review_count: 86,
    is_featured: true,
    category: { id: "vehicles", name: "Vehicles", slug: "vehicles" },
    owner: { id: "owner-wa", first_name: "Washim", last_name: "Akram", email: "washim@renthub.com.bd", is_identity_verified: true, rating: 4.98 },
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", is_primary: true },
      { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85", is_primary: false },
    ],
  },
  "bmw-m5-competition-360": {
    id: "bmw-m5-competition-360",
    slug: "bmw-m5-competition-360",
    title: "BMW M5 Competition 2024 (360° View)",
    description: "High performance sports executive sedan with 617hp twin-turbo V8, carbon ceramic brakes, Bowers & Wilkins audio, and Merino leather bucket seats. Interactive 360° view with front, back, interior, and exterior angles.",
    price_per_day: 16500,
    security_deposit: 30000,
    condition: "Brand New",
    delivery_option: "both",
    city: "Dhaka",
    area: "Banani",
    avg_rating: 5.0,
    review_count: 52,
    is_featured: true,
    category: { id: "vehicles", name: "Vehicles", slug: "vehicles" },
    owner: { id: "owner-bmw", first_name: "Tanvir", last_name: "Hasan", email: "tanvir@renthub.com.bd", is_identity_verified: true, rating: 4.95 },
    images: [
      { url: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=1600&q=85", is_primary: true },
      { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1600&q=85", is_primary: false },
      { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", is_primary: false },
    ],
  },
  "sony-a7-iv": {
    id: "sony-a7-iv",
    slug: "sony-a7-iv",
    title: "Sony Alpha A7 IV + 24-70mm GM Lens",
    description: "Flagship hybrid mirrorless full-frame camera with 33MP sensor, 4K 60p 10-bit recording, real-time eye autofocus, and Sony G-Master 24-70mm f/2.8 lens. Ideal for commercial shoots, events, and cinematic documentaries.",
    price_per_day: 3000,
    security_deposit: 10000,
    condition: "Like New",
    delivery_option: "both",
    city: "Dhaka",
    area: "Banani",
    avg_rating: 4.9,
    review_count: 64,
    is_featured: true,
    category: { id: "cameras", name: "Cameras", slug: "cameras" },
    owner: { id: "owner-cam", first_name: "Sadia", last_name: "Rahman", email: "sadia@renthub.com.bd", is_identity_verified: true, rating: 4.92 },
    images: [
      { url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80", is_primary: true },
      { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80", is_primary: false },
    ],
  },
  "macbook-air-m2": {
    id: "macbook-air-m2",
    slug: "macbook-air-m2",
    title: "MacBook Pro 16\" M3 Max (36GB Unified RAM / 1TB SSD)",
    description: "Extreme performance Apple workstation with 16-core CPU, 40-core GPU, Liquid Retina XDR display, and 22-hour battery life. Preloaded with Final Cut Pro, Adobe Premiere Pro, and Xcode for developer and video pros.",
    price_per_day: 3200,
    security_deposit: 12000,
    condition: "Flawless",
    delivery_option: "both",
    city: "Dhaka",
    area: "Dhanmondi",
    avg_rating: 4.95,
    review_count: 76,
    is_featured: true,
    category: { id: "electronics", name: "Electronics", slug: "electronics" },
    owner: { id: "owner-tech", first_name: "Farhan", last_name: "Masud", email: "farhan@renthub.com.bd", is_identity_verified: true, rating: 4.96 },
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=80", is_primary: true },
      { url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1600&q=80", is_primary: false },
    ],
  },
};

function getFallbackProduct(slug: string) {
  if (FALLBACK_PRODUCT_CATALOG[slug]) {
    return FALLBACK_PRODUCT_CATALOG[slug];
  }

  // Generic fallback generator for deal or dynamic slugs
  const readableTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    id: slug,
    slug: slug,
    title: readableTitle,
    description: `Verified rental item on RentHub Bangladesh. Thoroughly inspected, sanitized, and ready for pickup or doorstep delivery with 100% escrow security deposit protection.`,
    price_per_day: 2500,
    security_deposit: 5000,
    condition: "Good",
    delivery_option: "both",
    city: "Dhaka",
    area: "Gulshan",
    avg_rating: 4.85,
    review_count: 24,
    is_featured: false,
    category: { id: "general", name: "General", slug: "general" },
    owner: { id: "owner-general", first_name: "Verified", last_name: "Host", email: "host@renthub.com.bd", is_identity_verified: true, rating: 4.9 },
    images: [
      { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85", is_primary: true },
      { url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80", is_primary: false },
    ],
  };
}

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/v1/products/${slug}`)
      .then((res) => { if (!res.ok) throw new Error("Not found"); return res.json(); })
      .then((data) => {
        setProduct(data);
        setIsWishlisted(data.is_wishlisted || false);
        useRecentlyViewedStore.getState().recordView(data);
        const catSlug = data.category?.name?.toLowerCase();
        if (catSlug) {
          fetch(`${apiUrl}/api/v1/products?category_slug=${catSlug}&limit=5`)
            .then((r) => r.json())
            .then((list) => {
              setSimilarProducts(
                Array.isArray(list) ? list.filter((p: any) => p.slug !== data.slug).slice(0, 4) : []
              );
            }).catch(() => {});
        }
      })
      .catch(() => {
        // Fallback to local catalog if backend is offline or slug not in DB
        const fallback = getFallbackProduct(String(slug));
        if (fallback) {
          setProduct(fallback);
          setIsWishlisted(false);
          useRecentlyViewedStore.getState().recordView(fallback);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const days = Math.max(1, dayjs(returnDate).diff(dayjs(pickupDate), "day"));
  const pricePerPeriod = product
    ? durationMode === "Weekly" ? product.price_per_day * 6
    : durationMode === "Monthly" ? product.price_per_day * 25
    : product.price_per_day : 0;
  const periodLabel = durationMode === "Weekly" ? "week" : durationMode === "Monthly" ? "month" : "day";
  const serviceFee = product ? Math.round(product.price_per_day * days * 0.06) : 0;
  const subtotal = product ? product.price_per_day * days : 0;
  const total = subtotal + serviceFee + (product?.security_deposit || 0);

  const images: string[] = product
    ? [
        ...(product.images?.map((img: any) => img.url) || []),
        ...(product.image_url && !product.images?.find((i: any) => i.url === product.image_url)
          ? [product.image_url] : []),
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 size={40} className="text-indigo-500" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-slate-400 text-sm font-medium"
            >
              Loading product...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Package size={60} className="text-slate-300 mb-6" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h1>
          <p className="text-slate-500 mb-6">This listing doesn't exist or has been removed.</p>
          <button onClick={() => router.back()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            <ChevronLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const highlights = getHighlightsFromDescription(product.description || "");
  const ownerInitials = `${product.owner?.first_name?.[0] || "?"}${product.owner?.last_name?.[0] || ""}`;

  return (
    <div className="min-h-screen bg-[#F5F7FF]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main className="max-w-[1340px] mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumbs */}
        <Reveal>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="hover:text-indigo-600 transition-colors font-medium">Home</Link>
            <ChevronRight size={12} />
            <Link href={`/categories/${product.category?.slug || "vehicles"}`} className="hover:text-indigo-600 transition-colors font-medium">
              {product.category?.name || "Vehicles"}
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">{product.title}</span>
          </div>
        </Reveal>

        {/* Owner Preview Banner */}
        {isOwner && (
          <Reveal>
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-800/40">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-400/20">
                  <Eye size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Public Listing Preview</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                      Your Listing
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    This is how customers view your listing on the marketplace. Self-booking is disabled for owners.
                  </p>
                </div>
              </div>
              <Link
                href={`/listings/${product.slug || product.id}`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Settings size={14} /> Owner Management Portal
              </Link>
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">

          {/* ── Left: Gallery + Details ────────────────────────────────────── */}
          <div className="xl:col-span-8 space-y-6">

            {/* ── Cinematic Gallery & 360 Viewer ──────────────────────────── */}
            <Reveal>
              <div className="relative rounded-3xl overflow-hidden shadow-sm bg-white border border-slate-200/80">

                {/* 360° View Mode */}
                <AnimatePresence>
                  {view360Mode && images.length > 0 && (
                    <motion.div
                      key="360"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="h-[360px] sm:h-[460px] bg-slate-950 relative"
                    >
                      <View360
                        images={images}
                        onClose={() => setView360Mode(false)}
                        categorySlug={product.category?.slug}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Normal Gallery Mode (Bright & Crystal Clear) */}
                {!view360Mode && (
                  <div className="relative h-[360px] sm:h-[460px] group overflow-hidden bg-slate-950">
                    {images.length > 0 ? (
                      <>
                        {/* Parallax image - 100% CLEAR, NATURAL BRIGHTNESS */}
                        <motion.div
                          className="absolute inset-0"
                          style={{ y: heroY, scale: heroScale }}
                        >
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={activeImage}
                              src={images[activeImage]}
                              alt={product.title}
                              className="w-full h-full object-cover cursor-zoom-in"
                              onClick={() => setFullscreenModal(true)}
                              initial={{ opacity: 0, scale: 1.02 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </AnimatePresence>
                        </motion.div>

                        {/* Subtle bottom shadow ONLY for UI control contrast */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                        {/* Floating Top Bar: Badges + Action Buttons */}
                        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
                          <div className="flex items-center gap-2 pointer-events-auto">
                            {product.is_featured && (
                              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-md">
                                🔥 Featured
                              </span>
                            )}
                            <span className="bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                              {getAngleInfo(activeImage, images.length, product.category?.slug).icon} {getAngleInfo(activeImage, images.length, product.category?.slug).label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pointer-events-auto">
                            <motion.button
                              onClick={() => setFullscreenModal(true)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Fullscreen view"
                              className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-slate-700 hover:bg-white transition-all"
                            >
                              <Maximize2 size={15} />
                            </motion.button>
                            <motion.button
                              onClick={() => requireAuth(() => setIsWishlisted(!isWishlisted))}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-slate-700 hover:bg-white transition-all"
                            >
                              <Heart size={16} className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600"} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Nav arrows */}
                        {images.length > 1 && (
                          <>
                            <motion.button
                              onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                              whileHover={{ scale: 1.1, x: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-slate-800 transition-all opacity-0 group-hover:opacity-100 z-10"
                            >
                              <ChevronLeft size={20} />
                            </motion.button>
                            <motion.button
                              onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                              whileHover={{ scale: 1.1, x: 2 }}
                              whileTap={{ scale: 0.95 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-slate-800 transition-all opacity-0 group-hover:opacity-100 z-10"
                            >
                              <ChevronRight size={20} />
                            </motion.button>
                          </>
                        )}

                        {/* Floating Bottom Row: Dots + 360 View Button */}
                        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-10">
                          {/* Pagination Dots */}
                          <div className="flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                            {images.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                  activeImage === i ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                                }`}
                              />
                            ))}
                          </div>

                          {/* 360° CTA */}
                          {images.length > 1 && (
                            <motion.button
                              onClick={() => setView360Mode(true)}
                              whileHover={{ scale: 1.05, boxShadow: "0 6px 24px rgba(99,102,241,0.5)" }}
                              whileTap={{ scale: 0.96 }}
                              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/20"
                            >
                              <RotateCcw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
                              <span>View 360°</span>
                            </motion.button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <Package size={60} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── Angle Quick Switcher (Front, Back, Inside, Outside, 360) ── */}
                {images.length > 1 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Angles:</span>
                    {images.map((_, i) => {
                      const info = getAngleInfo(i, images.length, product.category?.slug);
                      const isActive = !view360Mode && activeImage === i;
                      return (
                        <button
                          key={i}
                          onClick={() => { setView360Mode(false); setActiveImage(i); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                          }`}
                        >
                          <span>{info.icon}</span>
                          <span>{info.short}</span>
                        </button>
                      );
                    })}

                    {/* Dedicated 360° Interactive Tab */}
                    <button
                      onClick={() => setView360Mode(!view360Mode)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ml-auto ${
                        view360Mode
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200 hover:from-purple-100 hover:to-indigo-100"
                      }`}
                    >
                      <RotateCcw size={12} className={view360Mode ? "animate-spin" : ""} />
                      <span>{view360Mode ? "360° Mode Active" : "View 360°"}</span>
                    </button>
                  </div>
                )}

                {/* ── Thumbnail Strip ────────────────────────────────────────── */}
                {images.length > 1 && !view360Mode && (
                  <div className="p-3 bg-white border-t border-slate-100 flex gap-2.5 overflow-x-auto hide-scrollbar">
                    {images.map((img, i) => {
                      const info = getAngleInfo(i, images.length, product.category?.slug);
                      return (
                        <motion.button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative shrink-0 w-[84px] h-[60px] rounded-xl overflow-hidden border-2 transition-all group ${
                            activeImage === i
                              ? "border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-[9px] text-white font-medium py-0.5 text-center truncate px-1">
                            {info.short}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>

            {/* ── Stats Row ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: (product.avg_rating || 4.8).toFixed(1), label: "Rating", icon: "⭐" },
                { value: `${Math.max(20, (product.review_count || 0) * 2)}+`, label: "Bookings", icon: "📅" },
                { value: product.review_count || 0, label: "Reviews", icon: "💬" },
                { value: product.condition || "Good", label: "Condition", icon: "✅" },
              ].map((stat, i) => (
                <StatCard key={i} value={String(stat.value)} label={stat.label} icon={stat.icon} />
              ))}
            </div>

            {/* ── Title + Meta ───────────────────────────────────────────────── */}
            <Reveal delay={0.05}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100"
                  >
                    <Shield size={12} /> Verified Listing
                  </motion.div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
                  {product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.div
                          key={s}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * s, type: "spring" }}
                        >
                          <Star
                            size={14}
                            className={s <= Math.round(product.avg_rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                          />
                        </motion.div>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{(product.avg_rating || 4.8).toFixed(1)}</span>
                    <span className="text-sm text-slate-500">({product.review_count || 0} Reviews)</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500 font-medium">
                    {Math.max(20, (product.review_count || 0) * 2)}+ Bookings
                  </span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    {product.area}, {product.city}
                  </div>
                </div>

                {/* Price row */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
                >
                  <span className="text-2xl font-black text-slate-900">
                    ৳ {product.price_per_day.toLocaleString()}
                    <span className="text-sm font-medium text-slate-500 ml-1">/ day</span>
                  </span>
                  <span className="text-sm text-slate-500">৳ {(product.price_per_day * 6).toLocaleString()} / week</span>
                  <span className="text-sm text-slate-500">৳ {(product.price_per_day * 25).toLocaleString()} / month</span>
                </motion.div>
              </div>
            </Reveal>

            {/* ── Highlights ─────────────────────────────────────────────────── */}
            <Reveal delay={0.1}>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-3">Highlights</h2>
                <div className="flex flex-wrap gap-2.5">
                  {highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, type: "spring" }}
                      whileHover={{ scale: 1.06, y: -2, boxShadow: "0 4px 16px rgba(99,102,241,0.15)" }}
                      className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-default transition-colors hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50"
                    >
                      <span className="text-indigo-400">{h.icon}</span>
                      {h.label}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* ── Description ─────────────────────────────────────────────────── */}
            <Reveal delay={0.1}>
              <div>
                <p className={`text-sm text-slate-600 leading-relaxed ${!descExpanded ? "line-clamp-3" : ""}`}>
                  {product.description || `Well maintained ${product.title} in excellent condition. Perfect for city rides, corporate use or family trips. Comfortable, fuel efficient and clean interior.`}
                </p>
                <motion.button
                  onClick={() => setDescExpanded(!descExpanded)}
                  whileHover={{ x: 2 }}
                  className="mt-2 flex items-center gap-1 text-indigo-600 text-xs font-bold hover:underline"
                >
                  {descExpanded ? "Show less" : "Read more"}
                  <motion.div animate={{ rotate: descExpanded ? 180 : 0 }}>
                    <ChevronDown size={14} />
                  </motion.div>
                </motion.button>
              </div>
            </Reveal>

            {/* ── Share ───────────────────────────────────────────────────────── */}
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Share:</span>
                {["💬", "✉️", "📘", "🔗"].map((icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 bg-slate-100 hover:bg-indigo-50 rounded-full flex items-center justify-center text-sm transition-colors"
                  >
                    {icon}
                  </motion.button>
                ))}
              </div>
            </Reveal>

            {/* ── Tabs ────────────────────────────────────────────────────────── */}
            <Reveal>
              <div className="border-b border-slate-200">
                <div className="flex gap-0 overflow-x-auto relative">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-all relative ${
                        activeTab === tab
                          ? "text-indigo-600 border-transparent"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab} {tab === "Reviews" && `(${product.review_count || 0})`}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tabIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* ── Tab Content ────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "Overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Features */}
                    <TiltCard className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4 text-sm">Features</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {FEATURE_KEYWORDS.slice(0, 12).map((f, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <span className="text-indigo-400">{f.icon}</span>
                            {f.label}
                          </motion.div>
                        ))}
                      </div>
                    </TiltCard>

                    {/* About Owner */}
                    <TiltCard className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4 text-sm">About the Owner</h3>
                      <div className="flex items-start gap-4">
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md shadow-indigo-200"
                        >
                          {ownerInitials}
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-sm">
                              {product.owner?.first_name} {product.owner?.last_name}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                              <Check size={9} /> Verified
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mb-1">
                            ⭐ {(product.avg_rating || 4.9).toFixed(1)} ({product.review_count || 86} Reviews) • {Math.max(50, (product.review_count || 86) + 39)} Listings
                          </div>
                          <div className="text-xs text-slate-400">
                            Response time: within 1 hour<br />
                            Member since: {dayjs(product.owner?.created_at).format("MMM YYYY")}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => requireAuth(() => setChatWarning(true))}
                              className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => requireAuth(() => setChatWarning(true))}
                              className="w-9 h-[30px] border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                              <MessageCircle size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TiltCard>

                    {/* Reviews Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
                    >
                      <h3 className="font-bold text-slate-900 mb-4 text-sm">Customer Reviews</h3>
                      <div className="flex gap-8">
                        <div className="text-center shrink-0">
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="text-5xl font-black text-slate-900 leading-none"
                          >
                            {(product.avg_rating || 4.8).toFixed(1)}
                          </motion.div>
                          <div className="flex items-center gap-0.5 justify-center mt-2 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14} className={s <= Math.round(product.avg_rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                          <div className="text-xs text-slate-400">({product.review_count || 0} Reviews)</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          {[{ stars: 5, pct: 85 }, { stars: 4, pct: 10 }, { stars: 3, pct: 3 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 }].map(({ stars, pct }) => (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 w-3 text-right font-semibold">{stars}</span>
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${pct}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: (5 - stars) * 0.08, ease: "easeOut" }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 w-6">{pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">SA</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-800">Sabir Ahmed</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} className="fill-amber-400 text-amber-400" />)}
                            </div>
                            <span className="text-[10px] text-slate-400">2 days ago</span>
                          </div>
                          <p className="text-xs text-slate-600">Car was in excellent condition. Very smooth ride and owner was very helpful.</p>
                        </div>
                      </div>
                      <button className="mt-3 text-xs font-bold text-indigo-600 hover:underline">View all reviews →</button>
                    </motion.div>
                  </div>
                )}

                {activeTab === "Features" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3.5">
                      {FEATURE_KEYWORDS.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-2.5 text-sm text-slate-600"
                        >
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">{f.icon}</div>
                          {f.label}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Specifications" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ["Condition", product.condition || "Good"],
                        ["Delivery", product.delivery_option === "both" ? "Pick-up & Delivery" : product.delivery_option || "Pick-up"],
                        ["Location", `${product.area || ""}, ${product.city || ""}`],
                        ["Status", product.status || "Available"],
                        ["Category", product.category?.name || "Vehicles"],
                        ["Security Deposit", `৳ ${(product.security_deposit || 0).toLocaleString()}`],
                      ].map(([label, val], i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-slate-50 hover:bg-indigo-50/40 rounded-xl p-3 transition-colors"
                        >
                          <div className="text-xs text-slate-400 font-medium mb-0.5">{label}</div>
                          <div className="text-sm font-bold text-slate-800 capitalize">{val}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center py-12 text-slate-400">
                    <Star size={36} className="mx-auto mb-3 text-slate-200" />
                    <p className="font-semibold text-slate-600">Reviews feature coming soon</p>
                    <p className="text-xs mt-1">This product has {product.review_count || 0} reviews</p>
                  </div>
                )}

                {activeTab === "Location" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={16} className="text-indigo-500" />
                      <span className="font-semibold text-slate-800">{product.area}, {product.city}</span>
                    </div>
                    <div className="h-40 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-indigo-100">
                      📍 Map view coming soon
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Similar Items ──────────────────────────────────────────────── */}
            {similarProducts.length > 0 && (
              <Reveal delay={0.1}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900">Similar Items You Might Like</h2>
                    <Link href={`/categories/${product.category?.slug || "vehicles"}`} className="text-xs font-bold text-indigo-600 hover:underline">View all</Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {similarProducts.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(99,102,241,0.12)" }}
                      >
                        <Link href={`/products/${p.slug}`} className="block group">
                          <div className="bg-white rounded-xl overflow-hidden border border-slate-100 transition-all">
                            <div className="h-[100px] overflow-hidden bg-slate-100">
                              <motion.img
                                whileHover={{ scale: 1.08 }}
                                transition={{ duration: 0.4 }}
                                src={p.image_url || "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=80"}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2.5">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-700">{(p.avg_rating || 4.5).toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400">({p.review_count || 0})</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800 line-clamp-1 mb-0.5 group-hover:text-indigo-600 transition-colors">{p.title}</p>
                              <p className="text-[11px] font-bold text-indigo-600">৳ {(p.price_per_day || 0).toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">/ day</span></p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin size={9} /> {p.area || ""}, {p.city || "Dhaka"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* ── Right: Booking Widget ──────────────────────────────────────────── */}
          <div className="xl:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-6 space-y-3"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Price Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/30">
                  <div>
                    <motion.span
                      key={pricePerPeriod}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-2xl font-black text-slate-900 inline-block"
                    >
                      ৳ {pricePerPeriod.toLocaleString()}
                    </motion.span>
                    <span className="text-sm text-slate-500 ml-1">/ {periodLabel}</span>
                  </div>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">Price Details</button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Duration Mode */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Select Rental Duration</label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden relative">
                      {(["Daily", "Weekly", "Monthly"] as DurationMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setDurationMode(mode)}
                          className={`flex-1 py-2 text-xs font-bold transition-all relative z-10 ${
                            durationMode === mode ? "text-indigo-600" : "text-slate-500 hover:text-slate-700 bg-slate-50"
                          }`}
                        >
                          {durationMode === mode && (
                            <motion.div
                              layoutId="durationBg"
                              className="absolute inset-0 bg-white border border-indigo-400 rounded-lg shadow-sm"
                              style={{ zIndex: -1 }}
                            />
                          )}
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pick-up Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">Pick-up Date & Time</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium transition-colors" />
                      </div>
                      <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium cursor-pointer">
                        {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Return Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">Return Date & Time</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium" />
                      </div>
                      <select value={returnTime} onChange={(e) => setReturnTime(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-2.5 outline-none focus:border-indigo-500 bg-white font-medium cursor-pointer">
                        {["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pick-up / Delivery Toggle */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Pick-up / Delivery</label>
                    <div className="flex gap-2">
                      {(["Pick-up", "Delivery"] as DeliveryMode[]).map((mode) => (
                        <motion.button
                          key={mode}
                          onClick={() => setDeliveryMode(mode)}
                          whileTap={{ scale: 0.97 }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                            deliveryMode === mode
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                              : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {deliveryMode === mode && (
                            <motion.div
                              layoutId="deliveryDot"
                              className="w-2 h-2 rounded-full bg-indigo-500"
                            />
                          )}
                          {mode}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2.5 py-3 border-t border-b border-slate-100">
                    {[
                      { label: `Price (${days} days)`, value: `৳ ${subtotal.toLocaleString()}` },
                      { label: "Service Fee", value: `৳ ${serviceFee.toLocaleString()}` },
                      { label: "Security Deposit", value: `৳ ${(product.security_deposit || 0).toLocaleString()}` },
                    ].map(({ label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex justify-between text-xs text-slate-600"
                      >
                        <span>{label}</span>
                        <span className="font-semibold text-slate-800">{value}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Book Buttons */}
                  {isOwner ? (
                    <div className="space-y-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Owner Preview</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          You are viewing your own listing. Booking and rental cart are disabled for your own items.
                        </p>
                      </div>
                      <Link
                        href={`/listings/${product.slug || product.id}`}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Settings size={16} /> Manage in Owner Portal
                      </Link>
                    </div>
                  ) : bookingSuccess ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-center text-sm shadow-md flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Request Submitted! Redirecting...
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      <MagneticButton
                        onClick={handleBookNow}
                        disabled={bookingLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-indigo-200/60 transition-all flex items-center justify-center gap-2"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending Request...
                          </>
                        ) : "Request to Book Now"}
                      </MagneticButton>

                      <MagneticButton
                        onClick={(e: React.MouseEvent) => {
                          if (!requireAuth()) return;
                          const primaryImg = product.image_url || product.images?.find((img: any) => img.is_primary)?.url || product.images?.[0]?.url || "";
                          triggerFlyToCart({
                            image: primaryImg,
                            startElement: e.currentTarget as HTMLElement,
                            item: {
                              id: product.id,
                              title: product.title,
                              slug: product.slug,
                              category: product.category?.name || "General",
                              price_per_day: product.price_per_day,
                              security_deposit: product.security_deposit || 2000,
                              image_url: primaryImg,
                              owner_id: product.owner_id || "owner-1",
                              owner_name: product.owner?.first_name ? `${product.owner.first_name} ${product.owner.last_name || ""}` : "Verified Owner",
                              start_date: dayjs(pickupDate).format("YYYY-MM-DD"),
                              end_date: dayjs(returnDate).format("YYYY-MM-DD"),
                              delivery_option: deliveryMode.toLowerCase(),
                            },
                          });

                          setJustAddedToCart(true);
                          setTimeout(() => {
                            setJustAddedToCart(false);
                          }, 2500);
                        }}
                        className={`w-full py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                          justAddedToCart
                            ? "bg-emerald-500 text-white border border-emerald-500 shadow-emerald-500/25"
                            : "bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        }`}
                      >
                        {justAddedToCart ? (
                          <>
                            <Check size={16} className="stroke-[3]" /> Added to Cart!
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} /> Add to Rental Cart
                          </>
                        )}
                      </MagneticButton>
                    </div>
                  )}

                  {bookingError && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-start gap-1.5"
                    >
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      {bookingError}
                    </motion.div>
                  )}

                  {!isOwner && (
                    <>
                      <MagneticButton
                        onClick={() => requireAuth(() => setChatWarning(true))}
                        className="w-full py-3 border-2 border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={15} /> Chat with Owner
                      </MagneticButton>

                      {chatWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex items-start gap-1.5"
                        >
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          Please submit a booking request or add this item to your cart first to start a chat with the owner.
                        </motion.div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Shield size={12} className="text-slate-300" />
                    Safe & Secure Payments. 24/7 Support.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── Fullscreen Lightbox Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {fullscreenModal && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 sm:p-6"
          >
            {/* Top Bar */}
            <div className="w-full max-w-6xl flex items-center justify-between z-10 py-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                  {getAngleInfo(activeImage, images.length, product.category?.slug).icon} {getAngleInfo(activeImage, images.length, product.category?.slug).label}
                </span>
                <span className="text-white/60 text-xs font-semibold">
                  Photo {activeImage + 1} of {images.length}
                </span>
              </div>
              <button
                onClick={() => setFullscreenModal(false)}
                className="w-10 h-10 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors text-base font-bold shadow-lg border border-white/20"
              >
                ✕
              </button>
            </div>

            {/* Center Image with Navigation */}
            <div className="relative max-w-5xl max-h-[75vh] w-full flex-1 flex items-center justify-center">
              <motion.img
                key={activeImage}
                src={images[activeImage]}
                alt={product.title}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20 shadow-xl"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20 shadow-xl"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto max-w-full py-2 px-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-indigo-400 scale-105 shadow-md shadow-indigo-500/50 ring-2 ring-indigo-400/40"
                        : "border-transparent opacity-50 hover:opacity-90"
                    }`}
                  >
                    <img src={img} alt={`thumb-fs-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
