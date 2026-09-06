"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useCartStore } from "@/store/cartStore";
import { NotificationDropdown } from "./NotificationDropdown";

/**
 * DashboardHeader — global top bar used across authenticated pages.
 * Supports dual role mode switching (Customer ↔ Owner).
 */
export default function DashboardHeader() {
  const { user, logout, activeRole, setActiveRole, toggleActiveRole } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isOwnerUser = user?.is_owner || user?.primary_role === "owner" || user?.role_names?.includes("owner") || user?.primary_role === "admin";

  const handleSignOut = async () => {
    await logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.replace("/login");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0 h-[60px] z-30 font-sans">
      {/* Search */}
      <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 max-w-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cars, cameras, apartments..."
          className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
        />
      </div>

      <div className="flex-1" />

      {/* Mode Switcher Button (if user is verified owner/lister) */}
      {isOwnerUser && (
        <button
          onClick={() => {
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
      )}

      {/* Location */}
      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
        <MapPin size={16} /> Dhaka
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Shopping Cart Icon with Badge */}
      <Link
        id="header-cart-icon"
        href="/cart"
        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors relative"
        title="View Rental Cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {items.length}
          </span>
        )}
      </Link>

      {/* Dynamic Notifications Dropdown */}
      <NotificationDropdown />

      {/* Messages */}
      <Link
        href={user?.primary_role === "admin" ? "/admin/messages" : "/messages"}
        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors hidden sm:block"
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
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                {user.first_name?.[0] || "U"}{user.last_name?.[0] || ""}
              </div>
              {(user.identity_verification_status === "VERIFIED" || user.is_identity_verified) && (
                <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 text-white ring-1 ring-white" title="Verified User">
                  <ShieldCheck size={10} />
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-slate-900 text-sm font-bold leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-slate-500 text-xs mt-1 capitalize">
                {isOwnerUser ? (activeRole === "owner" ? "Owner Mode 🏪" : "Customer Mode 🛍️") : (user.primary_role || "Customer")}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.email}</p>
              </div>

              {/* Mode Toggle Button */}
              {isOwnerUser && (
                <div className="p-2 border-b border-slate-100">
                  <button
                    onClick={() => {
                      toggleActiveRole();
                      setDropdownOpen(false);
                      router.push("/dashboard");
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-indigo-700 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {activeRole === "owner" ? <ShoppingBag size={15} /> : <Store size={15} />}
                      <span>{activeRole === "owner" ? "Switch to Customer Mode" : "Switch to Owner Mode"}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-indigo-600 border border-slate-200 font-extrabold uppercase">
                      {activeRole}
                    </span>
                  </button>
                </div>
              )}

              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                >
                  <CarFront size={15} /> My Listings
                </Link>
              )}

              <Link
                href="/bookings"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
              >
                <Calendar size={15} /> My Bookings
              </Link>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
              >
                <User size={15} /> Profile & Settings
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2 cursor-pointer"
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
    </header>
  );
}
