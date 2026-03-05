import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      orgId?: string
      role?: "ADMIN" | "USER"
    }
  }

  interface User {
    orgId?: string
    role?: "ADMIN" | "USER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    orgId?: string
    role?: "ADMIN" | "USER"
  }
}
