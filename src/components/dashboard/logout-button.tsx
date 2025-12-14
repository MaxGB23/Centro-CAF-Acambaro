"use client";

import { LoadingButton } from "@/components/loading-button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    const { error } = await authClient.signOut();
    setLoading(false);

    if (error) {
      toast.error(error.message || "Error al cerrar sesión");
    } else {
      toast.success("Sesión cerrada, vuelve pronto!");
      router.push("/login");
    }
  }

  return (
    <LoadingButton
      variant="destructive"
      onClick={handleLogout}
      loading={loading}
      className="w-full"
    >
      Cerrar Sesión
    </LoadingButton>
  );
}
