"use client";

import { createAuthClient } from "better-auth/client";

export function DebugErrors() {
  const authClient = createAuthClient();
  console.log(authClient.$ERROR_CODES);
  return null;
}
