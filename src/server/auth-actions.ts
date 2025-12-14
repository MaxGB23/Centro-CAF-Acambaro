"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpEmail(formData: FormData) {
  console.log("Server action llamada, datos recibidos:", formData);

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  console.log("Valores:", { name, email });

  if (password !== confirmPassword) {
    console.log("❌ Las contraseñas no coinciden");
    return;
  }

  console.log("Intentando registrar usuario...");

  await auth.api.signUpEmail({
    body: { name, email, password },
    headers: await headers(),
  });

  console.log("✔️ Registro completado");
  redirect("/dashboard");
}

export async function signInEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });
    redirect("/dashboard");
}

export async function signOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
    redirect("/login");

} 
