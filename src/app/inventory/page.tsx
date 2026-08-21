import { createClient } from "@/lib/supabase/server";

type InventoryRecord = {
  id: string;
  name: string | null;
  category: string | null;
  unit: string | null;
  current_stock: number | string | null;
  minimum_stock: number | string | null;
  storage_location: string | null;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

export default async function InventoryPage() {
  let inventoryItems: InventoryRecord[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .select("id, name, category, unit, current_stock, minimum_stock, storage_location")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    inventoryItems = (data ?? []) as InventoryRecord[];
  } catch (error) {
    console.error("Failed to load inventory items", error);

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        <p className="font-semibold">Stok verileri yüklenemedi.</p>
        <p className="mt-1">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

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

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            + Yeni Ürün
          </button>
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

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          + Yeni Ürün
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block">
          <span className="sr-only">Ürün ara</span>
          <input
            type="text"
            placeholder="Ürün ara..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {inventoryItems.map((item) => {
                const currentStock = toNumber(item.current_stock);
                const minimumStock = toNumber(item.minimum_stock);
                const isCritical = currentStock <= minimumStock;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span>Toplam ürün sayısı</span>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {inventoryItems.length}
        </span>
      </div>
    </div>
  );
}
