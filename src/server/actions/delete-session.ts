"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const deleteSessionSchema = z.object({
  sessionId: z.string().uuid(),
  clientId: z.string().uuid(), // Needed for revalidation
});

export async function deleteSession(data: z.infer<typeof deleteSessionSchema>) {
  const result = deleteSessionSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    await prisma.sessionRecord.delete({
      where: { id: result.data.sessionId },
    });

    revalidatePath(`/dashboard/cliente/${result.data.clientId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    return { error: "Error al eliminar la sesión" };
  }
}
