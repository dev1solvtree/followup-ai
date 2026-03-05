"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ArrowLeft, Edit, Clock, CheckCircle2, ArrowDown } from "lucide-react"
import Link from "next/link"

interface StepData {
  id: string
  stepNumber: number
  delayHours: number
  delayUnit: string
  channel: string
  messageTemplate: string
  subject?: string
  tone: string
  aiEnhance: boolean
}

interface UseCaseDetail {
  id: string
  name: string
  type: string
  description?: string
  icon: string
  color: string
  channels: string[]
  isActive: boolean
  successCondition: string
  steps: StepData[]
  runs: Array<{
    id: string
    status: string
    currentStep: number
    startedAt: string
    contact: { name: string; company?: string }
  }>
  _count: { runs: number }
}

function formatDelay(hours: number): string {
  if (hours === 0) return "Immediate"
  if (hours < 24) return `${hours}h delay`
  const days = Math.floor(hours / 24)
  return `${days}d delay`
}

export default function UseCaseDetailPage() {
  const params = useParams()
  const [useCase, setUseCase] = useState<UseCaseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/use-cases/${params.id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setUseCase(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-secondary rounded w-48" /><div className="h-64 bg-secondary rounded" /></div>
  }

  if (!useCase) {
    return <div className="text-muted-foreground">Use case not found.</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/use-cases">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title={useCase.name} description={useCase.description}>
          <Link href={`/use-cases/${useCase.id}/edit`}>
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit Sequence</Button>
          </Link>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader>
              <CardTitle className="text-base">Follow-up Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {useCase.steps.map((step, i) => (
                  <div key={step.id} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-sm font-bold">
                          {step.stepNumber}
                        </div>
                        {i < useCase.steps.length - 1 && (
                          <div className="w-px h-full min-h-[20px] bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <ChannelIcon channel={step.channel as "EMAIL" | "WHATSAPP" | "SMS"} showLabel />
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDelay(step.delayHours)}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">{step.tone}</Badge>
                          {step.aiEnhance && (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">AI</Badge>
                          )}
                        </div>
                        {step.subject && (
                          <p className="text-sm font-medium mb-1">Subject: {step.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                          {step.messageTemplate}
                        </p>
                      </div>
                    </div>
                    {i < useCase.steps.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-400">Success Condition</p>
                    <p className="text-sm text-muted-foreground">{useCase.successCondition}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader>
              <CardTitle className="text-base">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channels</span>
                <div className="flex gap-1">
                  {useCase.channels.map((ch) => (
                    <ChannelIcon key={ch} channel={ch as "EMAIL" | "WHATSAPP" | "SMS"} />
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Steps</span>
                <span>{useCase.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Runs</span>
                <span>{useCase._count.runs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={useCase.isActive ? "default" : "outline"} className={useCase.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : ""}>
                  {useCase.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader>
              <CardTitle className="text-base">Recent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {useCase.runs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No runs yet</p>
              ) : (
                <div className="space-y-2">
                  {useCase.runs.slice(0, 5).map((run) => (
                    <Link
                      key={run.id}
                      href={`/runs/${run.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{run.contact.name}</p>
                        <p className="text-xs text-muted-foreground">Step {run.currentStep}</p>
                      </div>
                      <StatusBadge status={run.status as "ACTIVE" | "SUCCESS" | "FAILED" | "PAUSED" | "STOPPED"} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
