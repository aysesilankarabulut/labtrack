import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LabTrack",
};

type InventorySummary = {
  id: string;
  name: string | null;
  current_stock: number | string | null;
  minimum_stock: number | string | null;
};

type EquipmentSummary = {
  id: string;
  name: string | null;
  status: string | null;
  next_maintenance_date: string | null;
};

type InventoryBatchSummary = {
  id: string;
  item_id: string;
  lot_number: string | null;
  expiry_date: string | null;
};

type StockMovementSummary = {
  id: string;
  item_id: string | null;
  movement_type: string | null;
  quantity: number | string | null;
  note: string | null;
  created_at: string | null;
};

type MaintenanceSummary = {
  id: string;
  equipment_id: string;
  maintenance_type: string | null;
  description: string | null;
  maintenance_date: string | null;
  created_at: string | null;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  sortValue: number;
  tone: string;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default async function HomePage() {
  let totalProducts = 0;
  let criticalStock = 0;
  let activeEquipment = 0;
  let maintenanceRequired = 0;
  let expiringLots = 0;
  let expiredLots = 0;
  let alerts: Array<{
    title: string;
    description: string;
    tag: string;
    tone: string;
    tagClassName: string;
  }> = [];
  let recentActivities: ActivityItem[] = [];

  try {
    const supabase = await createClient();
    const [inventoryResponse, inventoryBatchResponse, equipmentResponse, movementsResponse, maintenanceResponse] = await Promise.all([
      supabase.from("inventory_items").select("id, name, current_stock, minimum_stock"),
      supabase.from("inventory_batches").select("id, item_id, lot_number, expiry_date"),
      supabase.from("equipment").select("id, name, status, next_maintenance_date"),
      supabase
        .from("stock_movements")
        .select("id, item_id, movement_type, quantity, note, created_at")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("maintenance_records")
        .select("id, equipment_id, maintenance_type, description, maintenance_date, created_at")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    if (inventoryResponse.error) {
      throw inventoryResponse.error;
    }

    if (inventoryBatchResponse.error) {
      throw inventoryBatchResponse.error;
    }

    if (equipmentResponse.error) {
      throw equipmentResponse.error;
    }

    if (movementsResponse.error) {
      throw movementsResponse.error;
    }

    if (maintenanceResponse.error) {
      throw maintenanceResponse.error;
    }

    const inventoryItems = (inventoryResponse.data ?? []) as InventorySummary[];
    const inventoryBatches = (inventoryBatchResponse.data ?? []) as InventoryBatchSummary[];
    const equipmentItems = (equipmentResponse.data ?? []) as EquipmentSummary[];
    const movementItems = (movementsResponse.data ?? []) as StockMovementSummary[];
    const maintenanceItems = (maintenanceResponse.data ?? []) as MaintenanceSummary[];

    totalProducts = inventoryItems.length;
    criticalStock = inventoryItems.filter(
      (item) => toNumber(item.current_stock) <= toNumber(item.minimum_stock),
    ).length;

    const itemLookup = new Map(
      inventoryItems.map((item) => [item.id, item.name ?? "Bilinmeyen ürün"]),
    );
    const equipmentLookup = new Map(
      equipmentItems.map((item) => [item.id, item.name ?? "Bilinmeyen cihaz"]),
    );

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    activeEquipment = equipmentItems.filter((item) => item.status === "ACTIVE").length;
    maintenanceRequired = equipmentItems.filter((item) => {
      if (item.status === "MAINTENANCE") {
        return true;
      }

      if (!item.next_maintenance_date) {
        return false;
      }

      const nextMaintenanceDate = new Date(item.next_maintenance_date);
      return !Number.isNaN(nextMaintenanceDate.getTime())
        && nextMaintenanceDate.getTime() <= todayStart.getTime();
    }).length;

    expiringLots = inventoryBatches.filter((batch) => {
      if (!batch.expiry_date) {
        return false;
      }

      const expiryDate = new Date(batch.expiry_date);
      if (Number.isNaN(expiryDate.getTime())) {
        return false;
      }

      const diffInDays = Math.ceil(
        (expiryDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      return diffInDays >= 0 && diffInDays <= 30;
    }).length;

    expiredLots = inventoryBatches.filter((batch) => {
      if (!batch.expiry_date) {
        return false;
      }

      const expiryDate = new Date(batch.expiry_date);
      return !Number.isNaN(expiryDate.getTime()) && expiryDate.getTime() < todayStart.getTime();
    }).length;

    alerts = [
      ...inventoryItems
        .filter((item) => toNumber(item.current_stock) <= toNumber(item.minimum_stock))
        .map((item) => ({
          title: item.name ?? "Bilinmeyen ürün",
          description: "Kritik stok seviyesinin altında.",
          tag: "Kritik",
          tone: "bg-red-50 text-red-700 ring-red-100",
          tagClassName: "bg-red-100 text-red-700",
        })),
      ...inventoryBatches
        .filter((batch) => batch.expiry_date)
        .map((batch) => {
          const expiryDate = new Date(batch.expiry_date as string);
          const itemName = itemLookup.get(batch.item_id) ?? "Bilinmeyen ürün";

          if (Number.isNaN(expiryDate.getTime())) {
            return null;
          }

          const diffInDays = Math.ceil(
            (expiryDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (expiryDate.getTime() < todayStart.getTime()) {
            return {
              title: itemName,
              description: `${batch.lot_number ?? "Lot"} süresi dolmuş.`,
              tag: "Süresi Dolmuş",
              tone: "bg-red-50 text-red-700 ring-red-100",
              tagClassName: "bg-red-100 text-red-700",
            };
          }

          if (diffInDays <= 30) {
            return {
              title: itemName,
              description: `${batch.lot_number ?? "Lot"} / Son kullanma tarihine ${diffInDays} gün kaldı.`,
              tag: "SKT Yaklaşıyor",
              tone: "bg-amber-50 text-amber-700 ring-amber-100",
              tagClassName: "bg-amber-100 text-amber-700",
            };
          }

          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
      ...equipmentItems
        .filter((item) => item.next_maintenance_date)
        .map((item) => {
          const nextMaintenanceDate = new Date(item.next_maintenance_date as string);

          if (Number.isNaN(nextMaintenanceDate.getTime())) {
            return null;
          }

          const diffInDays = Math.ceil(
            (nextMaintenanceDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (nextMaintenanceDate.getTime() < todayStart.getTime()) {
            return {
              title: item.name ?? "Bilinmeyen cihaz",
              description: "Bakım tarihi geçti.",
              tag: "Bakım Gecikti",
              tone: "bg-red-50 text-red-700 ring-red-100",
              tagClassName: "bg-red-100 text-red-700",
            };
          }

          if (diffInDays <= 30) {
            return {
              title: item.name ?? "Bilinmeyen cihaz",
              description: `Bakım tarihine ${diffInDays} gün kaldı.`,
              tag: "Bakım Yaklaşıyor",
              tone: "bg-blue-50 text-blue-700 ring-blue-100",
              tagClassName: "bg-blue-100 text-blue-700",
            };
          }

          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    ];

    recentActivities = [
      ...movementItems.map((movement) => {
        const itemName = movement.item_id ? itemLookup.get(movement.item_id) ?? "Bilinmeyen ürün" : "Bilinmeyen ürün";
        const isIncoming = movement.movement_type === "IN";
        const quantity = toNumber(movement.quantity);
        const rawTimestamp = movement.created_at ? new Date(movement.created_at).getTime() : 0;

        return {
          id: movement.id,
          title: itemName,
          description: `${isIncoming ? "Stok girişi" : "Stok çıkışı"} · ${isIncoming ? "+" : "-"}${quantity}${movement.note ? ` · ${movement.note}` : ""}`.trim(),
          timestamp: formatDateTime(movement.created_at),
          sortValue: rawTimestamp,
          tone: isIncoming ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
        } satisfies ActivityItem;
      }),
      ...maintenanceItems.map((record) => {
        const rawTimestamp = record.maintenance_date
          ? new Date(record.maintenance_date).getTime()
          : (record.created_at ? new Date(record.created_at).getTime() : 0);

        return {
          id: record.id,
          title: equipmentLookup.get(record.equipment_id) ?? "Bilinmeyen cihaz",
          description: `${record.maintenance_type ?? "Bakım"}${record.description ? ` · ${record.description}` : ""}`,
          timestamp: formatDateTime(record.maintenance_date ?? record.created_at),
          sortValue: rawTimestamp,
          tone: "bg-violet-50 text-violet-700",
        } satisfies ActivityItem;
      }),
    ].sort((left, right) => right.sortValue - left.sortValue).slice(0, 5);
  } catch (error) {
    console.error("Failed to load dashboard summary", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Veriler yüklenemedi.</p>
        <p className="mt-1">Dashboard bilgileri şu anda erişilemez.</p>
      </div>
    );
  }

  const stats = [
    { label: "Toplam Ürün", value: totalProducts },
    { label: "Kritik Stok", value: criticalStock },
    { label: "Aktif Cihaz", value: activeEquipment },
    { label: "Bakım Gerekiyor", value: maintenanceRequired },
    { label: "SKT Yaklaşan", value: expiringLots },
    { label: "Süresi Dolmuş Lot", value: expiredLots },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Laboratory Management
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Laboratuvar stoklarını ve ekipman durumlarını takip edin.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Güncel Uyarılar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Kontrol edilmesi gereken laboratuvar kayıtları.
            </p>
          </div>

          <div className="space-y-3">
            {alerts.length > 0 ? alerts.map((alert) => (
              <div
                key={`${alert.title}-${alert.tag}`}
                className={[
                  "flex flex-col gap-3 rounded-xl p-4 ring-1 sm:flex-row sm:items-center sm:justify-between",
                  alert.tone,
                ].join(" ")}
              >
                <div>
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                </div>

                <span
                  className={[
                    "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                    alert.tagClassName,
                  ].join(" ")}
                >
                  {alert.tag}
                </span>
              </div>
            )) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Şu anda izlenecek uyarı bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Son Aktiviteler</h2>
            <p className="mt-1 text-sm text-slate-500">En son stok ve bakım hareketleri.</p>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{activity.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className={[
                    "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    activity.tone,
                  ].join(" ")}>
                    Aktif
                  </span>
                  <time className="text-xs text-slate-500">{activity.timestamp}</time>
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Henüz aktif kayıt yok.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}