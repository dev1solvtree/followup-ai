"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChannelIcon } from "@/components/shared/ChannelIcon"
import {
  Send, Loader2, Bot, User, Check, Sparkles, RotateCw,
} from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface GeneratedStep {
  stepNumber: number
  delayHours: number
  channel: "EMAIL" | "WHATSAPP" | "SMS"
  tone: string
  subject?: string
  messageTemplate: string
  aiEnhance: boolean
  stopIfReplied: boolean
}

interface GeneratedUseCase {
  name: string
  description: string
  icon: string
  color: string
  channels: ("EMAIL" | "WHATSAPP" | "SMS")[]
  successCondition: string
  steps: GeneratedStep[]
}

export function AIChatBuilder() {
  const router = useRouter()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedUseCase, setGeneratedUseCase] = useState<GeneratedUseCase | null>(null)
  const [creating, setCreating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, generatedUseCase])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: "user", content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)
    setGeneratedUseCase(null)

    try {
      const res = await fetch("/api/ai/generate-use-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedUseCase(data.data)
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: `I've designed a "${data.data.name}" follow-up sequence with ${data.data.steps.length} steps. Take a look at the preview below!`,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: `Sorry, I couldn't generate a use case from that. Could you describe your follow-up strategy in more detail? For example: "I want to follow up on unpaid invoices with 3 email steps over 2 weeks."`,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Something went wrong. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!generatedUseCase) return
    const orgId = (session?.user as { orgId?: string } | undefined)?.orgId
    if (!orgId) return

    setCreating(true)
    try {
      const res = await fetch("/api/use-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedUseCase.name,
          type: "CUSTOM",
          description: generatedUseCase.description,
          icon: generatedUseCase.icon,
          color: generatedUseCase.color,
          successCondition: generatedUseCase.successCondition,
          channels: generatedUseCase.channels,
          orgId,
          steps: generatedUseCase.steps.map((s) => ({
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

  const handleRefine = () => {
    setInput("Can you adjust the sequence to ")
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-amber-500/10 mb-4">
              <Sparkles className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Use Case Builder</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Describe your follow-up strategy in plain English and I&apos;ll design a
              complete multi-step sequence for you.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-amber-500" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-amber-500 text-black"
                  : "bg-[#1A1A1A] text-foreground"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-amber-500" />
            </div>
            <div className="bg-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Designing your follow-up sequence...
              </div>
            </div>
          </div>
        )}

        {/* Generated use case preview */}
        {generatedUseCase && (
          <Card className="bg-[#1A1A1A] border-amber-500/30 ml-10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{generatedUseCase.name}</h4>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${generatedUseCase.color}15`,
                    color: generatedUseCase.color,
                  }}
                >
                  CUSTOM
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {generatedUseCase.description}
              </p>

              <div className="flex items-center gap-2">
                {generatedUseCase.channels.map((ch) => (
                  <ChannelIcon key={ch} channel={ch} showLabel />
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  Steps ({generatedUseCase.steps.length})
                </p>
                {generatedUseCase.steps.map((step) => (
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

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                <span>{generatedUseCase.successCondition}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-medium"
                  size="sm"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-3 w-3" />
                      Create Use Case
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRefine}
                  variant="outline"
                  size="sm"
                  disabled={creating}
                >
                  <RotateCw className="mr-2 h-3 w-3" />
                  Refine
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Describe your follow-up strategy..."
            className="flex-1 bg-[#1A1A1A] border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-amber-500 hover:bg-amber-600 text-black"
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
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

const SUGGESTIONS = [
  "Follow up on unpaid invoices with 4 steps",
  "Nurture cold leads back to life",
  "Get meeting confirmations in 3 days",
  "Onboard new users with daily check-ins",
]
