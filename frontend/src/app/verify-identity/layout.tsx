import type { Metadata } from "next";
import { StepIndicator } from "@/features/identity-verification/components/StepIndicator";

export const metadata: Metadata = {
  title: "Identity Verification | RentHub",
  description: "Complete a one-time identity verification to start booking on RentHub.",
};

interface VerifyLayoutProps {
  children: React.ReactNode;
}

export default function VerifyIdentityLayout({ children }: VerifyLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-semibold text-slate-700 text-sm">RentHub Verification</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Secure · Private · One-time</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>

      {/* Footer note */}
      <footer className="py-4 text-center">
        <p className="text-xs text-slate-400">
          RentHub Identity Verification is not affiliated with the Bangladesh Government or any official NID system.
        </p>
      </footer>
    </div>
  );
}
