"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createSessionSchema = z.object({
  packageId: z.string().uuid(),
  sessionDate: z.coerce.date(),
  status: z.enum(["Pendiente", "Completada", "Cancelada"]),
  notes: z.string().optional(),
});

export async function createSession(data: z.infer<typeof createSessionSchema>) {
  const result = createSessionSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { packageId, sessionDate, status } = result.data;

    // Get current session count to assign next number
    const currentSessionsCount = await prisma.sessionRecord.count({
      where: { clientPackageId: packageId },
    });

    const session = await prisma.sessionRecord.create({
      data: {
        clientPackageId: packageId,
        sessionNumber: currentSessionsCount + 1,
        sessionDate,
        status,
      },
    });

    // We need to fetch the client ID to revalidate the path
    const clientPackage = await prisma.clientPackage.findUnique({
      where: { id: packageId },
      select: { clientId: true },
    });

    if (clientPackage) {
      revalidatePath(`/dashboard/cliente/${clientPackage.clientId}`);
    }

    return { success: true, session };
  } catch (error) {
    console.error("Error creating session:", error);
    return { error: "Error al registrar la sesión" };
  }
}
