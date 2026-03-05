"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = (session?.user as { role?: string } | undefined)?.role

  useEffect(() => {
    if (status === "authenticated" && role !== "ADMIN") {
      router.replace("/dashboard")
    }
  }, [status, role, router])

  if (status === "loading" || role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    )
  }

  return <>{children}</>
}
