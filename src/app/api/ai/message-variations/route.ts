import { NextRequest, NextResponse } from "next/server"
import { getSessionOrThrow } from "@/lib/auth/getSessionOrThrow"
import OpenAI from "openai"

export const dynamic = "force-dynamic"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    await getSessionOrThrow()

    const body = await req.json()
    const { channel, tone, stepNumber, totalSteps, useCaseName, currentMessage, subject } = body

    if (!channel || !tone || !useCaseName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: channel, tone, useCaseName" },
        { status: 400 }
      )
    }

    const prompt = `You are a B2B communication expert. Generate exactly 5 different message variations for a follow-up step.

Context:
- Use case: ${useCaseName}
- Channel: ${channel}
- Tone: ${tone}
- Step ${stepNumber} of ${totalSteps} (adjust urgency accordingly — later steps should be more direct)
${currentMessage ? `- Current message (use as reference for style/variables): ${currentMessage}` : ""}
${subject ? `- Email subject: ${subject}` : ""}

Rules:
- Each variation must be unique in approach and wording
- Use {{name}}, {{company}} as standard variables
- Include any relevant custom {{variables}} (like {{amount}}, {{invoiceNumber}}, {{productName}}, etc.)
- ${channel === "SMS" ? "Keep messages under 160 characters" : "Keep messages under 100 words"}
- ${channel === "EMAIL" && subject ? `Also generate a subject line variation for each` : ""}
- Make messages sound human and natural, never robotic
- Vary the approach: some direct, some empathetic, some value-driven, some urgency-based, some conversational

Return ONLY a JSON object with this exact format:
{
  "variations": [
    {
      "message": "The message text",
      ${channel === "EMAIL" ? '"subject": "Email subject line",' : ""}
      "style": "One-word style label (e.g., Direct, Empathetic, Conversational, Urgent, Value-driven)"
    }
  ]
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0.9,
      messages: [{ role: "user", content: prompt }],
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

    if (!parsed.variations || !Array.isArray(parsed.variations)) {
      return NextResponse.json(
        { success: false, error: "Invalid AI response format" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: parsed.variations })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate variations"
    if (message === "Unauthorized") {
      return NextResponse.json({ success: false, error: message }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
