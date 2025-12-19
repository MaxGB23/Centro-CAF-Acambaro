"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateSessionSchema = z.object({
  sessionId: z.string().uuid(),
  sessionDate: z.coerce.date(),
  status: z.enum(["Pendiente", "Completada", "Cancelada"]),
  clientId: z.string().uuid(),
});

export async function updateSession(data: z.infer<typeof updateSessionSchema>) {
  const result = updateSessionSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { sessionId, sessionDate, status, clientId } = result.data;

    const session = await prisma.sessionRecord.update({
      where: { id: sessionId },
      data: {
        sessionDate,
        status,
      },
    });

    revalidatePath(`/dashboard/cliente/${clientId}`);

    return { success: true, session };
  } catch (error) {
    console.error("Error updating session:", error);
    return { error: "Error al actualizar la sesión" };
  }
}
