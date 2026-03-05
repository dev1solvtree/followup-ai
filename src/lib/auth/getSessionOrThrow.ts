import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getSessionOrThrow() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdmin() {
  const session = await getSessionOrThrow()
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  return session
}
