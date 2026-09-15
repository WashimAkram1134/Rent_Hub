"use client";

import { useEffect, useState } from "react";

interface LoginLoadingScreenProps {
  /** Called when the delay is complete and redirect should happen */
  onComplete: () => void;
  /** Delay in milliseconds before onComplete fires. Default: 2500 */
  delay?: number;
}

/**
 * LoginLoadingScreen
 *
 * Full-screen animated loading overlay shown between successful login
 * and the redirect to dashboard. Inspired by the "Deadline" progress-bar
 * meme — adapted for RentHub with a landlord chasing a tenant theme.
 */
export default function LoginLoadingScreen({
  onComplete,
  delay = 2500,
}: LoginLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = 16; // ~60fps
    const steps = delay / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      setProgress(Math.min((current / steps) * 100, 100));
      if (current >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 300);
        }, 100);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [delay, onComplete]);

  return (
    <div
      aria-label="Logging you in…"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#050a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.3s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 200,
          background:
            "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "30%",
          width: 300,
          height: 150,
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* RentHub wordmark */}
      <div
        style={{
          marginBottom: 56,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 14L16 4L28 14V28H20V20H12V28H4V14Z"
            fill="url(#houseGrad)"
          />
          <defs>
            <linearGradient
              id="houseGrad"
              x1="4"
              y1="4"
              x2="28"
              y2="28"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        <span
          style={{
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          RentHub
        </span>
      </div>

      {/* Scene container */}
      <div style={{ position: "relative", width: 540, maxWidth: "90vw" }}>
        {/* Characters */}
        <div style={{ position: "relative", height: 80, marginBottom: -4 }}>
          <LandlordCharacter progress={progress} />
          <TenantCharacter progress={progress} />
        </div>

        {/* Progress bar track */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 28,
            borderRadius: 14,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Filled */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #1d4ed8 0%, #2563eb 60%, #4f46e5 100%)",
              borderRadius: 14,
              transition: "width 0.08s linear",
              boxShadow: "0 0 20px rgba(37,99,235,0.5)",
            }}
          />
          {/* Shimmer */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              borderRadius: 14,
              animation: "loginShimmer 1.2s infinite linear",
            }}
          />
        </div>

        {/* Caption */}
        <div
          style={{
            marginTop: 24,
            textAlign: "center",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          }}
        >
          <p
            style={{
              color: "#60a5fa",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {progress < 40
              ? "Verifying your credentials…"
              : progress < 75
              ? "Loading your dashboard…"
              : progress < 95
              ? "Almost there!"
              : "Welcome back! 🏠"}
          </p>
          <p
            style={{
              color: "rgba(148,163,184,0.6)",
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            Rent smarter. Live better.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loginShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes landlordBob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes tenantRun {
          0%, 100% { transform: translateY(0px); }
          25%       { transform: translateY(-6px); }
          75%       { transform: translateY(-2px); }
        }
        @keyframes signWave {
          0%, 100% { transform: rotate(-6deg); }
          50%       { transform: rotate(6deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Landlord (suited figure with RENT DUE sign, on filled side) ────────────
function LandlordCharacter({ progress }: { progress: number }) {
  const leftPct = Math.max(0, Math.min(progress - 15, 76));
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: `${leftPct}%`,
        transition: "left 0.1s linear",
        animation: "landlordBob 0.55s ease-in-out infinite",
      }}
    >
      <svg
        width="54"
        height="78"
        viewBox="0 0 54 78"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Suit body */}
        <rect x="17" y="30" width="20" height="26" rx="4" fill="#1e3a8a" />
        {/* Collar */}
        <polygon points="17,30 27,40 27,30" fill="#1e40af" opacity="0.5" />
        <polygon points="37,30 27,40 27,30" fill="#1e40af" opacity="0.5" />
        {/* Tie */}
        <polygon points="24,30 30,30 29,44 25,44" fill="#dc2626" />
        {/* Head */}
        <circle cx="27" cy="19" r="11" fill="#fde68a" />
        {/* Hair */}
        <path d="M16 15 Q27 6 38 15" fill="#292524" />
        {/* Eyes (angry) */}
        <ellipse cx="23" cy="18" rx="1.8" ry="1.8" fill="#1c1917" />
        <ellipse cx="31" cy="18" rx="1.8" ry="1.8" fill="#1c1917" />
        {/* Eyebrows (furrowed) */}
        <line x1="20" y1="13" x2="25" y2="15" stroke="#292524" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="29" y1="15" x2="34" y2="13" stroke="#292524" strokeWidth="1.8" strokeLinecap="round" />
        {/* Grumpy mouth */}
        <path d="M23 24 Q27 22 31 24" stroke="#92400e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* Left arm with sign */}
        <line x1="17" y1="36" x2="5" y2="30" stroke="#fde68a" strokeWidth="4.5" strokeLinecap="round" />
        {/* Right arm (stride) */}
        <line x1="37" y1="36" x2="48" y2="42" stroke="#fde68a" strokeWidth="4.5" strokeLinecap="round" />
        {/* Legs */}
        <line x1="22" y1="56" x2="18" y2="72" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" />
        <line x1="32" y1="56" x2="36" y2="72" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" />
        {/* Shoes */}
        <ellipse cx="17" cy="73" rx="6" ry="3.5" fill="#1c1917" />
        <ellipse cx="37" cy="73" rx="6" ry="3.5" fill="#1c1917" />

        {/* RENT DUE sign */}
        <g transform="translate(-4, 14)" style={{ animation: "signWave 0.7s ease-in-out infinite" }}>
          <rect x="0" y="0" width="32" height="20" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="4" y="9" fontFamily="monospace" fontSize="6" fontWeight="bold" fill="#92400e">RENT</text>
          <text x="6" y="17" fontFamily="monospace" fontSize="6" fontWeight="bold" fill="#dc2626">DUE!</text>
        </g>
      </svg>
    </div>
  );
}

// ─── Tenant (casual figure running with a key, just ahead of landlord) ───────
function TenantCharacter({ progress }: { progress: number }) {
  const leftPct = Math.max(12, Math.min(progress + 3, 88));
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: `${leftPct}%`,
        transition: "left 0.1s linear",
        animation: "tenantRun 0.38s ease-in-out infinite",
      }}
    >
      {/* Flipped so they face left (running from landlord) */}
      <svg
        width="48"
        height="72"
        viewBox="0 0 48 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: "scaleX(-1)" }}
      >
        {/* Body */}
        <rect x="15" y="28" width="18" height="22" rx="4" fill="#0f766e" />
        {/* Head */}
        <circle cx="24" cy="17" r="11" fill="#fcd34d" />
        {/* Hair */}
        <path d="M13 13 Q24 4 35 13 L35 11 Q24 1 13 11Z" fill="#292524" />
        {/* Panicked eyes */}
        <circle cx="20" cy="16" r="2.5" fill="white" />
        <circle cx="28" cy="16" r="2.5" fill="white" />
        <circle cx="20.5" cy="16.5" r="1.2" fill="#1c1917" />
        <circle cx="28.5" cy="16.5" r="1.2" fill="#1c1917" />
        {/* Open mouth (scared) */}
        <ellipse cx="24" cy="22" rx="3.5" ry="2.5" fill="#92400e" />
        {/* Sweat drop */}
        <path d="M35 11 Q38 8 35 5 Q33 8 35 11" fill="#60a5fa" opacity="0.85" />
        {/* Left arm (holds key) */}
        <line x1="15" y1="34" x2="3" y2="28" stroke="#fcd34d" strokeWidth="4.5" strokeLinecap="round" />
        {/* Right arm (running) */}
        <line x1="33" y1="34" x2="45" y2="28" stroke="#fcd34d" strokeWidth="4.5" strokeLinecap="round" />
        {/* Legs */}
        <line x1="20" y1="50" x2="14" y2="66" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        <line x1="28" y1="50" x2="34" y2="66" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        {/* Shoes */}
        <ellipse cx="13" cy="67" rx="6" ry="3.5" fill="#292524" />
        <ellipse cx="35" cy="67" rx="6" ry="3.5" fill="#292524" />

        {/* Key */}
        <g transform="translate(-5, 22)">
          <circle cx="6" cy="6" r="4.5" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          <line x1="6" y1="10" x2="6" y2="20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="14" x2="10" y2="14" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="18" x2="10" y2="18" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
