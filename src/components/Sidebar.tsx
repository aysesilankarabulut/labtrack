"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/equipment", label: "Equipment" },
  { href: "/maintenance", label: "Maintenance" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-full bg-slate-900 text-slate-100 lg:sticky lg:top-0 lg:h-screen lg:w-72">
      <div className="flex h-full flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="mb-10 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">LabTrack</h1>
            <p className="text-sm text-slate-400">Laboratory Operations</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-slate-800 text-white shadow-inner ring-1 ring-slate-600"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Laboratory Management System
          </p>
          <p className="mt-3 text-sm font-medium text-slate-300">LabTrack v0.1</p>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
}
