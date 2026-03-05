"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Play, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface RunData {
  id: string
  status: string
  currentStep: number
  startedAt: string
  nextActionAt?: string
  contact: { name: string; company?: string }
  useCase: { name: string; icon: string; steps: Array<{ id: string }> }
  logs: Array<{ channel: string }>
}

export default function RunsPage() {
  const [runs, setRuns] = useState<RunData[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== "all") params.set("status", statusFilter)
    fetch(`/api/runs?${params}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setRuns(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="space-y-8">
      <PageHeader title="Follow-up Runs" description="All active and completed follow-up runs">
        <Link href="/runs/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="mr-2 h-4 w-4" />New Run
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-[#1A1A1A]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="STOPPED">Stopped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#1A1A1A] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <EmptyState icon={Play} title="No runs found" description="Start a follow-up to see it here">
          <Link href="/runs/new"><Button className="bg-amber-500 hover:bg-amber-600 text-black"><Plus className="mr-2 h-4 w-4" />Start Follow-up</Button></Link>
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <Link key={run.id} href={`/runs/${run.id}`}>
              <Card className="bg-[#1A1A1A] border-border hover:border-amber-500/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{run.contact.name}</p>
                        <p className="text-sm text-muted-foreground">{run.useCase.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-muted-foreground">
                        Step {run.currentStep}/{run.useCase.steps.length}
                      </span>
                      {run.nextActionAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Next: {formatDistanceToNow(new Date(run.nextActionAt), { addSuffix: true })}
                        </span>
                      )}
                      <StatusBadge status={run.status as "ACTIVE" | "SUCCESS" | "FAILED" | "PAUSED" | "STOPPED"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
