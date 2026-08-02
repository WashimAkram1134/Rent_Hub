/**
 * RentHub — Profile & Address API Service
 */

import api from "@/lib/axios";
import {
  Address,
  AddressFormData,
  ChangePasswordData,
  ProfileUpdateData,
  User,
} from "@/types";

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },

  updateProfile: async (payload: ProfileUpdateData): Promise<User> => {
    const { data } = await api.patch<User>("/users/me", payload);
    return data;
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<{ avatar_url: string }>("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  changePassword: async (payload: ChangePasswordData): Promise<void> => {
    await api.post("/users/me/change-password", payload);
  },
};

// ─── Addresses ───────────────────────────────────────────────────────────────

export const addressService = {
  list: async (): Promise<Address[]> => {
    const { data } = await api.get<Address[]>("/users/me/addresses");
    return data;
  },

  create: async (payload: AddressFormData): Promise<Address> => {
    const { data } = await api.post<Address>("/users/me/addresses", payload);
    return data;
  },

  update: async (id: string, payload: Partial<AddressFormData>): Promise<Address> => {
    const { data } = await api.put<Address>(`/users/me/addresses/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/me/addresses/${id}`);
  },

  setDefault: async (id: string): Promise<Address> => {
    const { data } = await api.post<Address>(`/users/me/addresses/${id}/default`);
    return data;
  },
};
