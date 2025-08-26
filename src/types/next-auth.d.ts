// NextAuth module augmentation for TypeScript support

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      level?: number;
      experience?: number;
      isVerified?: boolean;
    };
  }

  interface User {
    id: string;
    username?: string;
    level?: number;
    experience?: number;
    isVerified?: boolean;
    avatar?: string;
    joinedDate?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    level?: number;
    experience?: number;
    isVerified?: boolean;
  }
}