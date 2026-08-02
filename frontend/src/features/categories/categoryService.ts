import apiClient from "@/lib/axios";
import { Category, CategoryFormData } from "@/types";

export const categoryService = {
  list: async (includeInactive = false): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>("/categories", {
      params: { include_inactive: includeInactive },
    });
    return res.data;
  },

  get: async (slugOrId: string): Promise<Category> => {
    const res = await apiClient.get<Category>(`/categories/${slugOrId}`);
    return res.data;
  },

  create: async (data: CategoryFormData): Promise<Category> => {
    const res = await apiClient.post<Category>("/categories", data);
    return res.data;
  },

  update: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    const res = await apiClient.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
