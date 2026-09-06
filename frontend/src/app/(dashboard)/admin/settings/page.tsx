"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Percent,
  CreditCard,
  Building,
  Lock,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  DollarSign,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";
import apiClient from "@/lib/axios";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "financials" | "security" | "maintenance">("financials");

  // Form State
  const [marketplaceName, setMarketplaceName] = useState("RentHub Bangladesh");
  const [supportPhone, setSupportPhone] = useState("+880 1700-112233");
  const [supportEmail, setSupportEmail] = useState("support@renthub.com.bd");
  const [defaultCurrency, setDefaultCurrency] = useState("BDT");
  const [platformCommission, setPlatformCommission] = useState(10.0);
  const [customerServiceFee, setCustomerServiceFee] = useState(6.0);
  const [securityDepositRate, setSecurityDepositRate] = useState(9.0);
  const [refundGraceHours, setRefundGraceHours] = useState(24);
  const [requireNidForRentals, setRequireNidForRentals] = useState(true);
  const [highValueNidThreshold, setHighValueNidThreshold] = useState(5000);
  const [autoFreezeDisputed, setAutoFreezeDisputed] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState("Platform is undergoing scheduled database maintenance. We will be back online shortly.");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/cms/admin/settings");
      const s = res.data.settings;
      if (s) {
        setMarketplaceName(s.marketplace_name || "RentHub Bangladesh");
        setSupportPhone(s.support_phone || "+880 1700-112233");
        setSupportEmail(s.support_email || "support@renthub.com.bd");
        setDefaultCurrency(s.default_currency || "BDT");
        setPlatformCommission(s.platform_commission_rate ?? 10.0);
        setCustomerServiceFee(s.customer_service_fee_rate ?? 6.0);
        setSecurityDepositRate(s.security_deposit_rate ?? 9.0);
        setRefundGraceHours(s.refund_grace_hours ?? 24);
        setRequireNidForRentals(s.require_nid_for_rentals ?? true);
        setHighValueNidThreshold(s.high_value_nid_threshold ?? 5000);
        setAutoFreezeDisputed(s.auto_freeze_disputed_accounts ?? true);
        setTwoFactorAuth(s.two_factor_auth_required ?? false);
        setMaintenanceMode(s.maintenance_mode ?? false);
        setMaintenanceNotice(s.maintenance_notice || "");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiClient.post("/cms/admin/settings", {
        marketplace_name: marketplaceName,
        support_phone: supportPhone,
        support_email: supportEmail,
        default_currency: defaultCurrency,
        platform_commission_rate: Number(platformCommission),
        customer_service_fee_rate: Number(customerServiceFee),
        security_deposit_rate: Number(securityDepositRate),
        refund_grace_hours: Number(refundGraceHours),
        require_nid_for_rentals: requireNidForRentals,
        high_value_nid_threshold: Number(highValueNidThreshold),
        auto_freeze_disputed_accounts: autoFreezeDisputed,
        two_factor_auth_required: twoFactorAuth,
        maintenance_mode: maintenanceMode,
        maintenance_notice: maintenanceNotice,
      });
      showToast(res.data.message || "System configurations saved successfully!");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings & Policies</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-600" />
              Engine V2.4 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure financial commissions, security policies, verification triggers, and maintenance controls
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: "financials", label: "Financials & Commission", icon: Percent },
          { key: "general", label: "General & Branding", icon: Building },
          { key: "security", label: "Trust & NID Verification", icon: ShieldCheck },
          { key: "maintenance", label: "Maintenance & Platform Mode", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Body */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        {/* Tab 1: Financials & Commission */}
        {activeTab === "financials" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform Financial Rates & Commission</h3>
              <p className="text-xs text-slate-500">Configure marketplace revenue share, service fees, and refundable deposits</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">Host Commission Rate (%)</label>
                <p className="text-slate-500 text-[11px]">Deducted automatically from host payout disbursals</p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={platformCommission}
                    onChange={(e) => setPlatformCommission(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-sm focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">Customer Service Fee (%)</label>
                <p className="text-slate-500 text-[11px]">Applied to rental subtotal during checkout</p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={customerServiceFee}
                    onChange={(e) => setCustomerServiceFee(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-sm focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">Standard Security Deposit Rate (%)</label>
                <p className="text-slate-500 text-[11px]">Held in platform escrow until safe return</p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={securityDepositRate}
                    onChange={(e) => setSecurityDepositRate(parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-sm focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">Full Refund Grace Window (Hours)</label>
                <p className="text-slate-500 text-[11px]">Hours before rental start where 100% refund is guaranteed</p>
                <div className="relative">
                  <input
                    type="number"
                    value={refundGraceHours}
                    onChange={(e) => setRefundGraceHours(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-sm focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Hours</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: General & Branding */}
        {activeTab === "general" && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Marketplace Information & Support Channels</h3>
              <p className="text-slate-500">Contact details shown in receipts, emails, and platform footers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Platform Brand Name</label>
                <input
                  type="text"
                  value={marketplaceName}
                  onChange={(e) => setMarketplaceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Platform Currency</label>
                <input
                  type="text"
                  disabled
                  value="BDT (৳ - Bangladeshi Taka)"
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Support Email Address</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Verification */}
        {activeTab === "security" && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Trust, Safety & Verification Guardrails</h3>
              <p className="text-slate-500">Automated fraud prevention and mandatory biometric verification triggers</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Mandatory NID Face Verification for High-Value Rentals</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Requires government NID + live face matching before confirming luxury vehicle and camera bookings
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireNidForRentals}
                  onChange={(e) => setRequireNidForRentals(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">High-Value Threshold (BDT)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Bookings exceeding this amount automatically trigger mandatory identity checks
                  </p>
                </div>
                <input
                  type="number"
                  value={highValueNidThreshold}
                  onChange={(e) => setHighValueNidThreshold(parseInt(e.target.value))}
                  className="w-32 p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Auto-Freeze Disputed Accounts</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Temporarily lock payouts and new bookings if active dispute exceeds 48 hours without resolution
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoFreezeDisputed}
                  onChange={(e) => setAutoFreezeDisputed(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Maintenance Mode */}
        {activeTab === "maintenance" && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform Operational Mode</h3>
              <p className="text-slate-500">Emergency switch to put RentHub in maintenance mode during database upgrades</p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-900 text-xs">Activate Platform Maintenance Mode</h4>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  Temporarily halts new customer checkouts while allowing admin console access
                </p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Maintenance Banner Announcement</label>
              <textarea
                rows={2}
                value={maintenanceNotice}
                onChange={(e) => setMaintenanceNotice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Save CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
