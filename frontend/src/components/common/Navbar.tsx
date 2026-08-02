"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Bell,
  MessageSquare,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User,
  CarFront,
  LayoutDashboard,
  Heart,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 shadow-sm font-sans">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CarFront size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 leading-tight tracking-tight">
                Rent<span className="text-blue-600">Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none hidden sm:block">
                Rent Anything, Anytime
              </span>
            </div>
          </Link>

          {/* Search Bar & Location */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xl mx-4 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-inner">
            <Search size={16} className="text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything (cars, laptops, apartments...)"
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none font-medium"
            />
            <div className="w-px h-5 bg-slate-200 mx-2 shrink-0" />
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 shrink-0 hover:text-blue-600 cursor-pointer">
              <MapPin size={14} className="text-slate-400" />
              <span>Dhaka</span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Links */}
            <div className="hidden lg:flex items-center gap-5 mr-2">
              <Link href="/categories" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                Categories
              </Link>
              <Link href="/become-lister" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                Become a Lister
              </Link>
            </div>

            {user ? (
              <>
                {/* Wishlist Icon */}
                <Link href="/wishlist" className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-colors hidden sm:flex items-center justify-center">
                  <Heart size={18} />
                </Link>

                {/* Notification Icon */}
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors relative flex items-center justify-center">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                </button>

                {/* Messages Icon */}
                <Link href="/messages" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors hidden sm:flex items-center justify-center">
                  <MessageSquare size={18} />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.first_name?.[0] || "U"}{user.last_name?.[0] || ""}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {user.primary_role || "Customer"}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                        <p className="text-xs font-bold text-slate-800">{user.first_name} {user.last_name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{user.primary_role}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <User size={15} /> Profile
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors sm:hidden"
                      >
                        <Heart size={15} /> Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 border-t border-slate-100 mt-1 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anything..."
              className="w-full bg-transparent text-xs text-slate-800 outline-none"
            />
          </form>
          <div className="flex flex-col gap-1 pt-2">
            <Link href="/categories" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
              Browse Categories
            </Link>
            <Link href="/become-lister" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
              Become a Lister
            </Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
