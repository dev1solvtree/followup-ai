import { NextRequest, NextResponse } from "next/server"
import { enhanceMessage } from "@/lib/ai/enhanceMessage"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { template, contact, metadata, tone, stepNumber, totalSteps, useCase } = body

    const enhanced = await enhanceMessage({
      template,
      contact: contact ?? { name: "Sample Contact" },
      metadata: metadata ?? {},
      tone: tone ?? "professional",
      stepNumber: stepNumber ?? 1,
      totalSteps: totalSteps ?? 3,
      useCase: useCase ?? "General",
    })

    return NextResponse.json({ success: true, data: { message: enhanced } })
  } catch (error) {
    console.error("Message preview failed:", error)
    return NextResponse.json({ success: false, error: "Preview failed" }, { status: 500 })
  }
}
