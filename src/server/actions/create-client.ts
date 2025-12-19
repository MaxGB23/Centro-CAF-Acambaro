"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createClientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  age: z.coerce.number().min(1, "La edad es requerida"),
  pathology: z.string().min(1, "La patología es requerida"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function createClient(data: z.infer<typeof createClientSchema>) {
  const result = createClientSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    const client = await prisma.client.create({
      data: {
        name: result.data.name,
        age: result.data.age,
        pathology: result.data.pathology,
        email: result.data.email || null,
        phone: result.data.phone || null,
        notes: result.data.notes || null,
        status: "Activo",
      },
    });

    revalidatePath("/dashboard");
    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Error al crear el cliente" };
  }
}
