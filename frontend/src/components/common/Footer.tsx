import Link from "next/link";
import {
  Camera,
  Laptop,
  Bike,
  Package,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const footerLinks = {
  Explore: [
    { label: "Browse Listings", href: "/search" },
    { label: "Categories", href: "/categories" },
    { label: "Featured Items", href: "/featured" },
    { label: "Near Me", href: "/search?near=me" },
  ],
  "For Owners": [
    { label: "List Your Item", href: "/register?role=owner" },
    { label: "How Pricing Works", href: "/pricing" },
    { label: "Owner Dashboard", href: "/dashboard/owner" },
    { label: "Owner FAQ", href: "/faq#owner" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Report an Issue", href: "/report" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const popularCategories = [
  { icon: Camera, label: "Cameras" },
  { icon: Laptop, label: "Electronics" },
  { icon: Bike, label: "Bikes" },
  { icon: Package, label: "Furniture" },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-white/10"
      style={{ background: "hsl(220, 92%, 8%)" }}
    >
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" id="footer-logo" className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(220, 75%, 52%), hsl(240, 75%, 60%))" }}
              >
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Rent<span className="text-blue-400">Hub</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Bangladesh&apos;s trusted peer-to-peer rental marketplace. Rent what you need,
              earn from what you own.
            </p>

            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                support@renthub.com
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                +880 1700-000000
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Dhaka, Bangladesh
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold text-white text-sm mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-white/50 hover:text-white/90 text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Categories Row */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/40 text-xs mb-4 uppercase tracking-widest font-medium">
            Popular Categories
          </p>
          <div className="flex flex-wrap gap-3">
            {popularCategories.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                href={`/search?category=${label.toLowerCase()}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs hover:border-white/20 hover:text-white/90 transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-5">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} RentHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-white/40 hover:text-white/70 text-xs transition-colors">Terms</Link>
            <Link href="/privacy" className="text-white/40 hover:text-white/70 text-xs transition-colors">Privacy</Link>
            <Link href="/cookies" className="text-white/40 hover:text-white/70 text-xs transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
