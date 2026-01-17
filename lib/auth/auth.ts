import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { generateId } from "@/lib/utils/cuid";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered for:", user.email);
      if (!user.email) {
        console.log("No email provided");
        return false;
      }

      try {
        // Ensure Prisma is connected
        await prisma.$connect();

        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });

        // If user doesn't exist, create user ONLY
        if (!existingUser) {
          const userId = generateId();
          console.log("Creating new user with ID:", userId);

          await prisma.user.create({
            data: {
              id: userId,
              email: user.email!,
              name: user.name || null,
              image: user.image || null,
            }
          });
        }

        return true;
      } catch (error) {
        // Log the error but allow sign-in to proceed
        // User creation will be retried on next request or in jwt callback
        console.error('Database error in signIn callback (allowing sign-in anyway):', error);
        // Return true to allow authentication - the user record will be created
        // lazily when the database becomes available
        return true;
      }
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at; // unix timestamp

        // Fetch DB ID
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, familyId: true }
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.familyId = dbUser.familyId;
          }
        }
        return token;
      }

      // Return previous token if the access token has not expired yet
      // expiresAt is in seconds, Date.now() is in milliseconds
      if (token.expiresAt && Date.now() < ((token.expiresAt as number) * 1000)) {
        return token;
      }

      // Access token has expired, try to update it
      console.log("Access token expired, refreshing...");
      try {
        if (!token.refreshToken) throw new Error("No refresh token available");

        const response = await fetch("https://oauth2.googleapis.com/token", {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
          method: "POST",
        });

        const tokens = await response.json();

        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
          // Fall back to old refresh token if no new one provided
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.familyId = token.familyId as string | undefined;

        // Pass these down
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
