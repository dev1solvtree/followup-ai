"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import { Activity, Zap, CheckCircle2, TrendingUp, MessageSquare, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface OverviewData {
  activeRuns: number
  completedThisWeek: number
  successRate: number
  messagesToday: number
  recentActivity: Array<{
    id: string
    stepNumber: number
    channel: string
    message: string
    sentAt: string
    status: string
    run: {
      id: string
      status: string
      contact: { name: string; company?: string }
      useCase: { name: string; icon: string }
    }
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: "Active Runs", value: data?.activeRuns ?? 0, icon: Activity, color: "text-amber-500" },
    { label: "Completed This Week", value: data?.completedThisWeek ?? 0, icon: CheckCircle2, color: "text-green-500" },
    { label: "Success Rate", value: `${data?.successRate ?? 0}%`, icon: TrendingUp, color: "text-blue-500" },
    { label: "Messages Today", value: data?.messagesToday ?? 0, icon: MessageSquare, color: "text-purple-500" },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Overview of your follow-up engine">
        <Link href="/runs/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Start Follow-up
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#1A1A1A] border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{loading ? "—" : stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1A1A1A] border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !data?.recentActivity?.length ? (
            <p className="text-muted-foreground text-sm">No activity yet. Start your first follow-up!</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 10).map((item) => (
                <Link
                  key={item.id}
                  href={`/runs/${item.run.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors animate-slide-in"
                >
                  <div className="flex items-center gap-3">
                    <ChannelIcon channel={item.channel as "EMAIL" | "WHATSAPP" | "SMS"} />
                    <div>
                      <p className="text-sm font-medium">
                        {item.run.contact.name}
                        {item.run.contact.company && (
                          <span className="text-muted-foreground"> @ {item.run.contact.company}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.run.useCase.name} &middot; Step {item.stepNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.run.status as "ACTIVE" | "SUCCESS" | "FAILED" | "PAUSED" | "STOPPED"} />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.sentAt), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
