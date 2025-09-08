// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {connectToDatabase} from '../../../lib/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Connect to database
          await connectToDatabase();
          
          // Find user by email - explicitly include passwordHash
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+passwordHash'); // The + sign forces inclusion of select: false fields
          
          if (!user) {
            return null;
          }
          
          // Check if user is suspended
          if (user.status === 'suspended') {
            return null;
          }
          
          // Compare password directly using bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            user.passwordHash
          );
          
          if (!isValidPassword) {
            return null;
          }
          
          // Update last login time
          user.lastLoginAt = new Date();
          await user.save();
          
          // Return user object (without password)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Always fetch the latest user data from database to ensure role is up-to-date
        await connectToDatabase();
        const dbUser = await User.findById(token.id);
        
        session.user.id = token.id;
        session.user.email = token.email;
        
        // Use the role from database (not from token) to ensure it's always current
        session.user.role = dbUser?.role || token.role;
        session.user.status = dbUser?.status || token.status;
        session.user.name = dbUser?.name || '';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };