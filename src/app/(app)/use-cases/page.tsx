"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/shared/PageHeader"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import {
  Banknote, Search, Calendar, FileText, Receipt,
  Rocket, RefreshCw, Star, Snowflake, Ticket, Plus, ChevronRight, Zap,
} from "lucide-react"
import Link from "next/link"

const iconMap: Record<string, React.ElementType> = {
  banknote: Banknote, search: Search, calendar: Calendar,
  "file-text": FileText, receipt: Receipt, rocket: Rocket,
  "refresh-cw": RefreshCw, star: Star, snowflake: Snowflake, ticket: Ticket, zap: Zap,
}

interface UseCaseData {
  id: string
  name: string
  type: string
  description?: string
  icon: string
  color: string
  channels: string[]
  isActive: boolean
  successCondition: string
  steps: Array<{ id: string }>
  _count: { runs: number }
}

export default function UseCasesPage() {
  const [useCases, setUseCases] = useState<UseCaseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/use-cases")
      .then((r) => r.json())
      .then((res) => { if (res.success) setUseCases(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/use-cases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    const data = await res.json()
    if (data.success) {
      setUseCases((prev) => prev.map((uc) => uc.id === id ? { ...uc, isActive: !current } : uc))
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Use Cases" description="Pre-built and custom follow-up templates">
        <Link href="/use-cases/new">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Custom
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-[#1A1A1A] border-border animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc) => {
            const Icon = iconMap[uc.icon] ?? Banknote
            return (
              <Card
                key={uc.id}
                className="bg-[#1A1A1A] border-border hover:border-amber-500/30 transition-colors group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${uc.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: uc.color }} />
                    </div>
                    <Switch
                      checked={uc.isActive}
                      onCheckedChange={() => toggleActive(uc.id, uc.isActive)}
                    />
                  </div>

                  <h3 className="font-semibold text-base mb-1">{uc.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {uc.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    {uc.channels.map((ch) => (
                      <ChannelIcon key={ch} channel={ch as "EMAIL" | "WHATSAPP" | "SMS"} showLabel />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{uc.steps.length} steps</span>
                      <span>&middot;</span>
                      <span>{uc._count.runs} runs</span>
                    </div>
                    <Link href={`/use-cases/${uc.id}`}>
                      <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                        View <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
