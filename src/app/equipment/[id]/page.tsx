import Link from "next/link";
import MaintenanceRecordModal from "@/components/MaintenanceRecordModal";
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

type MaintenanceRecordRow = {
  id: string;
  equipment_id: string;
  maintenance_type: string;
  maintenance_date: string;
  performed_by: string | null;
  description: string | null;
  cost: number | null;
  next_maintenance_date: string | null;
  created_at: string | null;
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

const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) {
    return "Belirtilmedi";
  }

  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ₺`;
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
  let equipmentOptions: Array<{ id: string; name: string | null }> = [];
  let maintenanceHistory: MaintenanceRecordRow[] = [];

  try {
    const supabase = await createClient();
    const [equipmentResult, equipmentListResult, maintenanceHistoryResult] = await Promise.all([
      supabase.from("equipment").select("*").eq("id", id).single(),
      supabase
        .from("equipment")
        .select("id, name")
        .order("name", { ascending: true }),
      supabase
        .from("maintenance_records")
        .select("*")
        .eq("equipment_id", id)
        .order("maintenance_date", { ascending: false }),
    ]);

    if (equipmentResult.error) {
      throw equipmentResult.error;
    }

    if (equipmentListResult.error) {
      throw equipmentListResult.error;
    }

    if (maintenanceHistoryResult.error) {
      throw maintenanceHistoryResult.error;
    }

    equipment = equipmentResult.data as EquipmentRecord;
    equipmentOptions = (equipmentListResult.data ?? []) as Array<{ id: string; name: string | null }>;
    maintenanceHistory = (maintenanceHistoryResult.data ?? []) as MaintenanceRecordRow[];
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
  const todayStart = new Date();
  const todayDate = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate(),
  );
  const isOverdue = equipment.next_maintenance_date
    ? new Date(equipment.next_maintenance_date).getTime() < todayDate.getTime()
    : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Equipment
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{equipment.name ?? "Cihaz"}</h1>
        </div>

        <div className="flex items-center gap-3">
          <MaintenanceRecordModal
            equipmentOptions={equipmentOptions}
            defaultEquipmentId={equipment.id}
            buttonLabel="+ Bakım Ekle"
          />
          <Link
            href="/equipment"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Geri Dön
          </Link>
        </div>
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

        {isOverdue ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            Bu cihazın periyodik bakım tarihi geçmiş.
          </div>
        ) : null}

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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Bakım Geçmişi</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {maintenanceHistory.length} kayıt
          </span>
        </div>

        {maintenanceHistory.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Bu cihaza ait bakım kaydı bulunmuyor.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {maintenanceHistory.map((record) => (
              <div key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{record.maintenance_type}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Bakım Tarihi: {toDisplayDate(record.maintenance_date)}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-500">İşlemi Yapan</p>
                    <p className="font-medium text-slate-900">{record.performed_by || "-"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                  <div>
                    <p className="text-slate-500">Açıklama</p>
                    <p className="mt-1 font-medium text-slate-900">{record.description || "-"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Maliyet</p>
                    <p className="mt-1 font-medium text-slate-900">{formatCurrency(record.cost)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Sonraki Bakım</p>
                    <p className="mt-1 font-medium text-slate-900">{toDisplayDate(record.next_maintenance_date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
