import Link from "next/link";
import EquipmentNewItemModal from "@/components/EquipmentNewItemModal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LabTrack | Equipment",
};

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

const statusMap: Record<string, string> = {
  ACTIVE: "Aktif",
  MAINTENANCE: "Bakımda",
  OUT_OF_SERVICE: "Kullanım Dışı",
};

const statusBadgeMap: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
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

const getMaintenanceStatus = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  const today = new Date();
  const diffInDays = Math.ceil(
    (targetDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffInDays < 0) {
    return "Bakım Gecikti";
  }

  if (diffInDays <= 30) {
    return "Bakım Yaklaşıyor";
  }

  return null;
};

export default async function EquipmentPage() {
  let equipmentItems: EquipmentRecord[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    equipmentItems = (data ?? []) as EquipmentRecord[];
  } catch (error) {
    console.error("Failed to load equipment items", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Cihaz verileri yüklenemedi.</p>
        <p className="mt-1">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  if (equipmentItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Equipment
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Equipment</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Laboratuvar cihazlarını ve bakım durumlarını yönetin.
            </p>
          </div>

          <EquipmentNewItemModal />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Kayıtlı cihaz bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Equipment
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Equipment</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Laboratuvar cihazlarını ve bakım durumlarını yönetin.
          </p>
        </div>

        <EquipmentNewItemModal />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {equipmentItems.map((item) => {
          const status = item.status ?? "ACTIVE";
          const maintenanceWarning = getMaintenanceStatus(item.next_maintenance_date);

          return (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.category ?? "Kategori"}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{item.name ?? "Bilinmeyen cihaz"}</h2>
                </div>
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    statusBadgeMap[status] ?? "bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  {statusMap[status] ?? status}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Üretici</dt>
                  <dd className="mt-1 font-medium text-slate-900">{item.manufacturer ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Model</dt>
                  <dd className="mt-1 font-medium text-slate-900">{item.model ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Seri Numarası</dt>
                  <dd className="mt-1 font-medium text-slate-900">{item.serial_number ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Konum</dt>
                  <dd className="mt-1 font-medium text-slate-900">{item.location ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Son Bakım</dt>
                  <dd className="mt-1 font-medium text-slate-900">{toDisplayDate(item.last_maintenance_date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sonraki Bakım</dt>
                  <dd className="mt-1 font-medium text-slate-900">{toDisplayDate(item.next_maintenance_date)}</dd>
                </div>
              </dl>

              {maintenanceWarning ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                  {maintenanceWarning}
                </div>
              ) : null}

              <div className="mt-5 flex items-center justify-end">
                <Link
                  href={`/equipment/${item.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Detay
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
