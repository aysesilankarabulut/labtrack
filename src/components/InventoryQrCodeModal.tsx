"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type InventoryQrCodeModalProps = {
  item: {
    id: string;
    name: string | null;
    unit?: string | null;
  };
};

const buildSafeFileName = (value: string | null) => {
  const base = (value ?? "inventory-item").trim();
  const normalized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "inventory-item";
};

export default function InventoryQrCodeModal({ item }: InventoryQrCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) {
      return;
    }

    const targetUrl = new URL(`/inventory/${item.id}`, window.location.origin).toString();

    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: 220,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      },
      (error) => {
        if (error) {
          console.error("Failed to generate QR code", error);
        }
      },
    );
  }, [isOpen, item.id]);

  const handleDownload = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const link = document.createElement("a");
    link.download = `${buildSafeFileName(item.name)}-qr-code.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
      >
        QR Kod
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Inventory QR
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{item.name ?? "Ürün"}</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
                aria-label="QR kod penceresini kapat"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <canvas ref={canvasRef} className="h-52 w-52 rounded-xl bg-white p-2 shadow-inner" />
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              {item.unit ? `${item.unit} /` : "Ürün"} detay sayfasına yönlendirir.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                QR Kodu İndir
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
