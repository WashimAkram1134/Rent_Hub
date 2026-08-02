"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import { categoryService } from "@/features/categories/categoryService";
import { Category, CategoryFormData } from "@/types";
import { useAuthStore } from "@/features/auth/authStore";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(1000).optional().or(z.literal("")),
  icon_url: z.string().max(255).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

type CategoryForm = z.infer<typeof schema>;

// ── Form Modal ────────────────────────────────────────────────────────────────

function CategoryModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Category;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      icon_url: initial?.icon_url ?? "",
      sort_order: initial?.sort_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  });

  const Field = ({
    label,
    name,
    placeholder,
    type = "text",
    required,
  }: {
    label: string;
    name: keyof CategoryForm;
    placeholder?: string;
    type?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors"
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">
            {initial ? "Edit Category" : "Add New Category"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(async (values) => await onSave(values as CategoryFormData))} className="p-6 space-y-4">
          <Field label="Name" name="name" placeholder="e.g. Cameras" required />
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Description</label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="Short description..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm transition-colors resize-none"
            />
          </div>

          <Field label="Icon Class/URL" name="icon_url" placeholder="e.g. lucide-camera" />
          
          <Field label="Sort Order" name="sort_order" type="number" />

          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input {...register("is_active")} type="checkbox" className="w-4 h-4 rounded accent-violet-500" />
            <span className="text-slate-300 text-sm font-medium">Active (Visible to users)</span>
          </label>

          <div className="flex gap-3 pt-4">
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
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | undefined>();

  const isAdmin = user?.primary_role === "admin";

  const load = async () => {
    try {
      const data = await categoryService.list(true); // include inactive for admin
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin]);

  if (!loading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-white font-semibold text-xl">Access Denied</h2>
        <p className="text-slate-400 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  const openAdd = () => { setEditTarget(undefined); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditTarget(c); setModalOpen(true); };

  const handleSave = async (data: CategoryFormData) => {
    if (editTarget) {
      await categoryService.update(editTarget.id, data);
    } else {
      await categoryService.create(data);
    }
    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryService.remove(id);
      await load();
    } catch (e) {
      alert("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories Management</h1>
          <p className="text-slate-400 mt-1">Manage product categories for the marketplace</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-200 text-sm"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="text-violet-400 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-white font-semibold text-lg">No categories found</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">Create the first category to get started.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-300 text-sm">
                <th className="py-4 px-6 font-semibold">Name</th>
                <th className="py-4 px-6 font-semibold">Slug</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Sort Order</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-medium text-white">{cat.name}</td>
                  <td className="py-4 px-6 font-mono text-slate-400">{cat.slug}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">{cat.sort_order}</td>
                  <td className="py-4 px-6 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CategoryModal initial={editTarget} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
