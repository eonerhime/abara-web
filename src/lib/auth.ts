import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const TOKEN = process.env.ABARA_INTERNAL_TOKEN!;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/internal/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const user = await res.json();
          return {
            id: user.businessId,
            name: user.name,
            email: credentials.email,
            businessId: user.businessId,
            whatsappPhoneNumber: user.whatsappPhoneNumber,
            phoneNumberId: user.phoneNumberId,
            tier: user.tier,
          };
        } catch {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        try {
          const res = await fetch(`${API_URL}/internal/auth/otp/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify({
              phone: credentials.phone,
              otp: credentials.otp,
            }),
          });
          if (!res.ok) return null;
          const user = await res.json();
          return {
            id: user.businessId,
            name: user.name,
            email: user.whatsappPhoneNumber,
            businessId: user.businessId,
            whatsappPhoneNumber: user.whatsappPhoneNumber,
            phoneNumberId: user.phoneNumberId,
            tier: user.tier,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.businessId = u.businessId as string;
        token.whatsappPhoneNumber = u.whatsappPhoneNumber as string;
        token.phoneNumberId = u.phoneNumberId as string | null;
        token.tier = u.tier as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).businessId = token.businessId;
        (session.user as Record<string, unknown>).whatsappPhoneNumber =
          token.whatsappPhoneNumber;
        (session.user as Record<string, unknown>).phoneNumberId =
          token.phoneNumberId;
        (session.user as Record<string, unknown>).tier = token.tier;
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      businessId: string;
      whatsappPhoneNumber: string;
      phoneNumberId: string | null;
      tier: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId: string;
    whatsappPhoneNumber: string;
    phoneNumberId: string | null;
    tier: string;
  }
}
