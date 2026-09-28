"use client";

import Link from "next/link";
import { Search, MapPin, CarFront, LayoutDashboard, LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CategoryNavbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="h-[76px] bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Brand */}
      <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
        <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-2 rounded-xl shadow-sm">
          <CarFront className="text-white w-6 h-6" />
        </div>
        <div className="hidden sm:block">
          <span className="text-slate-900 font-bold text-xl block leading-tight">RentHub</span>
          <span className="text-slate-400 text-[10px] block font-medium">Rent Anything, Anytime</span>
        </div>
      </Link>

      {/* Middle: Search */}
      <div className="flex-1 max-w-2xl mx-6 hidden md:block">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 focus-within:bg-white transition-all shadow-xs"
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for anything (cars, laptops, apartments...)"
            className="bg-transparent border-none outline-none w-full px-3 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 font-medium"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shadow-violet-500/20 transition-all shrink-0 cursor-pointer"
          >
            <span>Search</span>
            <Search size={11} />
          </button>
        </form>
      </div>

      {/* Right: Location & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        <button className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <MapPin size={16} className="text-slate-500" />
          Dhaka
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm hover:shadow-md transition-all border-2 border-white ring-2 ring-slate-100"
            >
              {user.first_name.substring(0, 2).toUpperCase()}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <Link href="/dashboard" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1 border-t border-slate-50 pt-2">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
