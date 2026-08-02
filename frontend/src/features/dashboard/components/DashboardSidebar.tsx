import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, LayoutGrid, MapPin, Heart, Calendar, 
  MessageSquare, Bell, Tag, UserPlus, HelpCircle, Info, CarFront, ChevronRight,
  SlidersHorizontal, PlusCircle, CreditCard, Star, Settings, DollarSign, Rocket, ChevronDown, Package
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";

export function DashboardSidebar({
  filterContent,
  defaultMode = "filter",
}: {
  filterContent?: React.ReactNode;
  defaultMode?: "nav" | "filter";
}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"nav" | "filter">(filterContent ? defaultMode : "nav");
  const [bookingsOpen, setBookingsOpen] = useState(true);

  useEffect(() => {
    if (filterContent) {
      setActiveTab(defaultMode);
    } else {
      setActiveTab("nav");
    }
  }, [filterContent, defaultMode]);
  
  const isOwnerOrLister = user?.primary_role === "owner" || user?.primary_role === "lister" || user?.primary_role === "admin";

  const mainNav = isOwnerOrLister
    ? [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: Package, label: "My Listings", href: "/listings" },
        { icon: PlusCircle, label: "Add New Listing", href: "/products/new" },
        {
          icon: Calendar,
          label: "Bookings",
          href: "/owner/bookings",
          isSubmenu: true,
          subItems: [
            { label: "Booking Requests", href: "/owner/bookings", badge: 5 },
            { label: "Active Bookings", href: "/owner/bookings?status=approved" },
            { label: "Completed Bookings", href: "/owner/bookings?status=completed" },
          ],
        },
        { icon: Calendar, label: "Calendar", href: "/calendar" },
        { icon: CreditCard, label: "Earnings", href: "/earnings" },
        { icon: MessageSquare, label: "Messages", href: "/messages", badge: 3 },
        { icon: Star, label: "Reviews", href: "/reviews" },
        { icon: DollarSign, label: "Payouts", href: "/payouts" },
        { icon: Settings, label: "Settings", href: "/profile" },
        { icon: HelpCircle, label: "Support", href: "/support" },
      ]
    : [
        { icon: Home, label: "Home", href: "/dashboard" },
        { icon: LayoutGrid, label: "Browse Categories", href: "/categories" },
        { icon: MapPin, label: "Explore Nearby", href: "/nearby" },
        { icon: Heart, label: "Wishlist", href: "/wishlist" },
        { icon: Calendar, label: "My Bookings", href: "/bookings" },
        { icon: MessageSquare, label: "Messages", href: "/messages", badge: 3 },
        { icon: Bell, label: "Notifications", href: "/notifications", badge: 2 },
      ];

  const moreNav = [
    { icon: Tag, label: "Deals & Offers", href: "/offers" },
    { icon: UserPlus, label: "Become a Lister", href: "/become-lister" },
    { icon: HelpCircle, label: "Help & Support", href: "/support" },
    { icon: Info, label: "About RentHub", href: "/about" },
  ];

  const isFilterActive = activeTab === "filter" && !!filterContent;

  return (
    <aside className={`${isFilterActive ? "w-[270px]" : "w-[240px]"} bg-white border-r border-slate-200/80 flex flex-col h-full shrink-0 overflow-y-auto transition-all duration-300 font-sans`}>
      {/* Logo Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <CarFront size={16} className="text-white" />
          </div>
          <div>
            <p className="text-slate-900 font-extrabold text-base leading-tight">RentHub</p>
            <p className="text-slate-400 text-[10px] font-medium">Rent Anything, Anytime</p>
          </div>
        </Link>
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

            {!isOwnerOrLister && (
              <div className="mt-5 pt-3 border-t border-slate-100">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">More</p>
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

          {/* Promo Card: Grow your business (Web Image Banner, No Plane Icon) */}
          <div className="p-3 pb-4 shrink-0">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/60 border border-indigo-100 p-4 group">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
                alt="Business Growth Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 space-y-2">
                <h4 className="font-extrabold text-indigo-950 text-xs">Grow your business</h4>
                <p className="text-slate-600 text-[10px] leading-snug font-medium">
                  Get more bookings and earn more with RentHub.
                </p>
                <button className="w-full bg-[#5B5CEB] hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

