import Anthropic from "@anthropic-ai/sdk"

interface EnhanceMessageInput {
  template: string
  contact: { name: string; email?: string; phone?: string; company?: string }
  metadata: Record<string, unknown>
  tone: string
  stepNumber: number
  totalSteps: number
  useCase: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function enhanceMessage({
  template,
  contact,
  metadata,
  tone,
  stepNumber,
  totalSteps,
  useCase,
}: EnhanceMessageInput): Promise<string> {
  const prompt = `You are a business communication expert. Enhance this follow-up message while:
- Keeping it under 100 words (unless email subject indicates longer format)
- Maintaining a ${tone} tone
- This is step ${stepNumber} of ${totalSteps} (adjust urgency accordingly)
- Use case: ${useCase}
- Never sound robotic or template-like
- Fill in all {{variables}} with the provided data
- If a variable value is not provided, use a reasonable placeholder
- Return ONLY the final message, nothing else

Template: ${template}
Contact Data: ${JSON.stringify({ ...contact, ...metadata })}`

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    return textBlock?.text ?? fillVariables(template, { ...contact, ...metadata })
  } catch (error) {
    console.error("AI enhancement failed, using template fallback:", error)
    return fillVariables(template, { ...contact, ...metadata })
  }
}

function fillVariables(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(data[key] ?? `[${key}]`)
  })
}
