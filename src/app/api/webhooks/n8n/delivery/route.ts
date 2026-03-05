import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { runId, stepNumber, status, channel, timestamp } = body

    await prisma.runLog.updateMany({
      where: {
        runId,
        stepNumber,
      },
      data: {
        status,
        n8nResponse: { deliveredAt: timestamp, channel },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delivery webhook failed:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}
