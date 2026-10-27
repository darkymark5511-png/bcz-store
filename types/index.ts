export type Role = "newbie" | "vip" | "admin";
export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "delivered"
  | "cancelled";
export type StockStatus = "available" | "sold";

export interface UserDoc {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  legacyPhotoURL?: string;
  role: Role;
  createdAt: number;
  updatedAt?: number;
  bio?: string;
  avatarUrl?: string;
  robloxUsername?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: string;
  game: string;
  price: number;
  vipPrice?: number;
  stock: number;
  description: string;
  imageURL?: string;
  active: boolean;
  type?: "standard" | "vip";
  durationDays?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  type?: "standard" | "vip";
  durationDays?: number;
}

export interface Order {
  id: string;
  userId: string;
  username?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentProofURL?: string;
  deliveryPayload?: string;
  rejectReason?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AccountStock {
  id: string;
  productId: string;
  payload: string;
  status: StockStatus;
  orderId?: string;
  createdAt?: number;
}

export interface VipMember {
  uid: string;
  expiresAt: number;
  updatedAt?: number;
}

export interface Banner {
  id: string;
  title: string;
  imageURL: string;
  href?: string;
  order: number;
  active: boolean;
}

export interface SiteSettings {
  id?: string;
  adminWhatsApp?: string;
  footerText?: string;
  socialLinks?: { label: string; url: string }[];
}

export interface AuditLog {
  id: string;
  actorUid: string;
  action: string;
  targetPath: string;
  before?: unknown;
  after?: unknown;
  createdAt: number;
}

/** @deprecated use UserDoc */
export type UserProfile = UserDoc;
