"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { error: "No se pudo eliminar el cliente." };
  }
}
