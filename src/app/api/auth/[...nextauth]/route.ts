import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from database
          const result = await query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [credentials.email]
          );

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
          
          if (!isValidPassword) {
            return null;
          }

          // Update last login
          await query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
          );

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            username: user.username,
            level: user.level,
            experience: user.experience,
            avatar: user.avatar_url,
            isVerified: user.is_verified,
            joinedDate: user.created_at,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          );

          if (existingUser.rows.length === 0) {
            // Create new user
            const username = user.email?.split('@')[0] || 'trainer';
            const uniqueUsername = `${username}_${Date.now().toString().slice(-4)}`;
            
            const result = await query(`
              INSERT INTO users (
                email, username, display_name, avatar_url, provider, provider_id,
                is_verified, experience, level
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING *
            `, [
              user.email,
              uniqueUsername,
              user.name,
              user.image,
              account.provider,
              account.providerAccountId,
              true, // Google users are pre-verified
              0,    // Starting experience
              1,    // Starting level
            ]);

            user.id = result.rows[0].id;
            user.username = result.rows[0].username;
          } else {
            user.id = existingUser.rows[0].id;
            user.username = existingUser.rows[0].username;
            
            // Update last login
            await query(
              'UPDATE users SET last_login = NOW() WHERE id = $1',
              [user.id]
            );
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.level = user.level;
        token.experience = user.experience;
        token.isVerified = user.isVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.level = token.level as number;
        session.user.experience = token.experience as number;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };