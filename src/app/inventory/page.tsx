import InventoryNewItemModal from "@/components/InventoryNewItemModal";
import InventoryStockMovementModal from "@/components/InventoryStockMovementModal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type InventoryRecord = {
  id: string;
  name: string | null;
  category: string | null;
  unit: string | null;
  current_stock: number | string | null;
  minimum_stock: number | string | null;
  storage_location: string | null;
};

type StockMovementRecord = {
  id: string;
  created_at: string | null;
  item_id: string | null;
  movement_type: string | null;
  quantity: number | string | null;
  note: string | null;
};

type RecentMovementRecord = StockMovementRecord & {
  item_name: string | null;
  item_unit: string | null;
};

type InventoryPageProps = {
  searchParams?: Promise<{ q?: string | string[] | undefined }> | { q?: string | string[] | undefined };
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  let inventoryItems: InventoryRecord[] = [];
  let recentMovements: RecentMovementRecord[] = [];

  try {
    const supabase = await createClient();
    const [inventoryResponse, movementsResponse] = await Promise.all([
      supabase
        .from("inventory_items")
        .select("id, name, category, unit, current_stock, minimum_stock, storage_location")
        .order("name", { ascending: true }),
      supabase
        .from("stock_movements")
        .select("id, created_at, item_id, movement_type, quantity, note")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (inventoryResponse.error) {
      throw inventoryResponse.error;
    }

    if (movementsResponse.error) {
      throw movementsResponse.error;
    }

    inventoryItems = (inventoryResponse.data ?? []) as InventoryRecord[];
    const itemLookup = new Map(
      inventoryItems.map((item) => [item.id, { name: item.name ?? "Bilinmeyen ürün", unit: item.unit ?? "adet" }]),
    );

    const movementRows = (movementsResponse.data ?? []) as StockMovementRecord[];
    recentMovements = movementRows
      .map((movement) => {
        const itemInfo = movement.item_id ? itemLookup.get(movement.item_id) : null;

        return {
          ...movement,
          item_name: itemInfo?.name ?? "Bilinmeyen ürün",
          item_unit: itemInfo?.unit ?? "adet",
        };
      })
      .filter((movement) => movement.item_name !== null);
  } catch (error) {
    console.error("Failed to load inventory items", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Stok verileri yüklenemedi.</p>
        <p className="mt-1">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawQuery = Array.isArray(resolvedSearchParams.q)
    ? resolvedSearchParams.q[0]
    : resolvedSearchParams.q ?? "";
  const query = rawQuery.trim().toLowerCase();

  const filteredItems = query
    ? inventoryItems.filter((item) => {
        const name = item.name ?? "";
        const category = item.category ?? "";
        const location = item.storage_location ?? "";

        return [name, category, location].some((value) =>
          value.toLowerCase().includes(query),
        );
      })
    : inventoryItems;

  if (inventoryItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Inventory
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Inventory</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Laboratuvar sarf malzemeleri ve reaktif stoklarını yönetin.
            </p>
          </div>

          <InventoryNewItemModal />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Henüz stok kaydı bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Inventory
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Laboratuvar sarf malzemeleri ve reaktif stoklarını yönetin.
          </p>
        </div>

        <InventoryNewItemModal />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form method="get" action="/inventory" className="block">
          <label className="block">
            <span className="sr-only">Ürün ara</span>
            <input
              type="text"
              name="q"
              defaultValue={rawQuery}
              placeholder="Ürün ara..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </label>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Ürün
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Kategori
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Stok
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Minimum
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Konum
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Durum
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const currentStock = toNumber(item.current_stock);
                  const minimumStock = toNumber(item.minimum_stock);
                  const isCritical = currentStock <= minimumStock;

                  return (
                    <tr key={item.id} className="align-top hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name ?? "Bilinmeyen ürün"}</p>
                          <p className="text-sm text-slate-500">{item.unit ?? "adet"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.category ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {currentStock} {item.unit ?? ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {minimumStock} {item.unit ?? ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item.storage_location ?? "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                            isCritical
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          {isCritical ? "Kritik Stok" : "Normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <InventoryStockMovementModal
                            item={{
                              id: item.id,
                              name: item.name,
                              current_stock: item.current_stock,
                              unit: item.unit,
                            }}
                            movementType="IN"
                          />
                          <InventoryStockMovementModal
                            item={{
                              id: item.id,
                              name: item.name,
                              current_stock: item.current_stock,
                              unit: item.unit,
                            }}
                            movementType="OUT"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-600">
                    Arama kriterlerine uygun ürün bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Toplam ürün sayısı</span>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {inventoryItems.length}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Hareket Geçmişi</h2>
          </div>

          {recentMovements.length > 0 ? (
            <div className="space-y-3">
              {recentMovements.map((movement) => {
                const quantity = toNumber(movement.quantity);
                const isIn = movement.movement_type === "IN";
                const timestamp = movement.created_at
                  ? new Date(movement.created_at).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "-";

                return (
                  <div
                    key={movement.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{movement.item_name}</p>
                      <p className="text-xs text-slate-500">{timestamp}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          isIn
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        ].join(" ")}
                      >
                        {isIn ? "IN" : "OUT"}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {isIn ? "+" : "-"}
                        {quantity} {movement.item_unit}
                      </p>
                      <p className="text-xs text-slate-500">{movement.note || "-"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Henüz stok hareketi kaydı yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
