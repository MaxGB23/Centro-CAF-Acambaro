"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createPaymentSchema = z.object({
  packageId: z.string().uuid(),
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  paymentDate: z.coerce.date(),
  method: z.enum(["Efectivo", "Otro"]), // Assuming PaymentType enum based on schema
  notes: z.string().optional(),
});

export async function createPayment(data: z.infer<typeof createPaymentSchema>) {
  const result = createPaymentSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { packageId, amount, paymentDate, method, notes } = result.data;

    const payment = await prisma.payment.create({
      data: {
        clientPackageId: packageId,
        amount,
        paymentDate,
        type: method,
        notes,
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

    return { success: true, payment };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { error: "Error al registrar el pago" };
  }
}
