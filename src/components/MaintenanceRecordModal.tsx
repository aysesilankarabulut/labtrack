"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createMaintenanceRecord, type MaintenanceCreateResult } from "@/app/maintenance/actions";

type EquipmentOption = {
  id: string;
  name: string | null;
};

type MaintenanceRecordModalProps = {
  equipmentOptions: EquipmentOption[];
  defaultEquipmentId?: string;
  buttonLabel?: string;
};

const maintenanceTypeOptions = [
  "Periyodik Bakım",
  "Kalibrasyon",
  "Onarım",
  "Parça Değişimi",
  "Temizlik / Kontrol",
  "Diğer",
];

export default function MaintenanceRecordModal({
  equipmentOptions,
  defaultEquipmentId,
  buttonLabel = "+ Bakım Kaydı",
}: MaintenanceRecordModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<MaintenanceCreateResult | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(
    defaultEquipmentId ?? equipmentOptions[0]?.id ?? "",
  );

  const activeEquipmentId =
    selectedEquipmentId || defaultEquipmentId || equipmentOptions[0]?.id || "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setFeedback(null);

    const result = await createMaintenanceRecord(formData);

    if (result.success) {
      setFeedback(result);
      window.setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
        event.currentTarget.reset();
        router.refresh();
      }, 800);
    } else {
      setFeedback(result);
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setSelectedEquipmentId(defaultEquipmentId ?? equipmentOptions[0]?.id ?? "");
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        {buttonLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-record-title"
            className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Maintenance
                </p>
                <h2 id="maintenance-record-title" className="mt-2 text-2xl font-bold text-slate-900">
                  Bakım Kaydı Ekle
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
                <div>
                  <label htmlFor="equipment_id" className="mb-2 block text-sm font-medium text-slate-700">
                    Cihaz
                  </label>
                  <select
                    id="equipment_id"
                    name="equipment_id"
                    required
                    value={activeEquipmentId}
                    onChange={(event) => setSelectedEquipmentId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="">Cihaz seçin</option>
                    {equipmentOptions.map((equipment) => (
                      <option key={equipment.id} value={equipment.id}>
                        {equipment.name ?? "Bilinmeyen cihaz"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="maintenance_type" className="mb-2 block text-sm font-medium text-slate-700">
                    Bakım Türü
                  </label>
                  <select
                    id="maintenance_type"
                    name="maintenance_type"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    defaultValue=""
                  >
                    <option value="">Bakım türü seçin</option>
                    {maintenanceTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="maintenance_date" className="mb-2 block text-sm font-medium text-slate-700">
                    Bakım Tarihi
                  </label>
                  <input
                    id="maintenance_date"
                    name="maintenance_date"
                    type="date"
                    required
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

                <div>
                  <label htmlFor="performed_by" className="mb-2 block text-sm font-medium text-slate-700">
                    İşlemi Yapan
                  </label>
                  <input
                    id="performed_by"
                    name="performed_by"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Ör. A. Demir"
                  />
                </div>

                <div>
                  <label htmlFor="cost" className="mb-2 block text-sm font-medium text-slate-700">
                    Maliyet
                  </label>
                  <input
                    id="cost"
                    name="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    placeholder="Bakım hakkında kısa açıklama"
                  />
                </div>
              </div>

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
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
