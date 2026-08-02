"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Bell, MessageSquare, LogOut, User, ChevronDown, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useCartStore } from "@/store/cartStore";

/**
 * DashboardHeader — the global sticky top bar used by every authenticated page.
 * Matches exactly what the CustomerDashboard shows:
 *   [Search bar] ----------- [Location] | [Cart] [Bell] [Msg] [Avatar dropdown]
 */
export default function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0 h-[60px] z-30 font-sans">

      {/* Search */}
      <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 max-w-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for anything (cars, laptops, apartments...)"
          className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-full"
        />
      </div>

      <div className="flex-1" />

      {/* Location */}
      <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
        <MapPin size={16} /> Dhaka
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Shopping Cart Icon with Badge */}
      <Link
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

      {/* Notifications */}
      <button className="p-2 text-slate-500 hover:text-slate-700 relative hover:bg-slate-50 rounded-full transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-violet-600 rounded-full border-2 border-white" />
      </button>

      {/* Messages */}
      <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors hidden sm:block">
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Avatar dropdown */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-slate-900 text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
              <p className="text-slate-500 text-xs mt-1 capitalize">{user.primary_role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User size={16} /> Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50 mt-1 pt-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
