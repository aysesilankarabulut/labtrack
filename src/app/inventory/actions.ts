"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const allowedCategories = [
  "Sarf Malzeme",
  "Reaktif",
  "Kimyasal",
  "Diğer",
] as const;

const allowedUnits = ["adet", "şişe", "litre", "ml", "kutu", "paket", "rulo", "Diğer"] as const;

export type InventoryCreateResult = {
  success: boolean;
  message: string;
};

const toNumber = (value: FormDataEntryValue | null) => {
  if (value === null || value === undefined) {
    return Number.NaN;
  }

  const stringValue = String(value).trim();

  if (stringValue.length === 0) {
    return Number.NaN;
  }

  const parsed = Number(stringValue.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export async function createInventoryItem(
  formData: FormData,
): Promise<InventoryCreateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Ürün eklenirken bir hata oluştu.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const storageLocation = String(formData.get("storage_location") ?? "").trim();
  const currentStockRaw = toNumber(formData.get("current_stock"));
  const minimumStockRaw = toNumber(formData.get("minimum_stock"));

  if (!name) {
    return { success: false, message: "Ürün adı boş olamaz." };
  }

  if (!category || !allowedCategories.includes(category as (typeof allowedCategories)[number])) {
    return { success: false, message: "Kategori boş olamaz." };
  }

  if (!unit || !allowedUnits.includes(unit as (typeof allowedUnits)[number])) {
    return { success: false, message: "Birim boş olamaz." };
  }

  if (!Number.isFinite(currentStockRaw) || currentStockRaw < 0) {
    return { success: false, message: "Mevcut stok negatif olamaz." };
  }

  if (!Number.isFinite(minimumStockRaw) || minimumStockRaw < 0) {
    return { success: false, message: "Minimum stok negatif olamaz." };
  }

  if (!storageLocation) {
    return { success: false, message: "Saklama konumu boş olamaz." };
  }

  try {
    const { error } = await supabase.from("inventory_items").insert({
      name,
      category,
      unit,
      current_stock: currentStockRaw,
      minimum_stock: minimumStockRaw,
      storage_location: storageLocation,
    });

    if (error) {
      console.error("Failed to add inventory item", error);
      return {
        success: false,
        message: "Ürün eklenirken bir hata oluştu.",
      };
    }

    revalidatePath("/inventory");

    return {
      success: true,
      message: "Ürün başarıyla eklendi.",
    };
  } catch (error) {
    console.error("Failed to add inventory item", error);
    return {
      success: false,
      message: "Ürün eklenirken bir hata oluştu.",
    };
  }
}
