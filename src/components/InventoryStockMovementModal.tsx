"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyStockMovement, type StockMovementResult } from "@/app/inventory/actions";

type InventoryStockMovementItem = {
  id: string;
  name: string | null;
  current_stock: number | string | null;
  unit: string | null;
};

type StockMovementModalProps = {
  item: InventoryStockMovementItem;
  movementType: "IN" | "OUT";
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

export default function InventoryStockMovementModal({ item, movementType }: StockMovementModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<StockMovementResult | null>(null);

  const currentStock = toNumber(item.current_stock);
  const label = movementType === "IN" ? "Stok Girişi" : "Stok Çıkışı";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("item_id", item.id);
    formData.set("movement_type", movementType);

    setIsSubmitting(true);
    setFeedback(null);

    const result = await applyStockMovement(formData);

    if (result.success) {
      setIsOpen(false);
      event.currentTarget.reset();
      setFeedback(result);
      router.refresh();
    } else {
      setFeedback(result);
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {feedback ? (
        <div
          className={[
            "mt-2 rounded-lg border px-3 py-2 text-xs font-medium",
            feedback.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setIsOpen(true);
        }}
        disabled={isSubmitting}
        className={[
          "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70",
          movementType === "IN"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        ].join(" ")}
      >
        {label}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-movement-title"
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Stock movement
                </p>
                <h2 id="stock-movement-title" className="mt-2 text-2xl font-bold text-slate-900">
                  {label}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Kapat"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ürün
                </p>
                <p className="text-base font-semibold text-slate-900">{item.name ?? "Bilinmeyen ürün"}</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mevcut Stok
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {currentStock} {item.unit ?? "adet"}
                  </p>
                </div>

                <div>
                  <label htmlFor={`movementType-${item.id}`} className="mb-2 block text-sm font-medium text-slate-700">
                    İşlem Türü
                  </label>
                  <select
                    id={`movementType-${item.id}`}
                    name="movement_type"
                    required
                    defaultValue={movementType}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={`quantity-${item.id}`} className="mb-2 block text-sm font-medium text-slate-700">
                  Miktar
                </label>
                <input
                  id={`quantity-${item.id}`}
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  placeholder="0.01"
                />
              </div>

              <div>
                <label htmlFor={`note-${item.id}`} className="mb-2 block text-sm font-medium text-slate-700">
                  Açıklama / Not
                </label>
                <textarea
                  id={`note-${item.id}`}
                  name="note"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  placeholder="İsteğe bağlı açıklama"
                />
              </div>

              {feedback && !feedback.success ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {feedback.message}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Kaydediliyor..." : label}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
