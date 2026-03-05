"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusStyles = {
  ACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SUCCESS: "bg-green-500/10 text-green-400 border-green-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  PAUSED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  STOPPED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
} as const

type StatusType = keyof typeof statusStyles

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-mono text-xs", statusStyles[status], className)}>
      {status === "ACTIVE" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot inline-block" />}
      {status}
    </Badge>
  )
}
