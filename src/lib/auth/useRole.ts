"use client"

import { useSession } from "next-auth/react"

export function useRole() {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role ?? "USER"
  return {
    role,
    isAdmin: role === "ADMIN",
    isUser: role === "USER",
  }
}
