import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EquipmentRecord = {
  id: string;
  name: string | null;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  location: string | null;
  status: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const toDisplayDate = (value: string | null | undefined) => {
  if (!value) {
    return "Belirtilmedi";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Belirtilmedi";
  }

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: "Aktif",
  MAINTENANCE: "Bakımda",
  OUT_OF_SERVICE: "Kullanım Dışı",
};

const statusBadgeClassMap: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
};

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let equipment: EquipmentRecord | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    equipment = data as EquipmentRecord;
  } catch (error) {
    console.error("Failed to load equipment item", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Cihaz bilgisi yüklenemedi.</p>
        <p className="mt-1">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Cihaz bulunamadı.</p>
        <p className="mt-1">İstenen cihaz kaydı mevcut değil.</p>
      </div>
    );
  }

  const status = equipment.status ?? "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Equipment
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{equipment.name ?? "Cihaz"}</h1>
        </div>
        <Link
          href="/equipment"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Geri Dön
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Cihaz</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{equipment.name ?? "Bilinmeyen cihaz"}</p>
          </div>
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
              statusBadgeClassMap[status] ?? "bg-slate-100 text-slate-700",
            ].join(" ")}
          >
            {statusLabelMap[status] ?? status}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kategori</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{equipment.category ?? "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Üretici</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{equipment.manufacturer ?? "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Model</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{equipment.model ?? "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seri Numarası</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{equipment.serial_number ?? "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Konum</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{equipment.location ?? "-"}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Son Bakım</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{toDisplayDate(equipment.last_maintenance_date)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sonraki Bakım</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{toDisplayDate(equipment.next_maintenance_date)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Son Güncelleme</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{toDisplayDate(equipment.updated_at)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notlar</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {equipment.notes || "Not eklenmemiş."}
          </p>
        </div>
      </div>
    </div>
  );
}
