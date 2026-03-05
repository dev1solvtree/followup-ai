import { NextRequest, NextResponse } from "next/server"
import { getSessionOrThrow } from "@/lib/auth/getSessionOrThrow"
import OpenAI from "openai"
import { z } from "zod/v4"

export const dynamic = "force-dynamic"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1),
})

const stepSchema = z.object({
  stepNumber: z.number().int().min(1),
  delayHours: z.number().min(0),
  channel: z.enum(["EMAIL", "WHATSAPP", "SMS"]),
  tone: z.string(),
  subject: z.string().optional(),
  messageTemplate: z.string(),
  aiEnhance: z.boolean(),
  stopIfReplied: z.boolean(),
})

const useCaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string(),
  color: z.string(),
  channels: z.array(z.enum(["EMAIL", "WHATSAPP", "SMS"])).min(1),
  successCondition: z.string().min(1),
  steps: z.array(stepSchema).min(1).max(8),
})

const SYSTEM_PROMPT = `You are an expert at designing B2B follow-up sequences. The user will describe their follow-up strategy in plain English. Your job is to generate a structured use case with message templates.

RESPOND WITH ONLY VALID JSON matching this exact schema:
{
  "name": "Use Case Name",
  "description": "Short description of the follow-up strategy",
  "icon": "one of: banknote, search, calendar, file-text, receipt, rocket, refresh-cw, star, snowflake, ticket, zap",
  "color": "hex color like #3B82F6",
  "channels": ["EMAIL", "WHATSAPP", "SMS"],
  "successCondition": "What constitutes success for this sequence",
  "steps": [
    {
      "stepNumber": 1,
      "delayHours": 0,
      "channel": "EMAIL",
      "tone": "professional|friendly|firm|urgent",
      "subject": "Email subject (only for EMAIL channel)",
      "messageTemplate": "Message with {{name}}, {{company}}, and custom {{variables}}",
      "aiEnhance": true,
      "stopIfReplied": true
    }
  ]
}

RULES:
- Generate 3-6 steps depending on the complexity
- Use {{name}}, {{company}}, {{email}} as standard variables
- Create custom {{variables}} relevant to the use case (e.g., {{invoiceNumber}}, {{amount}}, {{productName}})
- Escalate tone gradually across steps (friendly → professional → firm → urgent)
- Vary channels across steps for multi-touch approach
- First step usually has delayHours: 0 (sends immediately)
- Subsequent steps should have increasing delays (24, 48, 72, 168 hours etc.)
- SMS messages should be short (under 160 chars) with aiEnhance: false
- Email steps should include subject lines
- Make messages sound human, not robotic
- Pick an appropriate icon and color for the use case type
- Return ONLY the JSON object, no markdown, no explanation`

export async function POST(req: NextRequest) {
  try {
    await getSessionOrThrow()

    const body = await req.json()
    const { messages } = requestSchema.parse(body)

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(content)
    const validated = useCaseSchema.parse(parsed)

    return NextResponse.json({
      success: true,
      data: validated,
      rawResponse: content,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "AI generated invalid structure", details: error.issues },
        { status: 422 }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to generate use case"
    if (message === "Unauthorized") {
      return NextResponse.json({ success: false, error: message }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
