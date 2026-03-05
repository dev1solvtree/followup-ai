"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { BarChart3, TrendingUp, Zap, Target } from "lucide-react"

interface OverviewData {
  activeRuns: number
  completedThisWeek: number
  successRate: number
  messagesToday: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<OverviewData | null>(null)

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data) })
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Performance insights for your follow-up sequences" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Runs</p>
                <p className="text-3xl font-bold mt-1">{data?.activeRuns ?? "\u2014"}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold mt-1">{data?.successRate ?? 0}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed This Week</p>
                <p className="text-3xl font-bold mt-1">{data?.completedThisWeek ?? "\u2014"}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Messages Today</p>
                <p className="text-3xl font-bold mt-1">{data?.messagesToday ?? "\u2014"}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-border">
        <CardHeader>
          <CardTitle>Performance Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Charts will render with live data once sequences are running. Connect Recharts to the analytics API for real-time visualization.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
