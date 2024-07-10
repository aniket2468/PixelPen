import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn(user, account, profile) {
      const email = user.email;

      // Fetch user from database
      let dbUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      // If user doesn't exist, create a new user
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: email,
            name: user.name,
            image: user.image,
          },
        });
      }

      // Attach the dbUser to the user object
      user.id = dbUser.id;
      return true;
    },
    async session(session, user) {
      session.userId = user.id;
      return session;
    },
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  database: process.env.DATABASE_URL,
});
