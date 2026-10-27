"use client";

import { getClientAuth } from "./firebase";

async function authHeader(): Promise<HeadersInit> {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createOrder(input: {
  productId: string;
  username?: string;
  paymentMethod?: string;
}) {
  const res = await fetch("/api/orders/create", {
    method: "POST",
    headers: await authHeader(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create order");
  return data as { id: string; orderId: string; price: number; status: string };
}

export async function approveOrder(orderId: string) {
  const res = await fetch("/api/orders/approve", {
    method: "POST",
    headers: await authHeader(),
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to approve");
  return data;
}

export async function addStock(input: {
  productId: string;
  username: string;
  password: string;
  extraInfo?: string;
}) {
  const res = await fetch("/api/stock/add", {
    method: "POST",
    headers: await authHeader(),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add stock");
  return data as { id: string };
}
