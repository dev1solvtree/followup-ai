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
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from "lucide-react"
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

export default function EditUseCasePage() {
  const params = useParams()
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [successCondition, setSuccessCondition] = useState("")
  const [steps, setSteps] = useState<StepForm[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

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
                  <Label className="text-xs">Message Template</Label>
                  <Textarea
                    value={step.messageTemplate}
                    onChange={(e) => updateStep(i, "messageTemplate", e.target.value)}
                    placeholder="Use {{name}}, {{amount}}, etc."
                    rows={4}
                    className="bg-secondary font-mono text-sm"
                  />
                </div>

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
        </div>
      </div>
    </div>
  )
}
