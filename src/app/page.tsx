import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type InventorySummary = {
  current_stock: number | string | null;
  minimum_stock: number | string | null;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

const alerts = [
  {
    title: "Lamel",
    description: "Kritik stok seviyesinin altında",
    tag: "Kritik",
    tone: "bg-red-50 text-red-700 ring-red-100",
    tagClassName: "bg-red-100 text-red-700",
  },
  {
    title: "Eozin",
    description: "Minimum stok seviyesine yaklaştı",
    tag: "Düşük Stok",
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    tagClassName: "bg-amber-100 text-amber-700",
  },
  {
    title: "Santrifüj 01",
    description: "Periyodik bakım zamanı geldi",
    tag: "Bakım",
    tone: "bg-blue-50 text-blue-700 ring-blue-100",
    tagClassName: "bg-blue-100 text-blue-700",
  },
];

export default async function HomePage() {
  let totalProducts = 0;
  let criticalStock = 0;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .select("current_stock, minimum_stock");

    if (error) {
      throw error;
    }

    const inventoryItems = (data ?? []) as InventorySummary[];
    totalProducts = inventoryItems.length;
    criticalStock = inventoryItems.filter(
      (item) => toNumber(item.current_stock) <= toNumber(item.minimum_stock),
    ).length;
  } catch (error) {
    console.error("Failed to load dashboard inventory summary", error);

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
    { label: "Aktif Cihaz", value: 2 },
    { label: "Bakım Gerekiyor", value: 1 },
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
              key={alert.title}
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