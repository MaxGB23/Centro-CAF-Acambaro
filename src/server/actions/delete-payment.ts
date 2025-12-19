"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const deletePaymentSchema = z.object({
  paymentId: z.string().uuid(),
  clientId: z.string().uuid(), // Needed for revalidation
});

export async function deletePayment(data: z.infer<typeof deletePaymentSchema>) {
  const result = deletePaymentSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    await prisma.payment.delete({
      where: { id: result.data.paymentId },
    });

    revalidatePath(`/dashboard/cliente/${result.data.clientId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { error: "Error al eliminar el pago" };
  }
}
