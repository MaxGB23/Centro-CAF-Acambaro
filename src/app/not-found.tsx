"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useSession } from "@/lib/auth-client";

export default function NotFound() {
  const router = useRouter();
  // const { data: session, isPending } = useSession();

  // useEffect(() => {
  //   if (!isPending) {
  //     if (session) {
  //       router.replace("/dashboard");
  //     } else {
  //       router.replace("/login");
  //     }
  //   }
  // }, [session, isPending, router]);

  return router.replace("/login")
  ; // o un loader mientras isPending===true
}




