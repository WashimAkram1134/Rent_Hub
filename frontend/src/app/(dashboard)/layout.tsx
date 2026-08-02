"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  User,
  Calendar,
  Star,
  Settings,
  MessageSquare,
  CreditCard,
  CarFront,
  Users,
  FileText,
  Menu,
  Bell,
  ChevronDown,
  Headphones,
  LogOut,
  Search,
  Heart,
  Tag,
  MonitorSmartphone,
  Armchair,
  Camera,
  Shirt,
  BookOpen,
  Trophy,
  Building,
  MoreHorizontal,
  PlusCircle,
  ChevronRight,
  BarChart,
  Banknote,
  Wrench,
  FileBox,
  MapPin,
  UserCheck,
  LayoutTemplate,
  ClipboardList,
  RefreshCcw,
  Flag,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import { useAppStore } from "@/store/appStore";
import { dictionaries } from "@/i18n/dictionaries";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { lang, setLang } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !user) return null;

  const dict = dictionaries[lang];
  const isCustomer = user.primary_role === "customer";
  const isAdmin = user.primary_role === "admin";
  const isOwner = user.primary_role === "owner" || (!isCustomer && !isAdmin);

  // Customer and Owner dashboards manage their own clean layout via AppShell
  if (isCustomer || isOwner) {
    return <>{children}</>;
  }

  const OWNER_NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "My Listings", href: "/listings", icon: FileText },
    { label: "Bookings", href: "/bookings", icon: Calendar },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Reviews", href: "/reviews", icon: Star },
    { label: "Earnings", href: "/earnings", icon: CreditCard },
  ];

  const OWNER_CATEGORIES = [
    { label: "Vehicles", href: "/manage/vehicles", icon: CarFront },
    { label: "Electronics", href: "/manage/electronics", icon: MonitorSmartphone },
    { label: "Furniture", href: "/manage/furniture", icon: Armchair },
    { label: "Cameras", href: "/manage/cameras", icon: Camera },
    { label: "Fashion", href: "/manage/fashion", icon: Shirt },
    { label: "Books", href: "/manage/books", icon: BookOpen },
    { label: "Sports", href: "/manage/sports", icon: Trophy },
    { label: "Apartments", href: "/manage/apartments", icon: Building },
    { label: "More Categories", href: "/categories", icon: MoreHorizontal },
  ];

  const OWNER_BUSINESS = [
    { label: "Analytics", href: "/business/analytics", icon: BarChart },
    { label: "Withdraw", href: "/business/withdraw", icon: Banknote },
    { label: "Maintenance", href: "/business/maintenance", icon: Wrench },
    { label: "Documents", href: "/business/documents", icon: FileBox },
    { label: "Settings", href: "/profile", icon: Settings },
  ];

  const CUSTOMER_NAV_ITEMS = [
    { label: dict.sidebar.dashboard, href: "/dashboard", icon: Home },
    { label: dict.sidebar.myBookings, href: "/bookings", icon: Calendar },
    { label: dict.sidebar.wishlist, href: "/wishlist", icon: Heart },
    { label: dict.sidebar.messages, href: "/messages", icon: MessageSquare },
    { label: dict.sidebar.payments, href: "/payments", icon: CreditCard },
    { label: dict.sidebar.reviews, href: "/reviews", icon: Star },
    { label: dict.sidebar.support, href: "/support", icon: Headphones },
    { label: dict.sidebar.offers, href: "/offers", icon: Tag },
  ];

  const CUSTOMER_CATEGORIES = [
    { label: dict.categories.vehicles, href: "/categories/vehicles", icon: CarFront },
    { label: dict.categories.electronics, href: "/categories/electronics", icon: MonitorSmartphone },
    { label: dict.categories.furniture, href: "/categories/furniture", icon: Armchair },
    { label: dict.categories.cameras, href: "/categories/cameras", icon: Camera },
    { label: dict.categories.cloths, href: "/categories/fashion", icon: Shirt },
    { label: dict.categories.books, href: "/categories/books", icon: BookOpen },
    { label: dict.categories.sports, href: "/categories/sports", icon: Trophy },
    { label: dict.categories.apartments, href: "/categories/apartments", icon: Building },
    { label: dict.categories.moreCategories, href: "/categories", icon: MoreHorizontal },
  ];

  const ADMIN_MAIN_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Listings", href: "/admin/listings", icon: FileText },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Payments", href: "/admin/payments", icon: Banknote },
    { label: "Payouts", href: "/admin/payouts", icon: CreditCard },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
    { label: "Disputes", href: "/admin/disputes", icon: Flag },
    { label: "Reports", href: "/admin/reports", icon: BarChart },
  ];

  const ADMIN_MANAGEMENT_ITEMS = [
    { label: "Categories", href: "/admin/categories", icon: FileBox },
    { label: "Locations", href: "/admin/locations", icon: MapPin },
    { label: "Verification", href: "/admin/verification", icon: UserCheck },
    { label: "CMS", href: "/admin/cms", icon: LayoutTemplate },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
  ];

  const ADMIN_SYSTEM_ITEMS = [
    { label: "System Settings", href: "/admin/settings", icon: Settings },
    { label: "Staff Management", href: "/admin/staff", icon: Users },
    { label: "Audit Logs", href: "/admin/logs", icon: ClipboardList },
    { label: "Backup & Restore", href: "/admin/backup", icon: RefreshCcw },
  ];

  const navItems = isAdmin ? ADMIN_MAIN_ITEMS : (isCustomer ? CUSTOMER_NAV_ITEMS : OWNER_NAV_ITEMS);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex h-screen overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className={`fixed md:static left-0 top-0 h-screen w-[260px] ${isAdmin ? 'bg-[#1a1625]' : 'bg-[#111827]'} flex flex-col z-40 transition-transform -translate-x-full md:translate-x-0 shrink-0`}>
          {/* Brand */}
          <div className="px-6 py-6 flex items-center gap-3 border-b border-white/5">
            <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-1.5 rounded-lg">
               <CarFront className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-white font-bold text-xl block leading-tight">RentHub</span>
              <span className="text-slate-400 text-[10px] block font-medium">Rent Anything, Anytime</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = href === "/dashboard" 
                  ? pathname === href 
                  : pathname.startsWith(href);
                  
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-violet-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={active ? "text-white" : "text-slate-500"}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Customer specific categories section */}
            {isCustomer && (
              <div className="mt-8">
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {dict.sidebar.browseCategories}
                </p>
                <ul className="space-y-1">
                  {CUSTOMER_CATEGORIES.map(({ label, href, icon: Icon }) => (
                     <li key={href}>
                        <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                          <Icon size={16} className="text-slate-500" />
                          {label}
                        </Link>
                     </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Owner specific categories section */}
            {isOwner && (
              <>
                <div className="mt-8">
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    MANAGE LISTINGS
                  </p>
                  <ul className="space-y-1">
                    {OWNER_CATEGORIES.map(({ label, href, icon: Icon }) => (
                       <li key={href}>
                          <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Icon size={16} className="text-slate-500" />
                            {label}
                          </Link>
                       </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8">
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    BUSINESS
                  </p>
                  <ul className="space-y-1">
                    {OWNER_BUSINESS.map(({ label, href, icon: Icon }) => (
                       <li key={href}>
                          <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Icon size={16} className="text-slate-500" />
                            {label}
                          </Link>
                       </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Admin specific categories section */}
            {isAdmin && (
              <>
                <div className="mt-8">
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    MANAGEMENT
                  </p>
                  <ul className="space-y-1">
                    {ADMIN_MANAGEMENT_ITEMS.map(({ label, href, icon: Icon }) => (
                       <li key={href}>
                          <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Icon size={16} className="text-slate-500" />
                            {label}
                          </Link>
                       </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8">
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    SYSTEM
                  </p>
                  <ul className="space-y-1">
                    {ADMIN_SYSTEM_ITEMS.map(({ label, href, icon: Icon }) => (
                       <li key={href}>
                          <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Icon size={16} className="text-slate-500" />
                            {label}
                          </Link>
                       </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </nav>

          {/* Bottom Card */}
          <div className="p-4">
            {isCustomer ? (
              <div className="rounded-xl p-4 relative overflow-hidden border border-white/10 group cursor-pointer bg-[#0A0F1C]">
                {/* Car Background Image */}
                <img 
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80" 
                  alt="Car Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/80 to-transparent"></div>
                
                <div className="relative z-10">
                  <h4 className="text-white text-sm font-bold mb-1">{dict.sidebar.listYourItems}</h4>
                  <p className="text-slate-300 text-xs mb-4 leading-relaxed">{dict.sidebar.earnByRenting}</p>
                  <button className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-blue-500 transition-colors">
                    {dict.sidebar.becomeLister} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : isAdmin ? (
              <div className="rounded-xl p-4 relative overflow-hidden border border-white/10 group cursor-pointer bg-[#1e1a2f]">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80" 
                  alt="Admin Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1a2f] via-[#1e1a2f]/90 to-transparent"></div>
                
                <div className="relative z-10">
                  <div className="mb-2">
                    <h4 className="text-white text-[13px] font-bold">Platform Overview</h4>
                    <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">Monitor and manage the entire marketplace.</p>
                  </div>
                  <button className="bg-[#4F46E5] text-white font-medium py-1.5 px-3 mt-2 rounded-lg text-[11px] hover:bg-indigo-500 transition-colors flex items-center gap-1 w-fit">
                    View Reports <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-4 relative overflow-hidden border border-white/10 group cursor-pointer bg-[#0A0F1C]">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80" 
                  alt="Apartment Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/90 to-transparent"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">👑</span>
                    <h4 className="text-white text-sm font-bold">Grow Your Rental Business</h4>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    <li className="flex items-center gap-2 text-xs text-slate-300"><span className="text-emerald-400">✓</span> Premium Badge</li>
                    <li className="flex items-center gap-2 text-xs text-slate-300"><span className="text-emerald-400">✓</span> Featured Listings</li>
                    <li className="flex items-center gap-2 text-xs text-slate-300"><span className="text-emerald-400">✓</span> Better Visibility</li>
                  </ul>
                  <button className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg text-xs hover:bg-indigo-500 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content Area ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Header */}
          <header className="h-[72px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            {/* Left */}
            <div className="flex items-center flex-1 gap-4">
              <button className="p-2 -ml-2 text-slate-500 hover:text-slate-700 md:hidden">
                <Menu className="w-5 h-5" />
              </button>
              
              {isCustomer && (
                <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500 transition-all">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder={dict.header.searchPlaceholder}
                    className="bg-transparent border-none outline-none w-full px-3 text-sm text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              
              {isCustomer && (
                <div className="hidden lg:flex items-center gap-3 border-r border-slate-200 pr-4">
                   <div className="relative group">
                     <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                       {lang === "EN" ? "English" : "বাংলা"} <ChevronDown size={14} className="text-slate-400" />
                     </button>
                     <div className="absolute right-0 top-full pt-1 w-32 hidden group-hover:block z-50">
                       <div className="bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                         <button onClick={() => setLang("EN")} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${lang === 'EN' ? 'font-bold text-violet-600' : 'text-slate-700'}`}>English</button>
                         <button onClick={() => setLang("BN")} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${lang === 'BN' ? 'font-bold text-violet-600' : 'text-slate-700'}`}>বাংলা</button>
                       </div>
                     </div>
                   </div>
                   
                   <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                     <span className="text-[10px]">🇧🇩</span> BDT <ChevronDown size={14} className="text-slate-400" />
                   </button>
                </div>
              )}

              {/* Notification & Messages */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-slate-700 relative hover:bg-slate-50 rounded-full transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-violet-600 rounded-full border-2 border-white"></span>
                </button>
                {isCustomer && (
                  <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors hidden sm:block">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="flex items-center gap-3 pl-2 cursor-pointer group relative">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm overflow-hidden border border-slate-200">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    `${user.first_name[0]}${user.last_name[0]}`
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-slate-900 text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
                  <p className="text-slate-500 text-xs mt-1 capitalize">{user.primary_role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                
                {/* Minimal Dropdown (Hidden by default, hover to show) */}
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                   <div className="bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                     <Link href="/profile" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                       <User size={16} /> {dict.header.profile}
                     </Link>
                     <button onClick={() => { logout(); router.replace("/login"); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                       <LogOut size={16} /> {dict.header.signOut}
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content scrollable area */}
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8" style={{ zoom: 0.9 } as React.CSSProperties}>
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
