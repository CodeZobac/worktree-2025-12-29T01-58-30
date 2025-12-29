import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      familyId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    familyId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    familyId?: string | null;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
