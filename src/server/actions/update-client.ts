"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  age: z.coerce.number().min(1, "La edad es requerida"),
  patologia: z.string().min(1, "La patología es requerida"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["Activo", "Inactivo"]),
});

export async function updateClient(data: z.infer<typeof updateClientSchema>) {
  const result = updateClientSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const { id, name, age, patologia, email, phone, notes, status } = result.data;

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        age,
        pathology: patologia,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        status,
      },
    });

    revalidatePath(`/dashboard/cliente/${id}`);
    revalidatePath("/dashboard");
    
    return { success: true, client };
  } catch (error) {
    console.error("Error updating client:", error);
    return { error: "Error al actualizar el cliente" };
  }
}
