import { NextAuthOptions } from 'next-auth';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { query } from './db';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists in database
        const existingUser = await query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );

        if (existingUser.rows.length === 0) {
          // Create new user
          await query(
            `INSERT INTO users (
              email, username, avatar_url, created_date, last_login,
              level, experience_total, trust_rating
            ) VALUES ($1, $2, $3, NOW(), NOW(), 1, 0, 50)`,
            [user.email, user.name, user.image]
          );
        } else {
          // Update last login
          await query(
            'UPDATE users SET last_login = NOW(), avatar_url = $1 WHERE email = $2',
            [user.image, user.email]
          );
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          const dbUser = await query(
            'SELECT id, username, level, experience_total, trust_rating FROM users WHERE email = $1',
            [session.user.email]
          );

          if (dbUser.rows.length > 0) {
            const user = dbUser.rows[0];
            session.user.id = user.id;
            session.user.username = user.username;
            session.user.level = user.level;
            session.user.experience = user.experience_total;
            session.user.trustRating = user.trust_rating;
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};