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

export type StockMovementType = "IN" | "OUT";

export type StockMovementResult = {
  success: boolean;
  message: string;
};

export type InventoryBatchCreateResult = {
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
    revalidatePath("/");

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

export async function applyStockMovement(
  formData: FormData,
): Promise<StockMovementResult> {
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

  const itemId = String(formData.get("item_id") ?? "").trim();
  const movementType = String(formData.get("movement_type") ?? "").trim().toUpperCase();
  const quantity = toNumber(formData.get("quantity"));
  const note = String(formData.get("note") ?? "").trim();

  if (!itemId) {
    return {
      success: false,
      message: "Ürün seçimi geçersiz.",
    };
  }

  if (movementType !== "IN" && movementType !== "OUT") {
    return {
      success: false,
      message: "İşlem türü geçersiz.",
    };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      success: false,
      message: "Miktar 0'dan büyük olmalıdır.",
    };
  }

  try {
    const { error } = await supabase.rpc("apply_stock_movement", {
      p_item_id: itemId,
      p_movement_type: movementType,
      p_quantity: quantity,
      p_note: note.length > 0 ? note : null,
    });

    if (error) {
      const normalizedError = error.message.toLowerCase();

      if (
        normalizedError.includes("yetersiz") ||
        normalizedError.includes("insufficient") ||
        normalizedError.includes("stok")
      ) {
        return {
          success: false,
          message: "Yetersiz stok.",
        };
      }

      console.error("Failed to apply stock movement", error);
      return {
        success: false,
        message: "Ürün eklenirken bir hata oluştu.",
      };
    }

    revalidatePath("/inventory");
    revalidatePath("/");

    return {
      success: true,
      message: "Stok başarıyla güncellendi.",
    };
  } catch (error) {
    console.error("Failed to apply stock movement", error);
    return {
      success: false,
      message: "Ürün eklenirken bir hata oluştu.",
    };
  }
}

export async function addInventoryBatch(
  formData: FormData,
): Promise<InventoryBatchCreateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Lot eklenirken bir hata oluştu.",
    };
  }

  const itemId = String(formData.get("item_id") ?? "").trim();
  const lotNumber = String(formData.get("lot_number") ?? "").trim();
  const rawQuantity = formData.get("quantity");
  const receivedAt = String(formData.get("received_at") ?? "").trim();
  const expiryDate = String(formData.get("expiry_date") ?? "").trim();

  if (!itemId) {
    return {
      success: false,
      message: "Ürün seçimi geçersiz.",
    };
  }

  if (!lotNumber) {
    return {
      success: false,
      message: "Lot numarası zorunludur.",
    };
  }

  const quantity = Number(rawQuantity ?? NaN);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      success: false,
      message: "Miktar 0'dan büyük olmalıdır.",
    };
  }

  if (!receivedAt) {
    return {
      success: false,
      message: "Giriş tarihi zorunludur.",
    };
  }

  if (!expiryDate) {
    return {
      success: false,
      message: "Son kullanma tarihi zorunludur.",
    };
  }

  const expiryDateValue = new Date(expiryDate);
  const receivedDateValue = new Date(receivedAt);

  if (Number.isNaN(expiryDateValue.getTime()) || Number.isNaN(receivedDateValue.getTime())) {
    return {
      success: false,
      message: "Tarih alanları geçersiz.",
    };
  }

  if (expiryDateValue.getTime() < receivedDateValue.getTime()) {
    return {
      success: false,
      message: "Son kullanma tarihi giriş tarihinden önce olamaz.",
    };
  }

  try {
    const { data: inventoryItem, error: inventoryItemError } = await supabase
      .from("inventory_items")
      .select("id")
      .eq("id", itemId)
      .maybeSingle();

    if (inventoryItemError) {
      console.error("Inventory item lookup error for batch insert", inventoryItemError);
      return {
        success: false,
        message: "Lot eklenirken bir hata oluştu.",
      };
    }

    if (!inventoryItem) {
      return {
        success: false,
        message: "Lot eklenirken bir hata oluştu.",
      };
    }

    const { error } = await supabase.from("inventory_batches").insert({
      item_id: itemId,
      lot_number: lotNumber,
      quantity,
      expiry_date: expiryDate,
      received_at: receivedAt,
    });

    if (error) {
      console.error("Inventory batch insert error:", error);
      return {
        success: false,
        message: "Lot eklenirken bir hata oluştu.",
      };
    }

    revalidatePath("/inventory");
    revalidatePath("/");

    return {
      success: true,
      message: "Lot başarıyla eklendi.",
    };
  } catch (error) {
    console.error("Failed to add inventory batch", error);
    return {
      success: false,
      message: "Lot eklenirken bir hata oluştu.",
    };
  }
}
