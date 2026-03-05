"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import { ArrowLeft, CheckCircle2, Pause, Square, Clock, User, Building2, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"

interface RunDetail {
  id: string
  status: string
  currentStep: number
  startedAt: string
  completedAt?: string
  successAt?: string
  nextActionAt?: string
  metadata: Record<string, unknown>
  contact: { id: string; name: string; email?: string; phone?: string; company?: string }
  useCase: { id: string; name: string; type: string; steps: Array<{ id: string; stepNumber: number; channel: string; messageTemplate: string; delayHours: number }> }
  logs: Array<{ id: string; stepNumber: number; channel: string; message: string; sentAt: string; status: string }>
}

export default function RunDetailPage() {
  const params = useParams()
  const [run, setRun] = useState<RunDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/runs/${params.id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setRun(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/runs/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (data.success) setRun(data.data)
  }

  const markSuccess = async () => {
    const res = await fetch(`/api/runs/${params.id}/mark-success`, { method: "POST" })
    const data = await res.json()
    if (data.success) setRun((prev) => prev ? { ...prev, status: "SUCCESS", successAt: new Date().toISOString() } : prev)
  }

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-secondary rounded w-48" /></div>
  if (!run) return <div className="text-muted-foreground">Run not found.</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/runs"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title={`${run.contact.name} — ${run.useCase.name}`}>
          <div className="flex items-center gap-2">
            {run.status === "ACTIVE" && (
              <>
                <Button onClick={markSuccess} className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="mr-2 h-4 w-4" />Mark Success
                </Button>
                <Button variant="outline" onClick={() => updateStatus("PAUSED")}>
                  <Pause className="mr-2 h-4 w-4" />Pause
                </Button>
                <Button variant="outline" onClick={() => updateStatus("STOPPED")} className="text-red-400">
                  <Square className="mr-2 h-4 w-4" />Stop
                </Button>
              </>
            )}
            {run.status === "PAUSED" && (
              <Button onClick={() => updateStatus("ACTIVE")} className="bg-amber-500 hover:bg-amber-600 text-black">
                Resume
              </Button>
            )}
          </div>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader>
              <CardTitle className="text-base">Message Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {run.logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages sent yet</p>
              ) : (
                <div className="space-y-4">
                  {run.logs.map((log, i) => (
                    <div key={log.id} className="flex gap-4 animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <ChannelIcon channel={log.channel as "EMAIL" | "WHATSAPP" | "SMS"} />
                        </div>
                        {i < run.logs.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">Step {log.stepNumber}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.sentAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          <StatusBadge status={
                            log.status === "delivered" ? "SUCCESS" :
                            log.status === "failed" ? "FAILED" :
                            log.status === "replied" ? "SUCCESS" : "ACTIVE"
                          } />
                        </div>
                        <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3 font-mono">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {run.useCase.steps
                .filter((s) => s.stepNumber > run.currentStep)
                .map((step) => (
                  <div key={step.id} className="flex gap-4 opacity-40 mt-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center border border-dashed border-border">
                        <ChannelIcon channel={step.channel as "EMAIL" | "WHATSAPP" | "SMS"} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">Step {step.stepNumber}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {step.delayHours}h delay
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-secondary/20 rounded-lg p-3 font-mono border border-dashed border-border">
                        {step.messageTemplate.slice(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader><CardTitle className="text-base">Run Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={run.status as "ACTIVE" | "SUCCESS" | "FAILED" | "PAUSED" | "STOPPED"} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress</span>
                <span>Step {run.currentStep}/{run.useCase.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span>{formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}</span>
              </div>
              {run.nextActionAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next action</span>
                  <span>{formatDistanceToNow(new Date(run.nextActionAt), { addSuffix: true })}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{run.contact.name}</div>
              {run.contact.company && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />{run.contact.company}</div>}
              {run.contact.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{run.contact.email}</div>}
              {run.contact.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{run.contact.phone}</div>}
            </CardContent>
          </Card>

          {run.metadata && Object.keys(run.metadata).length > 0 && (
            <Card className="bg-[#1A1A1A] border-border">
              <CardHeader><CardTitle className="text-base">Variables</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(run.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-mono">{`{{${key}}}`}</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
