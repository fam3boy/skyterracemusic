import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await query(
          "SELECT id, email, password_hash, nickname, role FROM admins WHERE email = $1",
          [credentials.email]
        );

        const admin = res.rows[0];

        if (admin && bcrypt.compareSync(credentials.password, admin.password_hash)) {
          return { 
            id: admin.id, 
            email: admin.email, 
            name: admin.nickname,
            role: admin.role
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
