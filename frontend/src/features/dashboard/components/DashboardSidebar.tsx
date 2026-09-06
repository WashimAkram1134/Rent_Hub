"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, LayoutGrid, MapPin, Heart, Calendar, 
  MessageSquare, Bell, Tag, UserPlus, HelpCircle, Info, CarFront, ChevronRight,
  SlidersHorizontal, PlusCircle, CreditCard, Star, Settings, DollarSign, Rocket, ChevronDown, Package, ShieldCheck,
  Store, ShoppingBag, Clock, Users, UserCheck, CheckCircle2, Sparkles, Award, FileText
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
  const { user, activeRole, setActiveRole, toggleActiveRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"nav" | "filter">(filterContent ? defaultMode : "nav");
  const [bookingsOpen, setBookingsOpen] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [pendingListers, setPendingListers] = useState(0);

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

    // If owner mode or admin, fetch pending booking requests
    if (activeRole === "owner" || user.primary_role === "admin") {
      apiClient
        .get(`/bookings?owner_id=${user.id}&status=pending`)
        .then((res) => setPendingBookings(Array.isArray(res.data) ? res.data.length : 0))
        .catch(() => setPendingBookings(0));
    }

    // If admin, fetch pending lister applications count
    if (user.primary_role === "admin") {
      apiClient
        .get("/lister-applications/admin/list?status=pending&limit=1")
        .then((res) => setPendingListers(res.data?.metrics?.pending_count || 0))
        .catch(() => setPendingListers(0));
    }
  }, [user, pathname, activeRole]);

  const isOwnerUser = user?.is_owner || user?.primary_role === "owner" || user?.role_names?.includes("owner") || user?.primary_role === "admin";
  const isAdmin = user?.primary_role === "admin";
  const isPendingLister = !isOwnerUser && user?.lister_status === "pending";

  // Build navigation items based on active role mode
  const isOwnerMode = activeRole === "owner";

  const mainNav = isOwnerMode
    ? [
        { icon: Home, label: "Owner Dashboard", href: "/dashboard" },
        { icon: Package, label: "My Listings", href: "/listings" },
        { icon: PlusCircle, label: "Add New Listing", href: "/products/new" },
        {
          icon: Calendar,
          label: "Bookings",
          href: "/owner/bookings",
          isSubmenu: true,
          subItems: [
            { label: "Booking Requests", href: "/owner/bookings", badge: pendingBookings > 0 ? pendingBookings : undefined },
            { label: "Active Bookings", href: "/owner/bookings?status=approved" },
            { label: "Completed Bookings", href: "/owner/bookings?status=completed" },
          ],
        },
        { icon: Calendar, label: "Calendar", href: "/calendar" },
        { icon: CreditCard, label: "Earnings", href: "/earnings" },
        { icon: MessageSquare, label: "Messages", href: isAdmin ? "/admin/messages" : "/messages", badge: unreadMessages > 0 ? unreadMessages : undefined },
        { icon: Star, label: "Reviews", href: "/reviews" },
        { icon: DollarSign, label: "Payouts", href: isAdmin ? "/admin/payouts" : "/payouts" },
        { icon: Settings, label: "Settings", href: "/profile" },
        { icon: HelpCircle, label: "Support", href: "/support" },
      ]
    : [
        { icon: Home, label: "Explore & Rent", href: "/dashboard" },
        { icon: LayoutGrid, label: "Browse Categories", href: "/categories" },
        { icon: MapPin, label: "Explore Nearby", href: "/nearby" },
        { icon: Heart, label: "Wishlist", href: "/wishlist" },
        { icon: Calendar, label: "My Bookings", href: "/bookings" },
        { icon: MessageSquare, label: "Messages", href: "/messages", badge: unreadMessages > 0 ? unreadMessages : undefined },
        { icon: Bell, label: "Notifications", href: "/notifications", badge: unreadNotifications > 0 ? unreadNotifications : undefined },
      ];

  const adminNav = isAdmin
    ? [
        { icon: UserCheck, label: "Lister Approvals", href: "/admin/listers", badge: pendingListers > 0 ? pendingListers : undefined },
        { icon: DollarSign, label: "Payout Approvals", href: "/admin/payouts" },
        { icon: MessageSquare, label: "Platform Moderation", href: "/admin/messages" },
        { icon: Users, label: "User Management", href: "/admin/users" },
      ]
    : [];

  const moreNav = [
    { icon: Tag, label: "Deals & Offers", href: "/offers" },
    { icon: HelpCircle, label: "Help & Support", href: "/support" },
    { icon: Info, label: "About RentHub", href: "/about" },
  ];

  const isFilterActive = activeTab === "filter" && !!filterContent;

  return (
    <aside className={`${isFilterActive ? "w-[270px]" : "w-[240px]"} bg-white border-r border-slate-200/80 flex flex-col h-full shrink-0 overflow-y-auto transition-all duration-300 font-sans`}>
      {/* Logo Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <CarFront size={16} className="text-white" />
          </div>
          <div>
            <p className="text-slate-900 font-extrabold text-base leading-tight">RentHub</p>
            <p className="text-slate-400 text-[10px] font-medium">Rent Anything, Anytime</p>
          </div>
        </Link>
        {(user?.identity_verification_status === "VERIFIED" || user?.is_identity_verified) && (
          <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600" title="Identity Verified">
            <ShieldCheck size={16} />
          </span>
        )}
      </div>

      {/* Mode Switcher Toggle (when filterContent exists) */}
      {filterContent && (
        <div className="px-3 py-2.5 border-b border-gray-100 bg-slate-50/80 shrink-0">
          <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("nav")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "nav"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home size={13} /> Menu
            </button>
            <button
              onClick={() => setActiveTab("filter")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "filter"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
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
          {/* Main Nav */}
          <nav className="px-3 py-4 flex-1 space-y-0.5">
            {/* Active Mode Indicator Badge if multi-role */}
            {isOwnerUser && (
              <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{isOwnerMode ? "Owner Navigation" : "Customer Navigation"}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                  isOwnerMode ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {isOwnerMode ? "Owner View" : "Customer View"}
                </span>
              </div>
            )}

            {mainNav.map((item) => {
              const Icon = item.icon;
              if (item.isSubmenu) {
                const isSubmenuActive = pathname.startsWith("/owner/bookings") || pathname === "/bookings";
                return (
                  <div key={item.label} className="mb-1">
                    <button
                      onClick={() => setBookingsOpen(!bookingsOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isSubmenuActive ? "text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown size={14} className={`transition-transform ${bookingsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {bookingsOpen && (
                      <div className="ml-4 pl-3 border-l border-indigo-100 my-1 space-y-0.5">
                        {item.subItems?.map((sub) => {
                          const active = pathname === sub.href;
                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                active
                                  ? "bg-indigo-50 text-indigo-600 font-bold"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              }`}
                            >
                              <span>{sub.label}</span>
                              {sub.badge && (
                                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors group ${
                    active
                      ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      active ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Admin Management Section */}
            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="px-3 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Admin Tools</p>
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        active ? "bg-amber-50 text-amber-800 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* General Links */}
            {!isOwnerMode && (
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
            )}
          </nav>

          {/* Bottom Card: Dynamic Mode Switcher or Lister Onboarding */}
          <div className="p-3 pb-4 shrink-0">
            {isOwnerUser ? (
              /* Dual Role Mode Switcher Card */
              <div className={`rounded-2xl p-3.5 border transition-all ${
                isOwnerMode 
                  ? "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100" 
                  : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {isOwnerMode ? (
                      <Store size={15} className="text-indigo-600" />
                    ) : (
                      <ShoppingBag size={15} className="text-emerald-600" />
                    )}
                    <span className="text-xs font-extrabold text-slate-900">
                      {isOwnerMode ? "Owner Mode" : "Customer Mode"}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">
                  {isOwnerMode
                    ? "Manage your product listings, rentals & earnings."
                    : "Browse categories, rent items & manage bookings."}
                </p>
                <button
                  onClick={() => {
                    const nextMode = isOwnerMode ? "customer" : "owner";
                    setActiveRole(nextMode);
                    router.push("/dashboard");
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    isOwnerMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                  }`}
                >
                  {isOwnerMode ? (
                    <>
                      <ShoppingBag size={13} /> Switch to Customer Mode
                    </>
                  ) : (
                    <>
                      <Store size={13} /> Switch to Owner Mode
                    </>
                  )}
                </button>
              </div>
            ) : isPendingLister ? (
              /* Pending Lister Application Status Card */
              <div className="rounded-2xl p-3.5 bg-amber-50/80 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                  <Clock size={15} className="text-amber-600" />
                  <span>Application Under Review</span>
                </div>
                <p className="text-[10px] text-slate-600">
                  Our verification team is reviewing your ID documents.
                </p>
                <Link
                  href="/become-lister"
                  className="block w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-center font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Check Application Status
                </Link>
              </div>
            ) : (
              /* Become a Lister Promo Card */
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/60 border border-indigo-100 p-4 group">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
                  alt="Business Growth Banner"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
                />
                <div className="relative z-10 space-y-2">
                  <h4 className="font-extrabold text-indigo-950 text-xs">Become a Lister</h4>
                  <p className="text-slate-600 text-[10px] leading-snug font-medium">
                    Turn your idle assets into daily rental income on RentHub.
                  </p>
                  <Link
                    href={user ? "/become-lister" : "/login?returnUrl=/become-lister"}
                    className="block w-full bg-[#5B5CEB] hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs py-2 text-center rounded-xl shadow-md shadow-indigo-200 transition-all"
                  >
                    Apply as Owner Lister
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
