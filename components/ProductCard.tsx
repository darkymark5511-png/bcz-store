"use client";

import type { Product } from "@/types";

interface Props {
  product: Product;
  vip?: boolean;
  onSelect?: (p: Product) => void;
  categoryName?: string;
}

export default function ProductCard({
  product,
  vip,
  onSelect,
  categoryName,
}: Props) {
  const price =
    vip && product.vipPrice != null ? Number(product.vipPrice) : Number(product.price || 0);
  const showVip =
    vip && product.vipPrice != null && Number(product.vipPrice) !== Number(product.price);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(product)}
      className="product-card p-0"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800/80">
        {product.imageURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageURL}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-black tracking-tight text-sky-600 dark:text-sky-400">
            {product.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        {typeof product.stock === "number" && (
          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            stok {product.stock}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {categoryName || product.categoryId || product.game || "Roblox"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug">
          {product.name}
        </h3>
        {product.game && (
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">{product.game}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="tabular-nums text-sm font-black text-sky-600 dark:text-sky-400">
              Rp {price.toLocaleString("id-ID")}
            </p>
            {showVip && (
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                VIP
              </p>
            )}
          </div>
          {!showVip && product.vipPrice != null && (
            <p className="text-[10px] text-[var(--muted)]">
              VIP Rp {Number(product.vipPrice).toLocaleString("id-ID")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
