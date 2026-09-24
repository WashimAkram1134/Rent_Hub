"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, LayoutGrid, MapPin, Heart, Calendar, 
  MessageSquare, Bell, Tag, HelpCircle, Info, ChevronRight,
  SlidersHorizontal, CreditCard, Star, Settings, DollarSign, ChevronDown, Package, ShieldCheck,
  Store, ShoppingBag, Clock, Users, UserCheck, CheckCircle2, Sparkles, FileText,
  Scale, BarChart3, LayoutTemplate, Megaphone, Shield, AlertTriangle
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";
import apiClient from "@/lib/axios";

export function DashboardSidebar({
  filterContent,
  defaultMode = "filter",
}: {
  filterContent?: React.ReactNode;
  defaultMode?: "nav" | "filter";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, setActiveRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"nav" | "filter">(filterContent ? defaultMode : "nav");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);

  // Admin Operational Queue Badges
  const [pendingListers, setPendingListers] = useState(0);
  const [pendingListings, setPendingListings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [openDisputes, setOpenDisputes] = useState(0);

  useEffect(() => {
    if (filterContent) {
      setActiveTab(defaultMode);
    } else {
      setActiveTab("nav");
    }
  }, [filterContent, defaultMode]);

  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      setUnreadNotifications(0);
      setPendingBookings(0);
      setPendingListers(0);
      setPendingListings(0);
      setPendingPayouts(0);
      setOpenDisputes(0);
      return;
    }

    // Fetch unread messages count
    apiClient
      .get("/messages/unread-count")
      .then((res) => setUnreadMessages(res.data?.count || 0))
      .catch(() => setUnreadMessages(0));

    // Fetch notifications unread count
    apiClient
      .get("/notifications")
      .then((res) => {
        const unread = Array.isArray(res.data) ? res.data.filter((n: any) => !n.is_read).length : 0;
        setUnreadNotifications(unread);
      })
      .catch(() => setUnreadNotifications(0));

    // If owner mode, fetch pending booking requests
    if (activeRole === "owner") {
      apiClient
        .get(`/bookings?owner_id=${user.id}&status=pending`)
        .then((res) => setPendingBookings(Array.isArray(res.data) ? res.data.length : 0))
        .catch(() => setPendingBookings(0));
    }

    // If admin user, fetch admin stats for dynamic sidebar badges
    const isAdminUser = user.primary_role === "admin" || user.role_names?.includes("admin");
    if (isAdminUser) {
      apiClient
        .get("/analytics/admin-stats")
        .then((res) => {
          if (res.data) {
            setPendingListings(res.data.pending_listings || 0);
            setPendingListers(res.data.pending_listers || 0);
            setPendingPayouts(res.data.pending_payouts || 0);
            setOpenDisputes(res.data.open_disputes || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, pathname, activeRole]);

  const isAdminUser = Boolean(user?.primary_role === "admin" || user?.role_names?.includes("admin"));
  const isOwnerUser = Boolean(user?.is_owner || user?.primary_role === "owner" || user?.role_names?.includes("owner") || isAdminUser);
  const isPendingLister = !isOwnerUser && user?.lister_status === "pending";

  // Determine active display mode
  // If activeRole === 'admin' OR currently visiting an /admin/* route, show Admin Nav
  const isAdminMode = isAdminUser && (activeRole === "admin" || pathname.startsWith("/admin"));
  const isOwnerMode = !isAdminMode && activeRole === "owner";

  interface NavItem {
    icon: any;
    label: string;
    href: string;
    badge?: number | string;
    badgeColor?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  // 1. Business Admin Navigation Sections (The 21-Module Structure)
  const adminSections: NavSection[] = [
    {
      title: "Command Center",
      items: [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
      ],
    },
    {
      title: "Marketplace Operations",
      items: [
        { icon: Users, label: "Users Management", href: "/admin/users" },
        { 
          icon: UserCheck, 
          label: "Owner Applications", 
          href: "/admin/listers", 
          badge: pendingListers > 0 ? pendingListers : undefined,
          badgeColor: "bg-blue-600 text-white"
        },
        { 
          icon: Package, 
          label: "Listings Moderation", 
          href: "/admin/listings", 
          badge: pendingListings > 0 ? pendingListings : undefined,
          badgeColor: "bg-amber-600 text-white"
        },
        { icon: Calendar, label: "Bookings Oversight", href: "/admin/bookings" },
      ],
    },
    {
      title: "Trust & Finance",
      items: [
        { icon: CreditCard, label: "Customer Payments", href: "/admin/payments" },
        { 
          icon: DollarSign, 
          label: "Host Payouts", 
          href: "/admin/payouts", 
          badge: pendingPayouts > 0 ? pendingPayouts : undefined,
          badgeColor: "bg-emerald-600 text-white"
        },
        { 
          icon: Scale, 
          label: "Disputes Resolution", 
          href: "/admin/disputes", 
          badge: openDisputes > 0 ? openDisputes : undefined,
          badgeColor: "bg-rose-600 text-white"
        },
        { icon: Star, label: "Reviews & Ratings", href: "/admin/reviews" },
        { 
          icon: MessageSquare, 
          label: "Platform Moderation", 
          href: "/admin/messages", 
          badge: unreadMessages > 0 ? unreadMessages : undefined 
        },
      ],
    },
    {
      title: "Content & Growth",
      items: [
        { icon: FolderIcon, label: "Rental Categories", href: "/admin/categories" },
        { icon: Tag, label: "Deals & Promotions", href: "/admin/promotions" },
        { icon: LayoutTemplate, label: "Website Content / CMS", href: "/admin/cms" },
        { icon: Megaphone, label: "Announcements", href: "/admin/notifications" },
        { icon: MapPin, label: "Cities & Locations", href: "/admin/locations" },
      ],
    },
    {
      title: "Governance & Settings",
      items: [
        { icon: BarChart3, label: "Reports & Analytics", href: "/admin/reports" },
        { icon: FileText, label: "Activity Audit Logs", href: "/admin/logs" },
        { icon: Shield, label: "Staff & Permissions", href: "/admin/staff" },
        { icon: Settings, label: "Business Settings", href: "/admin/settings" },
        { icon: HelpCircle, label: "Operator Guide & SOPs", href: "/admin/help" },
      ],
    },
  ];

  // Helper folder icon
  function FolderIcon(props: any) {
    return <LayoutGrid {...props} />;
  }

  // 2. Owner Navigation
  const ownerNav: NavItem[] = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "My Listings", href: "/listings" },
    {
      icon: FileText,
      label: "Booking Requests",
      href: "/owner/bookings",
      badge: pendingBookings > 0 ? pendingBookings : undefined,
    },
    { icon: CreditCard, label: "Earnings & Payouts", href: "/earnings" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/messages",
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    { icon: Settings, label: "Settings", href: "/profile" },
  ];

  // 3. Customer Navigation
  const customerNav: NavItem[] = [
    { icon: Home, label: "Explore & Rent", href: "/dashboard" },
    { icon: LayoutGrid, label: "Browse Categories", href: "/categories" },
    { icon: MapPin, label: "Explore Nearby", href: "/nearby" },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: Calendar, label: "My Bookings", href: "/bookings" },
    { icon: MessageSquare, label: "Messages", href: "/messages", badge: unreadMessages > 0 ? unreadMessages : undefined },
    { icon: Bell, label: "Notifications", href: "/notifications", badge: unreadNotifications > 0 ? unreadNotifications : undefined },
  ];

  const moreNav = [
    { icon: Tag, label: "Deals & Offers", href: "/offers" },
    { icon: HelpCircle, label: "Help & Support", href: "/support" },
    { icon: Info, label: "About RentHub", href: "/" },
  ];

  const isFilterActive = activeTab === "filter" && !!filterContent;

  return (
    <aside
      className={`${
        isFilterActive ? "w-[270px]" : "w-[245px]"
      } ${
        isAdminMode
          ? "bg-[#090d16] text-slate-200 border-r border-slate-800/90"
          : isOwnerMode
          ? "bg-[#0c101d] text-slate-200 border-r border-slate-800/90"
          : "bg-white text-slate-700 border-r border-slate-200/80"
      } flex flex-col h-full shrink-0 overflow-y-auto transition-all duration-300 font-sans select-none`}
    >
      {/* Logo Header */}
      <div
        className={`px-4 py-3.5 ${
          isAdminMode
            ? "border-b border-slate-800/90 bg-[#070b13]"
            : isOwnerMode
            ? "border-b border-slate-800/80 bg-[#090d18]"
            : "border-b border-slate-100"
        } flex items-center justify-between gap-2 shrink-0`}
      >
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isAdminMode 
              ? "bg-amber-500 shadow-amber-500/20 text-white" 
              : "bg-blue-600 shadow-blue-500/20 text-white"
          }`}>
            {isAdminMode ? <Shield size={16} /> : <Home size={16} />}
          </div>
          <div>
            <p className={`${isAdminMode || isOwnerMode ? "text-white" : "text-slate-900"} font-black text-sm leading-tight tracking-tight`}>
              RentHub
            </p>
            <p className={`text-[10px] font-bold tracking-wider uppercase ${
              isAdminMode 
                ? "text-amber-400" 
                : isOwnerMode 
                ? "text-indigo-400" 
                : "text-slate-400"
            }`}>
              {isAdminMode ? "Business Admin" : isOwnerMode ? "Owner Portal" : "Rental Marketplace"}
            </p>
          </div>
        </Link>
        {isAdminMode ? (
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            PRO
          </span>
        ) : (user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified) ? (
          <span
            className={`p-1 rounded-lg ${
              isOwnerMode ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60" : "bg-emerald-50 text-emerald-600"
            }`}
            title="Identity Verified"
          >
            <ShieldCheck size={16} />
          </span>
        ) : null}
      </div>

      {/* Mode Switcher Toggle (when filterContent exists) */}
      {filterContent && (
        <div className="px-3 py-2 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex bg-slate-800/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("nav")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "nav"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Home size={13} /> Menu
            </button>
            <button
              onClick={() => setActiveTab("filter")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "filter"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal size={13} /> Filters
            </button>
          </div>
        </div>
      )}

      {/* Content Body */}
      {isFilterActive ? (
        <div className="flex-1 overflow-y-auto p-4">
          {filterContent}
        </div>
      ) : (
        <>
          {/* Main Navigation */}
          <nav className="px-3 py-3 flex-1 space-y-4 overflow-y-auto">
            {isAdminMode ? (
              // ─── ADMIN SECTIONS ───────────────────────────────────────────────
              adminSections.map((section, sIdx) => (
                <div key={section.title} className="space-y-0.5">
                  <p className="px-2.5 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          active
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-sm shadow-amber-500/20"
                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon size={15} className={`shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                              active ? "bg-white text-slate-900" : (item.badgeColor || "bg-amber-500 text-white")
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ))
            ) : isOwnerMode ? (
              // ─── OWNER NAVIGATION ─────────────────────────────────────────────
              <div className="space-y-0.5">
                <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Owner View</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Host Mode
                  </span>
                </div>
                {ownerNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : (
              // ─── CUSTOMER NAVIGATION ──────────────────────────────────────────
              <div className="space-y-0.5">
                {customerNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
                  {moreNav.map(({ icon: Icon, label, href }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          active ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Bottom Card: Dynamic Mode Switcher or Lister Onboarding */}
          <div className="p-3 shrink-0 space-y-2 border-t border-slate-800/60 bg-[#070a12]/50">
            {isAdminMode ? (
              // Admin mode footer switcher to preview customer or owner modes
              <div className="rounded-xl p-2.5 bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>MARKETPLACE PREVIEW</span>
                  <span className="text-amber-400 font-extrabold">ADMIN</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setActiveRole("customer");
                      router.push("/dashboard");
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShoppingBag size={11} /> Customer
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole("owner");
                      router.push("/dashboard");
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Store size={11} /> Owner
                  </button>
                </div>
              </div>
            ) : isOwnerMode ? (
              <>
                {/* Grow Your Business Promo Card */}
                <div className="rounded-2xl p-3 bg-[#131929] border border-slate-800/80 space-y-2 shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Grow Your Business</h4>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      Boost inventory visibility and earn faster.
                    </p>
                  </div>
                </div>

                {/* Return to Admin if Admin User */}
                {isAdminUser && (
                  <button
                    onClick={() => {
                      setActiveRole("admin");
                      router.push("/dashboard");
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shield size={12} /> Return to Admin Console
                  </button>
                )}

                {/* Switch to Customer Mode Button */}
                <button
                  onClick={() => {
                    setActiveRole("customer");
                    router.push("/dashboard");
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={13} /> Switch to Customer
                </button>
              </>
            ) : isOwnerUser ? (
              /* Dual Role Mode Switcher Card */
              <div className="rounded-2xl p-3 border bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-emerald-600" />
                    <span className="text-xs font-extrabold text-slate-900">
                      Customer View
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveRole("owner");
                    router.push("/dashboard");
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Store size={12} /> Switch to Owner Mode
                </button>

                {isAdminUser && (
                  <button
                    onClick={() => {
                      setActiveRole("admin");
                      router.push("/dashboard");
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shield size={12} className="text-amber-700" /> Business Admin
                  </button>
                )}
              </div>
            ) : isPendingLister ? (
              /* Pending Lister Application Status Card */
              <div className="rounded-2xl p-3 bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                  <Clock size={14} className="text-amber-600" />
                  <span>Application Under Review</span>
                </div>
                <p className="text-[10px] text-slate-600">
                  Our verification team is reviewing your ID documents.
                </p>
                <Link
                  href="/become-lister"
                  className="block w-full py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-center font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Check Application Status
                </Link>
              </div>
            ) : (
              /* Become a Lister Promo Card */
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/60 border border-indigo-100 p-3.5 group">
                <div className="relative z-10 space-y-1.5">
                  <h4 className="font-extrabold text-indigo-950 text-xs">Become an Owner Lister</h4>
                  <p className="text-slate-600 text-[10px] leading-snug font-medium">
                    Turn your idle assets into daily rental income on RentHub.
                  </p>
                  <Link
                    href={user ? "/become-lister" : "/login?returnUrl=/become-lister"}
                    className="block w-full bg-[#5B5CEB] hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs py-1.5 text-center rounded-xl shadow-sm transition-all"
                  >
                    Apply Now →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
