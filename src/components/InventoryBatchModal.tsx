"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addInventoryBatch, type InventoryBatchCreateResult } from "@/app/inventory/actions";

type InventoryBatchRecord = {
  id: string;
  item_id: string;
  lot_number: string | null;
  quantity: number | string | null;
  expiry_date: string | null;
  received_at: string | null;
  created_at: string | null;
};

type InventoryBatchModalProps = {
  item: {
    id: string;
    name: string | null;
    unit: string | null;
  };
  batches: InventoryBatchRecord[];
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getBatchStatus = (expiryDate: string | null) => {
  if (!expiryDate) {
    return {
      label: "Normal",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  const targetDate = new Date(expiryDate);

  if (Number.isNaN(targetDate.getTime())) {
    return {
      label: "Normal",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffInDays = Math.ceil(
    (targetDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays < 0) {
    return {
      label: "Süresi Dolmuş",
      className: "bg-red-100 text-red-700",
    };
  }

  if (diffInDays <= 30) {
    return {
      label: "SKT Yaklaşıyor",
      className: "bg-amber-100 text-amber-700",
    };
  }

  if (diffInDays <= 90) {
    return {
      label: "Yakında",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "Normal",
    className: "bg-emerald-100 text-emerald-700",
  };
};

export default function InventoryBatchModal({ item, batches }: InventoryBatchModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<InventoryBatchCreateResult | null>(null);
  const todayValue = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const lotNumber = String(formData.get("lot_number") ?? "").trim();
    const quantityRaw = formData.get("quantity");
    const receivedAt = String(formData.get("received_at") ?? "").trim();
    const expiryDate = String(formData.get("expiry_date") ?? "").trim();

    if (!lotNumber) {
      setFeedback({ success: false, message: "Lot numarası zorunludur." });
      return;
    }

    const quantity = Number(quantityRaw ?? NaN);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFeedback({ success: false, message: "Miktar 0'dan büyük olmalıdır." });
      return;
    }

    if (!receivedAt) {
      setFeedback({ success: false, message: "Giriş tarihi zorunludur." });
      return;
    }

    if (!expiryDate) {
      setFeedback({ success: false, message: "Son kullanma tarihi zorunludur." });
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const result = await addInventoryBatch(formData);

      if (result.success) {
        setFeedback(result);
        form.reset();
        setIsAddingLot(false);
        router.refresh();
        return;
      }

      setFeedback(result);
    } catch (error) {
      console.error("Inventory batch submit failed", error);
      setFeedback({
        success: false,
        message: "Lot eklenirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Lot / SKT
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-batches-title"
            className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inventory
                </p>
                <h2 id="inventory-batches-title" className="mt-2 text-2xl font-bold text-slate-900">
                  {item.name ?? "Ürün"} / Lot Takibi
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

            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setIsAddingLot(true);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                + Yeni Lot
              </button>
            </div>

            {isAddingLot ? (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Yeni Lot Ekle</h3>

                <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
                  <input type="hidden" name="item_id" value={item.id} />

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="lot_number" className="mb-2 block text-sm font-medium text-slate-700">
                        Lot Numarası
                      </label>
                      <input
                        id="lot_number"
                        name="lot_number"
                        type="text"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        placeholder="HEM-2601"
                      />
                    </div>

                    <div>
                      <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-slate-700">
                        Miktar
                      </label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        placeholder="25"
                      />
                    </div>

                    <div>
                      <label htmlFor="received_at" className="mb-2 block text-sm font-medium text-slate-700">
                        Giriş Tarihi
                      </label>
                      <input
                        id="received_at"
                        name="received_at"
                        type="date"
                        defaultValue={todayValue}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="expiry_date" className="mb-2 block text-sm font-medium text-slate-700">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        id="expiry_date"
                        name="expiry_date"
                        type="date"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingLot(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Kaydediliyor..." : "Lotu Kaydet"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {feedback ? (
              <div
                className={[
                  "mb-5 rounded-xl border px-4 py-3 text-sm",
                  feedback.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700",
                ].join(" ")}
              >
                {feedback.message}
              </div>
            ) : null}

            {batches.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Bu ürün için henüz lot kaydı yok.
              </div>
            ) : (
              <div className="space-y-3">
                {batches.map((batch) => {
                  const status = getBatchStatus(batch.expiry_date);

                  return (
                    <div
                      key={batch.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Lot Numarası</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">
                            {batch.lot_number ?? "-"}
                          </p>
                        </div>

                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                            status.className,
                          ].join(" ")}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-5">
                        <div>
                          <p className="text-slate-500">Miktar</p>
                          <p className="mt-1 font-medium text-slate-900">
                            {toNumber(batch.quantity)} {item.unit ?? "adet"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Birim</p>
                          <p className="mt-1 font-medium text-slate-900">{item.unit ?? "adet"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Giriş Tarihi</p>
                          <p className="mt-1 font-medium text-slate-900">
                            {formatDate(batch.received_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Son Kullanma</p>
                          <p className="mt-1 font-medium text-slate-900">
                            {formatDate(batch.expiry_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Durum</p>
                          <p className="mt-1 font-medium text-slate-900">{status.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
