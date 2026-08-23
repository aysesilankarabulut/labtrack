"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MaintenanceCreateResult = {
  success: boolean;
  message: string;
};

const allowedMaintenanceTypes = [
  "Periyodik Bakım",
  "Kalibrasyon",
  "Onarım",
  "Parça Değişimi",
  "Temizlik / Kontrol",
  "Diğer",
];

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

export async function createMaintenanceRecord(formData: FormData): Promise<MaintenanceCreateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Bakım kaydı oluşturulurken bir hata oluştu.",
    };
  }

  const equipmentId = String(formData.get("equipment_id") ?? "").trim();
  const maintenanceType = String(formData.get("maintenance_type") ?? "").trim();
  const maintenanceDate = String(formData.get("maintenance_date") ?? "").trim();
  const performedBy = String(formData.get("performed_by") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawCost = formData.get("cost");
  const nextMaintenanceDate = normalizeOptionalDate(formData.get("next_maintenance_date"));

  if (!equipmentId) {
    return { success: false, message: "Cihaz alanı zorunludur." };
  }

  if (!maintenanceType) {
    return { success: false, message: "Bakım türü zorunludur." };
  }

  if (!allowedMaintenanceTypes.includes(maintenanceType)) {
    return { success: false, message: "Bakım türü geçersiz." };
  }

  if (!maintenanceDate) {
    return { success: false, message: "Bakım tarihi zorunludur." };
  }

  let parsedCost: number | null = null;

  if (rawCost !== null && rawCost !== undefined && String(rawCost).trim() !== "") {
    const numericCost = Number(String(rawCost));

    if (!Number.isFinite(numericCost) || numericCost < 0) {
      return { success: false, message: "Maliyet negatif olamaz." };
    }

    parsedCost = numericCost;
  }

  if (nextMaintenanceDate) {
    const nextDate = new Date(nextMaintenanceDate);
    const maintenanceDateValue = new Date(maintenanceDate);

    if (Number.isNaN(nextDate.getTime()) || Number.isNaN(maintenanceDateValue.getTime())) {
      return { success: false, message: "Tarih alanları geçersiz." };
    }

    if (nextDate.getTime() < maintenanceDateValue.getTime()) {
      return {
        success: false,
        message: "Sonraki bakım tarihi bakım tarihinden önce olamaz.",
      };
    }
  }

  try {
    const { error } = await supabase.rpc("record_equipment_maintenance", {
      p_equipment_id: equipmentId,
      p_maintenance_type: maintenanceType,
      p_maintenance_date: maintenanceDate,
      p_performed_by: performedBy || null,
      p_description: description || null,
      p_cost: parsedCost,
      p_next_maintenance_date: nextMaintenanceDate,
    });

    if (error) {
      console.error("Failed to record equipment maintenance", error);
      return {
        success: false,
        message: "Bakım kaydı oluşturulurken bir hata oluştu.",
      };
    }

    revalidatePath("/maintenance");
    revalidatePath("/equipment");
    revalidatePath("/");
    revalidatePath(`/equipment/${equipmentId}`);

    return {
      success: true,
      message: "Bakım kaydı başarıyla oluşturuldu.",
    };
  } catch (error) {
    console.error("Failed to record equipment maintenance", error);
    return {
      success: false,
      message: "Bakım kaydı oluşturulurken bir hata oluştu.",
    };
  }
}
