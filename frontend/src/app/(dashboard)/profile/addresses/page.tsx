"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { addressService } from "@/features/profile/profileService";
import { Address, AddressFormData } from "@/types";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  label: z.string().min(1, "Required").max(50),
  street_line1: z.string().min(1, "Required").max(255),
  street_line2: z.string().max(255).optional().or(z.literal("")),
  city: z.string().min(1, "Required").max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  country: z.string().min(1, "Required").max(100),
  notes: z.string().optional().or(z.literal("")),
  is_default: z.boolean(),
});

type AddressForm = z.infer<typeof schema>;

// ── Address Card ──────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: (a: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-200 ${
        address.is_default
          ? "border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-blue-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/8"
      }`}
    >
      {address.is_default && (
        <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium text-violet-400 bg-violet-500/20 px-2.5 py-1 rounded-full">
          <Star size={11} className="fill-current" /> Default
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-xl ${address.is_default ? "bg-violet-500/20" : "bg-white/10"}`}>
          <Home size={16} className={address.is_default ? "text-violet-400" : "text-slate-400"} />
        </div>
        <div>
          <span className="text-white font-semibold text-sm">{address.label}</span>
        </div>
      </div>

      <div className="text-slate-300 text-sm leading-relaxed pl-11">
        <p>{address.street_line1}</p>
        {address.street_line2 && <p>{address.street_line2}</p>}
        <p>
          {address.city}
          {address.state ? `, ${address.state}` : ""}
          {address.postal_code ? ` ${address.postal_code}` : ""}
        </p>
        <p>{address.country}</p>
        {address.notes && <p className="text-slate-500 mt-1 text-xs italic">{address.notes}</p>}
      </div>

      <div className="flex items-center gap-2 mt-4 pl-11">
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 px-2.5 py-1.5 rounded-lg hover:bg-violet-500/10 transition-all"
          >
            <CheckCircle size={13} /> Set Default
          </button>
        )}
        <button
          onClick={() => onEdit(address)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── Address Form Modal ────────────────────────────────────────────────────────

function AddressModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Address;
  onClose: () => void;
  onSave: (data: AddressFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initial?.label ?? "Home",
      street_line1: initial?.street_line1 ?? "",
      street_line2: initial?.street_line2 ?? "",
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      postal_code: initial?.postal_code ?? "",
      country: initial?.country ?? "Bangladesh",
      notes: initial?.notes ?? "",
      is_default: initial?.is_default ?? false,
    },
  });

  const Field = ({
    label,
    name,
    placeholder,
    required,
  }: {
    label: string;
    name: keyof AddressForm;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">
            {initial ? "Edit Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(async (values) => {
            await onSave(values as AddressFormData);
          })}
          className="p-6 space-y-4"
        >
          {/* Label & Country */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Label" name="label" placeholder="Home, Work, Other" required />
            <Field label="Country" name="country" placeholder="Bangladesh" required />
          </div>

          {/* Street */}
          <Field label="Street Line 1" name="street_line1" placeholder="House / Street" required />
          <Field label="Street Line 2" name="street_line2" placeholder="Apartment, floor (optional)" />

          {/* City, State */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" name="city" placeholder="Dhaka" required />
            <Field label="State / Division" name="state" placeholder="Dhaka Division" />
          </div>

          {/* Postal */}
          <Field label="Postal Code" name="postal_code" placeholder="1205" />

          {/* Notes */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Notes</label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Any delivery instructions..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors resize-none"
            />
          </div>

          {/* Default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register("is_default")} type="checkbox" className="w-4 h-4 rounded accent-violet-500" />
            <span className="text-slate-300 text-sm">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | undefined>();

  const load = async () => {
    try {
      const data = await addressService.list();
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(undefined); setModalOpen(true); };
  const openEdit = (a: Address) => { setEditTarget(a); setModalOpen(true); };

  const handleSave = async (data: AddressFormData) => {
    if (editTarget) {
      await addressService.update(editTarget.id, data);
    } else {
      await addressService.create(data);
    }
    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await addressService.remove(id);
    await load();
  };

  const handleSetDefault = async (id: string) => {
    await addressService.setDefault(id);
    await load();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Addresses</h1>
          <p className="text-slate-400 mt-1">Manage your saved delivery and billing addresses</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 text-sm"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="text-violet-400 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white/5 border border-white/10 rounded-2xl">
          <MapPin size={48} className="text-slate-600 mb-4" />
          <h3 className="text-white font-semibold text-lg">No addresses yet</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">Add your first delivery address to get started</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm font-medium"
          >
            <Plus size={16} /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={openEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AddressModal initial={editTarget} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
