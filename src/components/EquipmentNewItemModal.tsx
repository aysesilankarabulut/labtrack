"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEquipmentItem, type EquipmentCreateResult } from "@/app/equipment/actions";

const statusOptions = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "MAINTENANCE", label: "Bakımda" },
  { value: "OUT_OF_SERVICE", label: "Kullanım Dışı" },
];

export default function EquipmentNewItemModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<EquipmentCreateResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setFeedback(null);

    const result = await createEquipmentItem(formData);

    if (result.success) {
      setFeedback(result);
      setIsOpen(false);
      event.currentTarget.reset();
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
            "rounded-xl border px-4 py-3 text-sm",
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
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        + Yeni Cihaz
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-equipment-title"
            className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  New equipment
                </p>
                <h2 id="new-equipment-title" className="mt-2 text-2xl font-bold text-slate-900">
                  Yeni Cihaz Ekle
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
                    Cihaz Adı
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Santrifüj 01"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
                    Kategori
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Analiz"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
                    Durum
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="ACTIVE"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="manufacturer" className="mb-2 block text-sm font-medium text-slate-700">
                    Üretici
                  </label>
                  <input
                    id="manufacturer"
                    name="manufacturer"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Thermo Fisher"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="mb-2 block text-sm font-medium text-slate-700">
                    Model
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Heraeus"
                  />
                </div>

                <div>
                  <label htmlFor="serial_number" className="mb-2 block text-sm font-medium text-slate-700">
                    Seri Numarası
                  </label>
                  <input
                    id="serial_number"
                    name="serial_number"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="SN-101"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="mb-2 block text-sm font-medium text-slate-700">
                    Konum
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Laboratuvar 1 / Raf A"
                  />
                </div>

                <div>
                  <label htmlFor="last_maintenance_date" className="mb-2 block text-sm font-medium text-slate-700">
                    Son Bakım Tarihi
                  </label>
                  <input
                    id="last_maintenance_date"
                    name="last_maintenance_date"
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="next_maintenance_date" className="mb-2 block text-sm font-medium text-slate-700">
                    Sonraki Bakım Tarihi
                  </label>
                  <input
                    id="next_maintenance_date"
                    name="next_maintenance_date"
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-700">
                    Notlar
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="İsteğe bağlı notlar"
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
                  {isSubmitting ? "Kaydediliyor..." : "Cihazı Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
