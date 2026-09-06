"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Loader2,
  Sparkles,
  X,
  Lock,
  Key,
  BadgeCheck,
  UserCheck,
} from "lucide-react";
import apiClient from "@/lib/axios";

interface StaffItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  role_key: string;
  department: string;
  is_active: boolean;
  avatar_url?: string | null;
  last_login: string;
  permissions: string[];
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880 1700-000000");
  const [role, setRole] = useState("moderator");
  const [department, setDepartment] = useState("Trust & Safety");
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users/admin/staff");
      setStaff(res.data.staff || []);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim()) return;
    try {
      setSaving(true);
      const res = await apiClient.post("/users/admin/staff", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        department,
      });
      showToast(res.data.message || `Staff invitation sent to ${email}!`);
      setModalOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to invite staff");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: StaffItem) => {
    try {
      await apiClient.patch(`/users/admin/staff/${s.id}`, {
        is_active: !s.is_active,
      });
      showToast(`Updated status for ${s.name}!`);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update staff status");
    }
  };

  const filteredStaff = staff.filter((s) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || s.role.toLowerCase().includes(term);
  });

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff & RBAC Permissions</h1>
            <span className="bg-purple-50 text-purple-700 border border-purple-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5">
              <Key size={12} className="text-purple-600" />
              Role-Based Access Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage administrators, trust & safety moderators, financial officers, and support operators
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          <span>Invite New Staff</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Total Staff Members</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.total_staff || staff.length} Members</h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">All accounts active</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Super Admins</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.super_admins || 1} Admins</h3>
            <p className="text-purple-600 text-[11px] font-semibold mt-0.5">Full root permissions</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Trust & Safety</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary?.moderators || 1} Moderator</h3>
            <p className="text-emerald-500 text-[11px] font-semibold mt-0.5">NID & Listing audit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Lock size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Security Policy</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">Strict MFA</h3>
            <p className="text-amber-600 text-[11px] font-semibold mt-0.5">IP Whitelisting Enabled</p>
          </div>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, email or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3">Staff Name</th>
                <th className="py-3 px-3">Role & Department</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                        {s.avatar_url ? (
                          <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          s.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{s.name}</p>
                        <p className="text-slate-400 text-[10px]">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div>
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <BadgeCheck size={13} className="text-blue-600" />
                        {s.role}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.department}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="text-slate-700 font-mono text-xs">{s.phone}</p>
                  </td>

                  <td className="py-3.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {s.last_login}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {s.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {s.is_active ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleInviteStaff}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Users size={18} />
                <h3 className="font-bold text-slate-900 text-base">Invite Staff Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahbub"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahman"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mahbub@renthub.com.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="moderator">Trust & Safety Moderator</option>
                  <option value="super_admin">Super Administrator</option>
                  <option value="finance_manager">Finance & Payout Manager</option>
                  <option value="support_agent">Customer Operations Specialist</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>Send Staff Invite</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
