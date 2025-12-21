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

    // Obtener el paquete para verificar el tipo y las sesiones existentes
    const clientPackage = await prisma.clientPackage.findUnique({
      where: { id: packageId },
      include: {
        sessions: true,
      },
    });

    if (!clientPackage) {
      return { error: "Paquete no encontrado" };
    }

    // Mapeo de tipos de paquete a número máximo de sesiones
    const packageSessionLimits: Record<string, number> = {
      S1: 1,
      S5: 5,
      S10: 10,
      S15: 15,
      S20: 20,
    };

    const maxSessions = packageSessionLimits[clientPackage.packageType];
    const currentSessionsCount = clientPackage.sessions.length;

    // Validar que no se exceda el límite de sesiones
    if (currentSessionsCount >= maxSessions) {
      return { 
        error: `No se pueden agregar más sesiones. El paquete ${clientPackage.packageType} permite un máximo de ${maxSessions} sesión(es).` 
      };
    }

    const session = await prisma.sessionRecord.create({
      data: {
        clientPackageId: packageId,
        sessionNumber: currentSessionsCount + 1,
        sessionDate,
        status,
      },
    });

    revalidatePath(`/dashboard/cliente/${clientPackage.clientId}`);
    revalidatePath("/dashboard");

    return { success: true, session };
  } catch (error) {
    console.error("Error creating session:", error);
    return { error: "Error al registrar la sesión" };
  }
}
