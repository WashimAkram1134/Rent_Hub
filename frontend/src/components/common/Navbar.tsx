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
  X,
  ShieldCheck,
  Store,
  ShoppingBag,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useWebSocket } from "@/providers/WebSocketProvider";
import api from "@/lib/axios";
import { Notification } from "@/types";
import { useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const { user, logout, activeRole, setActiveRole, toggleActiveRole } = useAuthStore();
  const { latestNotification } = useWebSocket();

  const isOwnerUser = user?.is_owner || user?.primary_role === "owner" || user?.role_names?.includes("owner") || user?.primary_role === "admin";
  const isPendingLister = !isOwnerUser && user?.lister_status === "pending";

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (latestNotification) {
      setNotifications(prev => [latestNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [latestNotification]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      // Assuming API returns array directly based on FastAPI endpoint setup
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await api.put(`/notifications/${notification.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    setShowNotifications(false);
    if (notification.reference_id && notification.reference_type === "booking") {
      router.push(`/bookings/${notification.reference_id}`);
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
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 shrink-0 group">
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
            {/* Quick Links / Mode Switcher */}
            <div className="hidden lg:flex items-center gap-4 mr-2">
              <Link href="/categories" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                Categories
              </Link>

              {/* Mode Switcher or Become a Lister */}
              {isOwnerUser ? (
                <button
                  onClick={() => {
                    const nextMode = activeRole === "owner" ? "customer" : "owner";
                    setActiveRole(nextMode);
                    router.push("/dashboard");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                    activeRole === "customer"
                      ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  }`}
                  title={activeRole === "customer" ? "Switch to Owner view to manage listings and bookings" : "Switch to Customer view to browse and rent items"}
                >
                  {activeRole === "customer" ? (
                    <>
                      <Store size={14} className="text-indigo-600" />
                      <span>Switch to Owner Mode</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} className="text-emerald-600" />
                      <span>Switch to Customer Mode</span>
                    </>
                  )}
                </button>
              ) : isPendingLister ? (
                <Link
                  href="/become-lister"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-all"
                >
                  <Clock size={13} className="text-amber-600" />
                  <span>Application Pending ⏳</span>
                </Link>
              ) : (
                <Link
                  href={user ? "/become-lister" : "/login?returnUrl=/become-lister"}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Become a Lister
                </Link>
              )}
            </div>

            {user ? (
              <>
                {/* Wishlist Icon */}
                <Link href="/wishlist" className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-colors hidden sm:flex items-center justify-center">
                  <Heart size={18} />
                </Link>

                {/* Notification Icon */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setDropdownOpen(false);
                    }}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors relative flex items-center justify-center"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">No notifications yet</div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                              <p className="text-xs font-semibold text-slate-800 mb-1">{notif.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2">{notif.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Icon */}
                <Link href="/messages" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors hidden sm:flex items-center justify-center">
                  <MessageSquare size={18} />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-xl hover:bg-slate-50 border border-slate-200/60 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {user.first_name?.[0] || "U"}{user.last_name?.[0] || ""}
                      </div>
                      {(user.identity_verification_status === "VERIFIED" || user.is_identity_verified) && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 text-white ring-1 ring-white" title="Verified User">
                          <ShieldCheck size={10} />
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-800 leading-tight">
                          {user.first_name} {user.last_name}
                        </span>
                        {(user.identity_verification_status === "VERIFIED" || user.is_identity_verified) && (
                          <span className="text-emerald-600" title="Identity Verified">
                            <ShieldCheck size={13} />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {isOwnerUser ? (activeRole === "owner" ? "Owner Mode 🏪" : "Customer Mode 🛍️") : (user.primary_role || "Customer")}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">{user.first_name} {user.last_name}</p>
                          {(user.identity_verification_status === "VERIFIED" || user.is_identity_verified) && (
                            <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <ShieldCheck size={11} /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 capitalize">{user.email}</p>
                      </div>

                      {/* Mode Toggle Item for Multi-Role Users */}
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
                        className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>

                      {isOwnerUser && (
                        <Link
                          href="/listings"
                          onClick={() => {
                            setActiveRole("owner");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                        >
                          <CarFront size={15} /> My Listings
                        </Link>
                      )}

                      <Link
                        href="/bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <User size={15} /> My Bookings
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                      >
                        <User size={15} /> Profile & Settings
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors sm:hidden"
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
            {isOwnerUser && (
              <button
                onClick={() => {
                  toggleActiveRole();
                  setMobileOpen(false);
                  router.push("/dashboard");
                }}
                className="px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-lg text-left flex items-center justify-between"
              >
                <span>{activeRole === "owner" ? "Switch to Customer Mode 🛍️" : "Switch to Owner Mode 🏪"}</span>
              </button>
            )}
            <Link href="/categories" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
              Browse Categories
            </Link>
            {!isOwnerUser && (
              <Link href="/become-lister" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
                {isPendingLister ? "Application Under Review ⏳" : "Become a Lister"}
              </Link>
            )}
            <Link href={user ? "/dashboard" : "/login"} onClick={() => setMobileOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg">
              {user ? "Dashboard" : "Log in / Sign up"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
