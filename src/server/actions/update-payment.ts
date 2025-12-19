"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updatePaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  paymentDate: z.coerce.date(),
  method: z.enum(["Efectivo", "Otro"]),
  notes: z.string().optional(),
  clientId: z.string().uuid(),
});

export async function updatePayment(data: z.infer<typeof updatePaymentSchema>) {
  const result = updatePaymentSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { paymentId, amount, paymentDate, method, notes, clientId } = result.data;

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amount,
        paymentDate,
        type: method,
        notes,
      },
    });

    revalidatePath(`/dashboard/cliente/${clientId}`);

    return { success: true, payment };
  } catch (error) {
    console.error("Error updating payment:", error);
    return { error: "Error al actualizar el pago" };
  }
}
