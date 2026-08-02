/**
 * RentHub Frontend — Global TypeScript Types
 *
 * All shared interfaces, enums, and utility types used across features.
 * Feature-specific types should live in their respective feature directory.
 */

// ─── API Response Shapes ───────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      fields?: Record<string, string[]>;
      [key: string]: unknown;
    };
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PagedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// ─── Auth & User ───────────────────────────────────────────────────────────

export type UserRole = "guest" | "customer" | "owner" | "admin";

export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  is_verified: boolean;
  is_identity_verified: boolean;
  is_active: boolean;
  primary_role: UserRole;
  role_names: UserRole[];
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: "bearer";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "customer" | "owner";
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

// ─── Address ──────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  street_line1: string;
  street_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  notes?: string;
}

export interface AddressFormData {
  label: string;
  street_line1: string;
  street_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  notes?: string;
  is_default: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────

export type ProductCondition = "new" | "like_new" | "good" | "fair" | "poor";
export type DeliveryOption = "pickup" | "delivery" | "both";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  icon_url?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_per_day: number;
  security_deposit: number;
  condition: ProductCondition;
  delivery_option: DeliveryOption;
  category: Category;
  owner: Pick<User, "id" | "first_name" | "last_name" | "avatar_url" | "is_identity_verified">;
  images: ProductImage[];
  is_active: boolean;
  view_count: number;
  average_rating?: number;
  review_count?: number;
  city?: string;
  created_at: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "active"
  | "completed"
  | "disputed";

export interface Booking {
  id: string;
  product: Pick<Product, "id" | "title" | "images" | "price_per_day">;
  renter: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">;
  owner: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  security_deposit: number;
  delivery_fee: number;
  total_amount: number;
  status: BookingStatus;
  delivery_option: DeliveryOption;
  notes?: string;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

// ─── Review ───────────────────────────────────────────────────────────────

export type ReviewType = "product" | "owner" | "renter";

export interface Review {
  id: string;
  reviewer: Pick<User, "id" | "first_name" | "last_name" | "avatar_url">;
  rating: number;
  comment?: string;
  type: ReviewType;
  created_at: string;
}

// ─── Utility Types ────────────────────────────────────────────────────────

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string; // UUID

export interface SelectOption {
  value: string;
  label: string;
}
