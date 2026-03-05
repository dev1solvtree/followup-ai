import Anthropic from "@anthropic-ai/sdk"

interface RunRecommendation {
  action: "continue" | "pause" | "change_channel" | "escalate" | "close"
  reason: string
  suggestedChannel?: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeRun(runData: {
  useCaseType: string
  currentStep: number
  totalSteps: number
  logs: Array<{ stepNumber: number; channel: string; status: string; sentAt: Date }>
  daysSinceStart: number
}): Promise<RunRecommendation> {
  const prompt = `You are analyzing a follow-up sequence run to recommend the next action.

Use case: ${runData.useCaseType}
Current step: ${runData.currentStep} of ${runData.totalSteps}
Days since start: ${runData.daysSinceStart}
Message history:
${runData.logs.map((l) => `  Step ${l.stepNumber} (${l.channel}): ${l.status} at ${l.sentAt}`).join("\n")}

Based on this data, recommend one action:
- "continue": Keep going with the next step
- "pause": Temporarily pause (e.g., too many failed deliveries)
- "change_channel": Switch to a different channel
- "escalate": Escalate urgency or notify the org
- "close": Close this run as unlikely to succeed

Return ONLY valid JSON with: action, reason, and optionally suggestedChannel.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    return JSON.parse(textBlock?.text ?? '{"action":"continue","reason":"Default"}') as RunRecommendation
  } catch (error) {
    console.error("Run analysis failed:", error)
    return { action: "continue", reason: "Analysis unavailable, continuing by default" }
  }
}
