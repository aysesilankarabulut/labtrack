export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Maintenance
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Maintenance</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bakım planlamaları ve cihaz kontrolleri yönetiliyor.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Bekleyen İşler</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            1 görev
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="font-medium text-slate-900">Santrifüj 01</p>
            <p className="mt-1 text-sm text-slate-600">Periyodik bakım zamanı geldi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
