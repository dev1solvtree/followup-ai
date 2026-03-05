"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/shared/PageHeader"
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Sparkles, Loader2, Check } from "lucide-react"
import Link from "next/link"

interface StepForm {
  stepNumber: number
  delayHours: number
  delayUnit: string
  channel: string
  messageTemplate: string
  subject: string
  tone: string
  aiEnhance: boolean
  stopIfReplied: boolean
}

interface MessageVariation {
  message: string
  subject?: string
  style: string
}

export default function EditUseCasePage() {
  const params = useParams()
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [successCondition, setSuccessCondition] = useState("")
  const [steps, setSteps] = useState<StepForm[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generatingForStep, setGeneratingForStep] = useState<number | null>(null)
  const [variations, setVariations] = useState<Record<number, MessageVariation[]>>({})

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/use-cases/${params.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const uc = res.data
          setName(uc.name)
          setDescription(uc.description ?? "")
          setSuccessCondition(uc.successCondition)
          setSteps(
            uc.steps.map((s: StepForm & { id: string }) => ({
              stepNumber: s.stepNumber,
              delayHours: s.delayHours,
              delayUnit: s.delayUnit,
              channel: s.channel,
              messageTemplate: s.messageTemplate,
              subject: s.subject ?? "",
              tone: s.tone,
              aiEnhance: s.aiEnhance,
              stopIfReplied: s.stopIfReplied,
            }))
          )
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const updateStep = useCallback((index: number, field: string, value: unknown) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }, [])

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        delayHours: 24,
        delayUnit: "hours",
        channel: "EMAIL",
        messageTemplate: "",
        subject: "",
        tone: "professional",
        aiEnhance: true,
        stopIfReplied: true,
      },
    ])
  }

  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    )
    // Clear variations for removed step
    setVariations((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const generateVariations = async (stepIndex: number) => {
    const step = steps[stepIndex]
    if (!step) return

    setGeneratingForStep(stepIndex)
    setVariations((prev) => {
      const next = { ...prev }
      delete next[stepIndex]
      return next
    })

    try {
      const res = await fetch("/api/ai/message-variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: step.channel,
          tone: step.tone,
          stepNumber: step.stepNumber,
          totalSteps: steps.length,
          useCaseName: name,
          currentMessage: step.messageTemplate || undefined,
          subject: step.channel === "EMAIL" ? step.subject || undefined : undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setVariations((prev) => ({ ...prev, [stepIndex]: data.data }))
      }
    } catch (err) {
      console.error("Failed to generate variations:", err)
    } finally {
      setGeneratingForStep(null)
    }
  }

  const selectVariation = (stepIndex: number, variation: MessageVariation) => {
    updateStep(stepIndex, "messageTemplate", variation.message)
    if (variation.subject && steps[stepIndex]?.channel === "EMAIL") {
      updateStep(stepIndex, "subject", variation.subject)
    }
    // Clear variations after selection
    setVariations((prev) => {
      const next = { ...prev }
      delete next[stepIndex]
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/use-cases/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, successCondition, steps }),
      })
      const data = await res.json()
      if (data.success) router.push(`/use-cases/${params.id}`)
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse"><div className="h-8 bg-secondary rounded w-48" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href={`/use-cases/${params.id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title={`Edit: ${name}`}>
          <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </PageHeader>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {steps.map((step, i) => (
            <Card key={i} className="bg-[#1A1A1A] border-border animate-slide-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-sm">Step {step.stepNumber}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeStep(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Delay (hours)</Label>
                    <Input
                      type="number"
                      value={step.delayHours}
                      onChange={(e) => updateStep(i, "delayHours", parseInt(e.target.value) || 0)}
                      className="bg-secondary"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Channel</Label>
                    <Select value={step.channel} onValueChange={(v) => updateStep(i, "channel", v)}>
                      <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Tone</Label>
                    <Select value={step.tone} onValueChange={(v) => updateStep(i, "tone", v)}>
                      <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="firm">Firm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {step.channel === "EMAIL" && (
                  <div>
                    <Label className="text-xs">Subject</Label>
                    <Input
                      value={step.subject}
                      onChange={(e) => updateStep(i, "subject", e.target.value)}
                      placeholder="Email subject with {{variables}}"
                      className="bg-secondary"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs">Message Template</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateVariations(i)}
                      disabled={generatingForStep !== null}
                      className="h-7 text-xs gap-1.5 text-amber-500 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400"
                    >
                      {generatingForStep === i ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Generate 5 Variations
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={step.messageTemplate}
                    onChange={(e) => updateStep(i, "messageTemplate", e.target.value)}
                    placeholder="Use {{name}}, {{amount}}, etc. or click Generate to create AI variations"
                    rows={4}
                    className="bg-secondary font-mono text-sm"
                  />
                </div>

                {/* AI Variations Picker */}
                {variations[i] && variations[i].length > 0 && (
                  <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-amber-500">
                        Pick a variation
                      </p>
                      <button
                        onClick={() => setVariations((prev) => {
                          const next = { ...prev }
                          delete next[i]
                          return next
                        })}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-2">
                      {variations[i].map((v, vi) => (
                        <button
                          key={vi}
                          onClick={() => selectVariation(i, v)}
                          className="w-full text-left rounded-lg border border-border bg-[#1A1A1A] p-3 hover:border-amber-500/40 hover:bg-[#1A1A1A]/80 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                              {v.style}
                            </span>
                            <Check className="h-3 w-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {v.subject && (
                            <p className="text-[11px] text-amber-500/70 mb-1 truncate">
                              Subject: {v.subject}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {v.message}
                          </p>
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateVariations(i)}
                      disabled={generatingForStep !== null}
                      className="w-full text-xs text-muted-foreground hover:text-amber-500"
                    >
                      <Sparkles className="mr-1.5 h-3 w-3" />
                      Regenerate variations
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={step.aiEnhance} onCheckedChange={(v) => updateStep(i, "aiEnhance", v)} />
                    <Label className="text-xs">AI Enhance</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={step.stopIfReplied} onCheckedChange={(v) => updateStep(i, "stopIfReplied", v)} />
                    <Label className="text-xs">Stop if replied</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addStep} className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="bg-[#1A1A1A] border-border">
            <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary" rows={3} />
              </div>
              <div>
                <Label className="text-xs">Success Condition</Label>
                <Input value={successCondition} onChange={(e) => setSuccessCondition(e.target.value)} className="bg-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">AI Message Generation</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Click &quot;Generate 5 Variations&quot; on any step to get AI-written messages. Pick the one you like, then customize it further.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
