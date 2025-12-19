"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const deletePackageSchema = z.object({
  packageId: z.string().uuid(),
});

export async function deletePackage(data: z.infer<typeof deletePackageSchema>) {
  const result = deletePackageSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { packageId } = result.data;

    // Get client ID before deleting for revalidation
    const clientPackage = await prisma.clientPackage.findUnique({
      where: { id: packageId },
      select: { clientId: true },
    });

    if (!clientPackage) {
      return { error: "Paquete no encontrado" };
    }

    await prisma.clientPackage.delete({
      where: { id: packageId },
    });

    revalidatePath(`/dashboard/cliente/${clientPackage.clientId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting package:", error);
    return { error: "Error al eliminar el paquete" };
  }
}
