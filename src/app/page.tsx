import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

export default async function HomePage() {
  let totalProducts = 0;
  let criticalStock = 0;
  let activeEquipment = 0;
  let maintenanceRequired = 0;
  let alerts: Array<{
    title: string;
    description: string;
    tag: string;
    tone: string;
    tagClassName: string;
  }> = [];

  try {
    const supabase = await createClient();
    const [inventoryResponse, inventoryBatchResponse, equipmentResponse] = await Promise.all([
      supabase.from("inventory_items").select("id, name, current_stock, minimum_stock"),
      supabase.from("inventory_batches").select("id, item_id, lot_number, expiry_date"),
      supabase.from("equipment").select("id, name, status, next_maintenance_date"),
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

    const inventoryItems = (inventoryResponse.data ?? []) as InventorySummary[];
    const inventoryBatches = (inventoryBatchResponse.data ?? []) as InventoryBatchSummary[];
    const equipmentItems = (equipmentResponse.data ?? []) as EquipmentSummary[];

    totalProducts = inventoryItems.length;
    criticalStock = inventoryItems.filter(
      (item) => toNumber(item.current_stock) <= toNumber(item.minimum_stock),
    ).length;

    const itemLookup = new Map(
      inventoryItems.map((item) => [item.id, item.name ?? "Bilinmeyen ürün"]),
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

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">Güncel Uyarılar</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kontrol edilmesi gereken laboratuvar kayıtları.
          </p>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
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
          ))}
        </div>
      </section>
    </div>
  );
}