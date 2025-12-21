"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updatePackageSchema = z.object({
  packageId: z.string().uuid(),
  clientId: z.string().uuid(),
  packageType: z.enum(["S1", "S5", "S10", "S15", "S20"]),
  totalPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  status: z.enum(["Activo", "Terminado"]),
});

export async function updatePackage(data: z.infer<typeof updatePackageSchema>) {
  const result = updatePackageSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { packageId, clientId, packageType, totalPrice, status } = result.data;

    // Si el nuevo estatus es "Activo", marcar todos los demás paquetes activos como "Terminado"
    if (status === "Activo") {
      await prisma.clientPackage.updateMany({
        where: {
          clientId: clientId,
          status: "Activo",
          id: { not: packageId }, // Excluir el paquete que estamos actualizando
        },
        data: {
          status: "Terminado",
        },
      }); 
    }

    const updatedPackage = await prisma.clientPackage.update({
      where: { id: packageId },
      data: {
        packageType,
        totalPrice,
        status,
      },
    });

    revalidatePath(`/dashboard/cliente/${clientId}`);
    revalidatePath("/dashboard");

    return { success: true, package: updatedPackage };
  } catch (error) {
    console.error("Error updating package:", error);
    return { error: "Error al actualizar el paquete" };
  }
}
