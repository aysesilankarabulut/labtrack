import MaintenanceRecordModal from "@/components/MaintenanceRecordModal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LabTrack | Maintenance",
};

type EquipmentSummary = {
  id: string;
  name: string | null;
  location: string | null;
  status: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
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

const getEquipmentStatus = (equipment: EquipmentSummary) => {
  if (equipment.status === "MAINTENANCE") {
    return "Bakımda";
  }

  if (!equipment.next_maintenance_date) {
    return "Normal";
  }

  const targetDate = new Date(equipment.next_maintenance_date);

  if (Number.isNaN(targetDate.getTime())) {
    return "Normal";
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffInDays = Math.ceil(
    (targetDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (targetDate.getTime() < todayStart.getTime()) {
    return "Bakım Gecikti";
  }

  if (diffInDays <= 30) {
    return "Bakım Yaklaşıyor";
  }

  return "Normal";
};

const statusClassMap: Record<string, string> = {
  Normal: "bg-emerald-100 text-emerald-700",
  "Bakım Yaklaşıyor": "bg-amber-100 text-amber-700",
  "Bakım Gecikti": "bg-red-100 text-red-700",
  Bakımda: "bg-violet-100 text-violet-700",
};

export default async function MaintenancePage() {
  const supabase = await createClient();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  let equipment: EquipmentSummary[] = [];
  let maintenanceRecords: MaintenanceRecordRow[] = [];
  let thisMonthCount = 0;
  let totalMaintenanceCount = 0;

  try {
    const [equipmentResult, recordsResult, monthlyResult] = await Promise.all([
      supabase
        .from("equipment")
        .select("id, name, location, status, last_maintenance_date, next_maintenance_date")
        .order("name", { ascending: true }),
      supabase
        .from("maintenance_records")
        .select("*", { count: "exact" })
        .order("maintenance_date", { ascending: false })
        .limit(10),
      supabase
        .from("maintenance_records")
        .select("id")
        .gte("maintenance_date", monthStart)
        .lte("maintenance_date", monthEnd),
    ]);

    if (equipmentResult.error) {
      throw equipmentResult.error;
    }

    if (recordsResult.error) {
      throw recordsResult.error;
    }

    if (monthlyResult.error) {
      throw monthlyResult.error;
    }

    equipment = (equipmentResult.data ?? []) as EquipmentSummary[];
    maintenanceRecords = (recordsResult.data ?? []) as MaintenanceRecordRow[];
    thisMonthCount = monthlyResult.data?.length ?? 0;
    totalMaintenanceCount = recordsResult.count ?? maintenanceRecords.length;
  } catch (error) {
    console.error("Failed to load maintenance data", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Bakım verileri yüklenemedi.</p>
        <p className="mt-1">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  const upcomingCount = equipment.filter((item) => {
    if (!item.next_maintenance_date || item.status === "MAINTENANCE") {
      return false;
    }

    const targetDate = new Date(item.next_maintenance_date);

    if (Number.isNaN(targetDate.getTime())) {
      return false;
    }

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffInDays = Math.ceil(
      (targetDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    return diffInDays >= 0 && diffInDays <= 30;
  }).length;

  const overdueCount = equipment.filter((item) => {
    if (!item.next_maintenance_date) {
      return false;
    }

    const targetDate = new Date(item.next_maintenance_date);

    if (Number.isNaN(targetDate.getTime())) {
      return false;
    }

    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return targetDate.getTime() < todayStart.getTime();
  }).length;

  const equipmentNameMap = new Map<string, string>();
  equipment.forEach((item) => {
    equipmentNameMap.set(item.id, item.name ?? "Bilinmeyen cihaz");
  });

  const summaryCards = [
    {
      label: "Toplam Bakım Kaydı",
      value: totalMaintenanceCount,
      className: "bg-slate-900 text-white",
    },
    {
      label: "Bu Ay Yapılan Bakım",
      value: thisMonthCount,
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Yaklaşan Bakım",
      value: upcomingCount,
      className: "bg-amber-50 text-amber-700",
    },
    {
      label: "Geciken Bakım",
      value: overdueCount,
      className: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Maintenance
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Maintenance Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Laboratuvar cihazlarının bakım kayıtları ve planlamaları yönetiliyor.
          </p>
        </div>

        <MaintenanceRecordModal
          equipmentOptions={equipment.map((item) => ({
            id: item.id,
            name: item.name,
          }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-5 shadow-sm ${card.className}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Bakım Takvimi / Cihaz Durumları</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {equipment.length} cihaz
          </span>
        </div>

        {equipment.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Kayıtlı cihaz bulunmuyor.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Cihaz</th>
                  <th className="pb-3 pr-4 font-medium">Konum</th>
                  <th className="pb-3 pr-4 font-medium">Son Bakım</th>
                  <th className="pb-3 pr-4 font-medium">Sonraki Bakım</th>
                  <th className="pb-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => {
                  const status = getEquipmentStatus(item);

                  return (
                    <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{item.name ?? "Bilinmeyen cihaz"}</td>
                      <td className="py-3 pr-4">{item.location ?? "-"}</td>
                      <td className="py-3 pr-4">{toDisplayDate(item.last_maintenance_date)}</td>
                      <td className="py-3 pr-4">{toDisplayDate(item.next_maintenance_date)}</td>
                      <td className="py-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                            statusClassMap[status] ?? "bg-slate-100 text-slate-700",
                          ].join(" ")}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Son Bakım Kayıtları</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            Son 10 kayıt
          </span>
        </div>

        {maintenanceRecords.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Henüz bakım kaydı bulunmuyor.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Cihaz</th>
                  <th className="pb-3 pr-4 font-medium">Bakım Türü</th>
                  <th className="pb-3 pr-4 font-medium">Bakım Tarihi</th>
                  <th className="pb-3 pr-4 font-medium">İşlemi Yapan</th>
                  <th className="pb-3 pr-4 font-medium">Açıklama</th>
                  <th className="pb-3 pr-4 font-medium">Maliyet</th>
                  <th className="pb-3 font-medium">Sonraki Bakım</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 last:border-b-0 align-top">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {equipmentNameMap.get(record.equipment_id) ?? "Bilinmeyen cihaz"}
                    </td>
                    <td className="py-3 pr-4">{record.maintenance_type}</td>
                    <td className="py-3 pr-4">{toDisplayDate(record.maintenance_date)}</td>
                    <td className="py-3 pr-4">{record.performed_by || "-"}</td>
                    <td className="py-3 pr-4 max-w-xs">{record.description || "-"}</td>
                    <td className="py-3 pr-4">{formatCurrency(record.cost)}</td>
                    <td className="py-3">{toDisplayDate(record.next_maintenance_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
