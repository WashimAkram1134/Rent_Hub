import type { Metadata } from "next";
import { Inter, Outfit, Dancing_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import { FlyToCartProvider } from "@/context/FlyToCartContext";
import { FlyToCartOverlay } from "@/components/cart/FlyToCartOverlay";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import GlobalTransitionOverlay from "@/components/common/GlobalTransitionOverlay";
import { WishlistSync } from "@/components/common/WishlistSync";

// ─── Fonts ─────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

// ─── Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "RentHub — Rent Anything, Anytime",
    template: "%s | RentHub",
  },
  description:
    "RentHub is a peer-to-peer rental marketplace. Rent cameras, laptops, bikes, furniture, and more from people near you. Earn money by renting out what you own.",
  keywords: [
    "rental marketplace",
    "rent camera",
    "rent laptop",
    "peer to peer rental",
    "rent equipment",
    "RentHub",
  ],
  authors: [{ name: "RentHub" }],
  creator: "RentHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RentHub",
    title: "RentHub — Rent Anything, Anytime",
    description:
      "Peer-to-peer rental marketplace. Rent what you need, earn from what you own.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RentHub — Rent Anything, Anytime",
    description: "Peer-to-peer rental marketplace connecting owners and renters.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('renthub_theme') || 'light';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  if (localStorage.getItem('renthub_compact') === 'true') {
                    document.documentElement.classList.add('compact-density');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${dancingScript.variable} antialiased`} suppressHydrationWarning>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <WebSocketProvider>
          <FlyToCartProvider>
            {/* Global overlay — persists across all route changes, controlled by transitionStore */}
            <GlobalTransitionOverlay />
            <WishlistSync />
            <FlyToCartOverlay />
            <FloatingCartBar />
            {children}
          </FlyToCartProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}
