"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createInventoryItem, type InventoryCreateResult } from "@/app/inventory/actions";

const categoryOptions = [
  "Sarf Malzeme",
  "Reaktif",
  "Kimyasal",
  "Diğer",
];

const unitOptions = ["adet", "şişe", "litre", "ml", "kutu", "paket", "rulo", "Diğer"];

export default function InventoryNewItemModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<InventoryCreateResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setFeedback(null);

    const result = await createInventoryItem(formData);

    if (result.success) {
      setIsOpen(false);
      event.currentTarget.reset();
      router.refresh();
    }

    setFeedback(result);
    setIsSubmitting(false);
  };

  return (
    <>
      {feedback && feedback.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback.message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setFeedback(null);
        }}
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        + Yeni Ürün
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-inventory-title"
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  New item
                </p>
                <h2 id="new-inventory-title" className="mt-2 text-2xl font-bold text-slate-900">
                  Yeni Ürün Ekle
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
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                    Ürün Adı
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Lamel"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
                    Kategori
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="" disabled>
                      Seçiniz
                    </option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="unit" className="mb-2 block text-sm font-medium text-slate-700">
                    Birim
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="" disabled>
                      Seçiniz
                    </option>
                    {unitOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="current_stock" className="mb-2 block text-sm font-medium text-slate-700">
                    Mevcut Stok
                  </label>
                  <input
                    id="current_stock"
                    name="current_stock"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="minimum_stock" className="mb-2 block text-sm font-medium text-slate-700">
                    Minimum Stok
                  </label>
                  <input
                    id="minimum_stock"
                    name="minimum_stock"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="storage_location" className="mb-2 block text-sm font-medium text-slate-700">
                    Saklama Konumu
                  </label>
                  <input
                    id="storage_location"
                    name="storage_location"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Raf A1"
                  />
                </div>
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
                  {isSubmitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
