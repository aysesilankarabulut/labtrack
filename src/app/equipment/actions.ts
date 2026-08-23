"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EquipmentStatus = "ACTIVE" | "MAINTENANCE" | "OUT_OF_SERVICE";

export type EquipmentCreateResult = {
  success: boolean;
  message: string;
};

const normalizeOptionalDate = (value: FormDataEntryValue | null) => {
  if (value === null || value === undefined) {
    return null;
  }

  const raw = String(value).trim();

  if (raw.length === 0) {
    return null;
  }

  const dateValue = new Date(raw);
  return Number.isNaN(dateValue.getTime()) ? null : raw;
};

export async function createEquipmentItem(formData: FormData): Promise<EquipmentCreateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Cihaz eklenirken bir hata oluştu.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const manufacturer = String(formData.get("manufacturer") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const serialNumber = String(formData.get("serial_number") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const status = String(formData.get("status") ?? "ACTIVE").trim().toUpperCase();
  const lastMaintenanceDate = normalizeOptionalDate(formData.get("last_maintenance_date"));
  const nextMaintenanceDate = normalizeOptionalDate(formData.get("next_maintenance_date"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    return { success: false, message: "Cihaz adı boş olamaz." };
  }

  if (!category) {
    return { success: false, message: "Kategori boş olamaz." };
  }

  if (!location) {
    return { success: false, message: "Konum boş olamaz." };
  }

  if (status !== "ACTIVE" && status !== "MAINTENANCE" && status !== "OUT_OF_SERVICE") {
    return { success: false, message: "Durum geçersiz." };
  }

  if (nextMaintenanceDate && lastMaintenanceDate) {
    const nextDate = new Date(nextMaintenanceDate);
    const lastDate = new Date(lastMaintenanceDate);

    if (Number.isNaN(nextDate.getTime()) || Number.isNaN(lastDate.getTime())) {
      return { success: false, message: "Tarih alanları geçersiz." };
    }
  }

  try {
    const { error } = await supabase.from("equipment").insert({
      name,
      category,
      manufacturer: manufacturer || null,
      model: model || null,
      serial_number: serialNumber || null,
      location,
      status: status as EquipmentStatus,
      last_maintenance_date: lastMaintenanceDate,
      next_maintenance_date: nextMaintenanceDate,
      notes: notes || null,
    });

    if (error) {
      console.error("Failed to create equipment item", error);
      return {
        success: false,
        message: "Cihaz eklenirken bir hata oluştu.",
      };
    }

    revalidatePath("/equipment");
    revalidatePath("/");

    return {
      success: true,
      message: "Cihaz başarıyla eklendi.",
    };
  } catch (error) {
    console.error("Failed to create equipment item", error);
    return {
      success: false,
      message: "Cihaz eklenirken bir hata oluştu.",
    };
  }
}
