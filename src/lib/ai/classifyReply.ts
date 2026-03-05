import Anthropic from "@anthropic-ai/sdk"

interface ReplyClassification {
  intent: "success" | "objection" | "reschedule" | "unsubscribe" | "question"
  suggestedResponse: string
  shouldStop: boolean
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function classifyReply(
  replyText: string,
  useCaseType: string
): Promise<ReplyClassification> {
  const prompt = `You are analyzing a reply to a business follow-up message.

Use case type: ${useCaseType}
Reply text: "${replyText}"

Classify this reply into one of these intents:
- "success": The contact is confirming the desired outcome (payment made, meeting booked, proposal accepted, etc.)
- "objection": The contact has concerns or pushback
- "reschedule": The contact wants to delay or reschedule
- "unsubscribe": The contact wants to stop receiving messages
- "question": The contact has a question

Return a JSON object with:
- intent: one of the above
- suggestedResponse: a brief suggested response message
- shouldStop: true if the follow-up sequence should stop (success or unsubscribe)

Return ONLY valid JSON, nothing else.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    const parsed = JSON.parse(textBlock?.text ?? "{}") as ReplyClassification
    return {
      intent: parsed.intent ?? "question",
      suggestedResponse: parsed.suggestedResponse ?? "",
      shouldStop: parsed.shouldStop ?? false,
    }
  } catch (error) {
    console.error("Reply classification failed:", error)
    return {
      intent: "question",
      suggestedResponse: "Thank you for your reply. Let me get back to you shortly.",
      shouldStop: false,
    }
  }
}
