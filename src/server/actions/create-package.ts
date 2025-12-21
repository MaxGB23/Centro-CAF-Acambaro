"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createPackageSchema = z.object({
  clientId: z.string().uuid(),
  packageType: z.enum(["S1", "S5", "S10", "S15", "S20"]),
  totalPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  startDate: z.coerce.date(),
});

export async function createPackage(data: z.infer<typeof createPackageSchema>) {
  const result = createPackageSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    // Primero, marcar todos los paquetes activos existentes como "Terminado"
    await prisma.clientPackage.updateMany({
      where: {
        clientId: result.data.clientId,
        status: "Activo",
      },
      data: {
        status: "Terminado",
      },
    });

    // Ahora crear el nuevo paquete con estatus "Activo"
    const newPackage = await prisma.clientPackage.create({
      data: {
        clientId: result.data.clientId,
        packageType: result.data.packageType,
        totalPrice: result.data.totalPrice,
        startDate: result.data.startDate,
        status: "Activo", // Default status
      },
    });

    revalidatePath(`/dashboard/cliente/${result.data.clientId}`);
    revalidatePath(`/dashboard`);
    return { success: true, package: newPackage };
  } catch (error) {
    console.error("Error creating package:", error);
    return { error: "Error al crear el paquete" };
  }
}
