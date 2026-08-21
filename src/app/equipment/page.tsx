export default function EquipmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Equipment
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Equipment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Laboratuvar cihazları ve kullanım durumları izleniyor.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Santrifüj 01</h2>
          <p className="mt-2 text-sm text-slate-600">Durum: Aktif</p>
          <p className="mt-1 text-sm text-slate-600">Son bakım: 12 Haziran 2026</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Mikroskop A</h2>
          <p className="mt-2 text-sm text-slate-600">Durum: Hazır</p>
          <p className="mt-1 text-sm text-slate-600">Son kalibrasyon: 7 Temmuz 2026</p>
        </div>
      </div>
    </div>
  );
}
