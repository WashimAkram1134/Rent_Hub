"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Bell,
  MessageSquare,
  LogOut,
  User,
  ChevronDown,
  ShoppingCart,
  Store,
  ShoppingBag,
  CarFront,
  ShieldCheck,
  Calendar,
  Shield,
  Package,
  CreditCard,
  Users,
  Loader2,
  X,
  ExternalLink
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useCartStore } from "@/store/cartStore";
import { NotificationDropdown } from "./NotificationDropdown";
import CustomerAccountModal from "@/components/common/CustomerAccountModal";
import apiClient from "@/lib/axios";

/**
 * DashboardHeader — global top bar used across authenticated pages.
 * Supports dual/triple role mode switching (Customer ↔ Owner ↔ Business Admin).
 * Features global omni-search for platform operators.
 */
export default function DashboardHeader() {
  const { user, logout, activeRole, setActiveRole } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Omni-search state
  const [omniOpen, setOmniOpen] = useState(false);
  const [omniLoading, setOmniLoading] = useState(false);
  const [omniResults, setOmniResults] = useState<{
    bookings: any[];
    listings: any[];
    users: any[];
    payouts: any[];
  }>({ bookings: [], listings: [], users: [], payouts: [] });
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isAdminUser = Boolean(user?.primary_role === "admin" || user?.role_names?.includes("admin"));
  const isOwnerUser = Boolean(user?.is_owner || user?.primary_role === "owner" || user?.role_names?.includes("owner") || isAdminUser);
  const hasCustomerId = Boolean(
    user?.customer_id ||
    user?.is_customer ||
    user?.role_names?.includes("customer") ||
    user?.primary_role === "customer"
  );

  const isAdminMode = isAdminUser && (activeRole === "admin" || pathname.startsWith("/admin"));

  // Debounced omni-search
  useEffect(() => {
    if (!isAdminUser || !search || search.trim().length < 2) {
      setOmniResults({ bookings: [], listings: [], users: [], payouts: [] });
      setOmniLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setOmniLoading(true);
        const res = await apiClient.get("/analytics/admin-omni-search", {
          params: { q: search.trim() },
        });
        if (res.data?.results) {
          setOmniResults(res.data.results);
          setOmniOpen(true);
        }
      } catch (e) {
        console.error("Omni-search error:", e);
      } finally {
        setOmniLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [search, isAdminUser]);

  // Click outside to close omni-search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setOmniOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMyBookingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen(false);

    if (hasCustomerId) {
      setActiveRole("customer");
      router.push("/bookings");
    } else {
      setShowCustomerModal(true);
    }
  };

  const handleSignOut = async () => {
    await logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.replace("/login");
    }
  };

  const totalResultsCount =
    omniResults.bookings.length +
    omniResults.listings.length +
    omniResults.users.length +
    omniResults.payouts.length;

  return (
    <header className="relative z-50 bg-white dark:bg-[#0c101d] border-b border-gray-100 dark:border-slate-800 px-5 py-3 flex items-center gap-3 shrink-0 h-[60px] font-sans shadow-xs transition-colors">
      {/* Omni / Global Search */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (totalResultsCount > 0) setOmniOpen(true);
            }}
            placeholder={
              isAdminMode
                ? "Search #RH..., users, listings, payouts..."
                : activeRole === "owner"
                ? "Search for listings, bookings, or earnings..."
                : "Search cars, cameras, apartments..."
            }
            className="bg-transparent outline-none text-xs sm:text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 w-full"
          />
          {omniLoading && <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />}
          {search && (
            <button onClick={() => { setSearch(""); setOmniOpen(false); }} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Admin Omni-Search Live Results Popover */}
        {isAdminUser && omniOpen && (
          <div className="absolute left-0 top-full mt-2 w-full min-w-[360px] bg-white dark:bg-[#131929] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[460px] overflow-y-auto">
            <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>QUICK RESULTS FOR "{search}"</span>
              <span>{totalResultsCount} found</span>
            </div>

            {totalResultsCount === 0 && !omniLoading ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No matching bookings, listings, users, or payouts found.
              </div>
            ) : null}

            {/* Bookings */}
            {omniResults.bookings.length > 0 && (
              <div className="py-2">
                <p className="px-4 text-[10px] font-extrabold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Bookings
                </p>
                {omniResults.bookings.map((b) => (
                  <Link
                    key={b.id}
                    href={b.href}
                    onClick={() => setOmniOpen(false)}
                    className="px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">{b.code}</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{b.item_name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase">
                      {b.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Listings */}
            {omniResults.listings.length > 0 && (
              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                <p className="px-4 text-[10px] font-extrabold text-amber-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Package size={12} /> Listings
                </p>
                {omniResults.listings.map((l) => (
                  <Link
                    key={l.id}
                    href={l.href}
                    onClick={() => setOmniOpen(false)}
                    className="px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="truncate mr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{l.title}</p>
                      <p className="text-[10px] text-slate-400">৳{l.price_per_day}/day</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 uppercase shrink-0">
                      {l.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Users */}
            {omniResults.users.length > 0 && (
              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                <p className="px-4 text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Users size={12} /> Users
                </p>
                {omniResults.users.map((u) => (
                  <Link
                    key={u.id}
                    href={u.href}
                    onClick={() => setOmniOpen(false)}
                    className="px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 uppercase">
                      {u.role}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Payouts */}
            {omniResults.payouts.length > 0 && (
              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                <p className="px-4 text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CreditCard size={12} /> Payouts
                </p>
                {omniResults.payouts.map((py) => (
                  <Link
                    key={py.id}
                    href={py.href}
                    onClick={() => setOmniOpen(false)}
                    className="px-4 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">{py.payout_id}</p>
                      <p className="text-[10px] text-slate-400">{py.account_name} • ৳{py.net_amount}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase">
                      {py.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Role Switcher Pill */}
      {isAdminUser ? (
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => {
              setActiveRole("admin");
              router.push("/dashboard");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              isAdminMode
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Shield size={13} /> Admin
          </button>
          <button
            onClick={() => {
              setActiveRole("owner");
              router.push("/dashboard");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              !isAdminMode && activeRole === "owner"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Store size={13} /> Owner
          </button>
          <button
            onClick={() => {
              setActiveRole("customer");
              router.push("/dashboard");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              !isAdminMode && activeRole === "customer"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <ShoppingBag size={13} /> Customer
          </button>
        </div>
      ) : isOwnerUser ? (
        <button
          onClick={() => {
            if (activeRole === "owner" && !hasCustomerId) {
              setShowCustomerModal(true);
              return;
            }
            const nextMode = activeRole === "owner" ? "customer" : "owner";
            setActiveRole(nextMode);
            router.push("/dashboard");
          }}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
            activeRole === "customer"
              ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
          }`}
          title={activeRole === "customer" ? "Switch to Owner view" : "Switch to Customer view"}
        >
          {activeRole === "customer" ? (
            <>
              <Store size={14} className="text-indigo-600" />
              <span>Owner Mode 🏪</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} className="text-emerald-600" />
              <span>Customer Mode 🛍️</span>
            </>
          )}
        </button>
      ) : null}

      {/* Location */}
      <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
        <MapPin size={16} /> Dhaka
      </button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Shopping Cart Icon (Hidden in Admin Mode) */}
      {!isAdminMode && (
        <Link
          id="header-cart-icon"
          href="/cart"
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors relative"
          title="View Rental Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {items.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {items.length}
            </span>
          )}
        </Link>
      )}

      {/* Dynamic Notifications Dropdown */}
      <NotificationDropdown />

      {/* Messages */}
      <Link
        href={isAdminMode ? "/admin/messages" : "/messages"}
        className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block"
        title="Messages & Inquiries"
      >
        <MessageSquare className="w-5 h-5" />
      </Link>

      {/* Avatar dropdown or Guest Auth Buttons */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 cursor-pointer"
          >
            <div className="relative">
              <div className={`w-9 h-9 rounded-full ${
                isAdminMode 
                  ? "bg-gradient-to-tr from-amber-500 to-amber-600" 
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600"
              } text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white dark:ring-slate-800 overflow-hidden`}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  `${user.first_name?.[0] || "U"}${user.last_name?.[0] || ""}`
                )}
              </div>
              {(user.identity_verification_status === "VERIFIED" || user.is_identity_verified) && (
                <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 text-white ring-1 ring-white" title="Verified User">
                  <ShieldCheck size={10} />
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-slate-900 dark:text-white text-sm font-bold leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 capitalize font-medium">
                {isAdminMode ? "Business Admin" : activeRole === "owner" ? "Owner" : "Customer"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#131929] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
                {isAdminUser && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    BUSINESS ADMIN
                  </span>
                )}
              </div>

              {isAdminUser && (
                <Link
                  href="/dashboard"
                  onClick={() => {
                    setActiveRole("admin");
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                >
                  <Shield size={15} /> Business Admin Center
                </Link>
              )}

              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
              >
                <Store size={15} /> Dashboard
              </Link>

              {isOwnerUser && (
                <Link
                  href="/listings"
                  onClick={() => {
                    setActiveRole("owner");
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                >
                  <CarFront size={15} /> My Listings
                </Link>
              )}

              <button
                onClick={handleMyBookingsClick}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Calendar size={15} /> My Bookings
              </button>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
              >
                <User size={15} /> Profile & Settings
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 cursor-pointer"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 pl-2">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
          >
            Register
          </Link>
        </div>
      )}

      {/* Customer Account Activation Modal */}
      <CustomerAccountModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </header>
  );
}
