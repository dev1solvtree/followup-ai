"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import {
  Banknote, Search, Calendar, FileText, Receipt,
  Rocket, RefreshCw, Star, Snowflake, Ticket,
  ArrowLeft, Check, Loader2,
} from "lucide-react"
import {
  type UseCaseTemplate,
  getTemplatesByType,
  getUseCaseTypeMeta,
} from "@/lib/templates/useCaseTemplates"

const iconMap: Record<string, React.ElementType> = {
  banknote: Banknote, search: Search, calendar: Calendar,
  "file-text": FileText, receipt: Receipt, rocket: Rocket,
  "refresh-cw": RefreshCw, star: Star, snowflake: Snowflake, ticket: Ticket,
}

export function TemplatePicker() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const typeMeta = getUseCaseTypeMeta()
  const templatesByType = getTemplatesByType()

  const handleUseTemplate = async (template: UseCaseTemplate) => {
    const orgId = (session?.user as { orgId?: string } | undefined)?.orgId
    if (!orgId) return

    setCreating(true)
    try {
      const res = await fetch("/api/use-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          type: template.type,
          description: template.description,
          icon: template.icon,
          color: template.color,
          successCondition: template.successCondition,
          channels: template.channels,
          orgId,
          steps: template.steps.map((s) => ({
            stepNumber: s.stepNumber,
            delayHours: s.delayHours,
            channel: s.channel,
            tone: s.tone,
            subject: s.subject ?? null,
            messageTemplate: s.messageTemplate,
            aiEnhance: s.aiEnhance,
            stopIfReplied: s.stopIfReplied,
          })),
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/use-cases/${data.data.id}/edit`)
      }
    } catch (err) {
      console.error("Failed to create use case:", err)
    } finally {
      setCreating(false)
    }
  }

  // Type selection grid
  if (!selectedType) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose a follow-up type to see available templates
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {typeMeta.map((meta) => {
            const Icon = iconMap[meta.icon] ?? Banknote
            const variants = templatesByType[meta.type] ?? []
            return (
              <Card
                key={meta.type}
                className="bg-[#1A1A1A] border-border hover:border-amber-500/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedType(meta.type)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2.5 rounded-lg shrink-0"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-amber-500 transition-colors">
                        {meta.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {meta.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {variants.length} variants available
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Variant selection for chosen type
  const variants = templatesByType[selectedType] ?? []
  const meta = typeMeta.find((m) => m.type === selectedType)
  const TypeIcon = iconMap[meta?.icon ?? ""] ?? Banknote

  return (
    <div className="space-y-4">
      <button
        onClick={() => setSelectedType(null)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all types
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${meta?.color ?? "#888"}15` }}
        >
          <TypeIcon className="h-5 w-5" style={{ color: meta?.color ?? "#888" }} />
        </div>
        <div>
          <h3 className="font-semibold">{meta?.name}</h3>
          <p className="text-xs text-muted-foreground">{meta?.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {variants.map((variant) => (
          <Card
            key={variant.variantId}
            className="bg-[#1A1A1A] border-border hover:border-amber-500/30 transition-colors"
          >
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                    {variant.variantName}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mt-2">{variant.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {variant.variantDescription}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {variant.channels.map((ch) => (
                  <ChannelIcon
                    key={ch}
                    channel={ch as "EMAIL" | "WHATSAPP" | "SMS"}
                    showLabel
                  />
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  Sequence ({variant.steps.length} steps)
                </p>
                {variant.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium shrink-0">
                      {step.stepNumber}
                    </span>
                    <span className="capitalize">{step.channel.toLowerCase()}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{formatDelay(step.delayHours)}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="capitalize">{step.tone}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>{variant.successCondition}</span>
                </div>
                <Button
                  onClick={() => handleUseTemplate(variant)}
                  disabled={creating}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
                  size="sm"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Use This Template"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function formatDelay(hours: number): string {
  if (hours === 0) return "Immediately"
  if (hours < 24) return `${hours}h delay`
  const days = Math.round(hours / 24)
  return `${days}d delay`
}
