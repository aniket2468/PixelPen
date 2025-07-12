import { PrismaAdapter } from "@auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import prisma from "./connect";
import { getServerSession } from "next-auth";

// Helper function to generate username from email
const generateUniqueUsername = async (email) => {
  // Extract base username from email (part before @)
  let baseUsername = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .substring(0, 15); // Limit length
  
  // Ensure we have at least some characters
  if (baseUsername.length < 3) {
    baseUsername = `user${baseUsername}${Date.now().toString().slice(-3)}`;
  }
  
  let username = baseUsername;
  let counter = 1;
  
  // Check if username exists and increment until unique
  while (true) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (!existingUser) {
        return username;
      }
      
      username = `${baseUsername}${counter}`;
      counter++;
      
      // Safety check to prevent infinite loops
      if (counter > 9999) {
        return `${baseUsername}${Date.now().toString().slice(-4)}`;
      }
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      // Fallback to a random username if database check fails
      return `${baseUsername}${Date.now().toString().slice(-4)}`;
    }
  }
};

// Custom adapter that ensures username generation
const customAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (userData) => {
    try {
      // Generate username if not provided
      if (userData.email && !userData.username) {
        userData.username = await generateUniqueUsername(userData.email);
      }
      
      // Create user with generated username
      const user = await prisma.user.create({
        data: userData
      });
      
      console.log(`Created user with username '${user.username}' for email ${user.email}`);
      return user;
    } catch (error) {
      console.error('Error creating user with custom adapter:', error);
      throw error;
    }
  }
};

export const authOptions = {
  adapter: customAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    }),
  ],
  // Add additional configurations if necessary
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all sign-ins - this removes any potential blocking
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      // Always populate session from JWT token if available
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist user data to JWT token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  debug: process.env.NODE_ENV === 'development',
};

export const getAuthSession = () => getServerSession(authOptions);