"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/PageHeader"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import { ArrowLeft, ArrowRight, Check, Rocket, Search } from "lucide-react"
import Link from "next/link"

interface UseCaseOption {
  id: string
  name: string
  type: string
  icon: string
  color: string
  description?: string
  channels: string[]
  steps: Array<{ messageTemplate: string }>
}

interface ContactOption {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
}

function NewRunContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedContactId = searchParams.get("contactId")

  const [step, setStep] = useState(1)
  const [useCases, setUseCases] = useState<UseCaseOption[]>([])
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [selectedUseCase, setSelectedUseCase] = useState<string>("")
  const [selectedContact, setSelectedContact] = useState<string>(preselectedContactId ?? "")
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [contactSearch, setContactSearch] = useState("")
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    fetch("/api/use-cases").then((r) => r.json()).then((res) => {
      if (res.success) setUseCases(res.data)
    })
    fetch("/api/contacts").then((r) => r.json()).then((res) => {
      if (res.success) setContacts(res.data)
    })
  }, [])

  useEffect(() => {
    if (!selectedUseCase) return
    const uc = useCases.find((u) => u.id === selectedUseCase)
    if (!uc) return
    const vars = new Set<string>()
    uc.steps.forEach((s) => {
      const matches = s.messageTemplate.match(/\{\{(\w+)\}\}/g)
      matches?.forEach((m) => vars.add(m.replace(/\{\{|\}\}/g, "")))
    })
    const existing = { ...variables }
    vars.forEach((v) => { if (!(v in existing)) existing[v] = "" })
    setVariables(existing)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUseCase, useCases])

  const filteredContacts = contacts.filter((c) =>
    !contactSearch ||
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.company?.toLowerCase().includes(contactSearch.toLowerCase())
  )

  const launch = async () => {
    setLaunching(true)
    try {
      const org = await fetch("/api/use-cases").then((r) => r.json())
      const orgId = org.data?.[0]?.orgId
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useCaseId: selectedUseCase,
          contactId: selectedContact,
          orgId,
          metadata: variables,
          startNow: true,
        }),
      })
      const data = await res.json()
      if (data.success) router.push(`/runs/${data.data.id}`)
    } catch (error) {
      console.error("Launch failed:", error)
    } finally {
      setLaunching(false)
    }
  }

  const commonVars = ["name", "email", "phone", "company"]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/runs"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title="Start a Follow-up" description={`Step ${step} of 4`} />
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-amber-500" : "bg-secondary"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Use Case</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc) => (
              <Card
                key={uc.id}
                className={`bg-[#1A1A1A] border-border cursor-pointer transition-colors ${selectedUseCase === uc.id ? "border-amber-500 bg-amber-500/5" : "hover:border-amber-500/30"}`}
                onClick={() => setSelectedUseCase(uc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${uc.color}15` }}>
                      <span style={{ color: uc.color }} className="text-lg">{uc.icon === "banknote" ? "\u{1F4B0}" : uc.icon === "search" ? "\u{1F50D}" : uc.icon === "calendar" ? "\u{1F4C5}" : uc.icon === "file-text" ? "\u{1F4C4}" : uc.icon === "receipt" ? "\u{1F4AC}" : uc.icon === "rocket" ? "\u{1F680}" : uc.icon === "refresh-cw" ? "\u{1F504}" : uc.icon === "star" ? "\u2B50" : uc.icon === "snowflake" ? "\u2744\uFE0F" : "\u{1F3AB}"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{uc.name}</p>
                      <div className="flex gap-1 mt-1">
                        {uc.channels.map((ch) => <ChannelIcon key={ch} channel={ch as "EMAIL" | "WHATSAPP" | "SMS"} />)}
                      </div>
                    </div>
                    {selectedUseCase === uc.id && <Check className="ml-auto h-5 w-5 text-amber-500" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!selectedUseCase} className="bg-amber-500 hover:bg-amber-600 text-black">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Contact</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} className="pl-10 bg-[#1A1A1A]" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredContacts.map((c) => (
              <Card
                key={c.id}
                className={`bg-[#1A1A1A] border-border cursor-pointer transition-colors ${selectedContact === c.id ? "border-amber-500 bg-amber-500/5" : "hover:border-amber-500/30"}`}
                onClick={() => setSelectedContact(c.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.company} {c.email && `\u00B7 ${c.email}`}</p>
                  </div>
                  {selectedContact === c.id && <Check className="h-5 w-5 text-amber-500" />}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedContact} className="bg-amber-500 hover:bg-amber-600 text-black">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Fill in Variables</h2>
          <Card className="bg-[#1A1A1A] border-border">
            <CardContent className="p-6 space-y-4">
              {Object.keys(variables)
                .filter((k) => !commonVars.includes(k))
                .map((key) => (
                  <div key={key}>
                    <Label className="text-sm font-mono">{`{{${key}}}`}</Label>
                    <Input
                      value={variables[key]}
                      onChange={(e) => setVariables((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Enter ${key}...`}
                      className="bg-secondary mt-1"
                    />
                  </div>
                ))}
              {Object.keys(variables).filter((k) => !commonVars.includes(k)).length === 0 && (
                <p className="text-sm text-muted-foreground">No custom variables needed for this template.</p>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)} className="bg-amber-500 hover:bg-amber-600 text-black">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Confirm & Launch</h2>
          <Card className="bg-[#1A1A1A] border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Use Case</span>
                <span className="font-medium">{useCases.find((u) => u.id === selectedUseCase)?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{contacts.find((c) => c.id === selectedContact)?.name}</span>
              </div>
              {Object.entries(variables).filter(([k]) => !commonVars.includes(k)).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground font-mono text-sm">{`{{${key}}}`}</span>
                  <span className="text-sm">{val || <span className="text-muted-foreground italic">empty</span>}</span>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium text-amber-500">Immediately</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={launch} disabled={launching} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Rocket className="mr-2 h-4 w-4" />
              {launching ? "Launching..." : "Launch Follow-up"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewRunPage() {
  return (
    <Suspense fallback={<div className="animate-pulse"><div className="h-8 bg-secondary rounded w-48" /></div>}>
      <NewRunContent />
    </Suspense>
  )
}
