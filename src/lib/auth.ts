import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      position: {
        type: "string",
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

// export type Session = typeof auth.$Infer.Session;
// export type User = typeof auth.$Infer.Session.user;
