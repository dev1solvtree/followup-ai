import { NextRequest, NextResponse } from "next/server"
import { analyzeRun } from "@/lib/ai/analyzeRun"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { runId } = body

    const run = await prisma.followUpRun.findUnique({
      where: { id: runId },
      include: {
        useCase: { include: { steps: true } },
        logs: { orderBy: { sentAt: "asc" } },
      },
    })

    if (!run) {
      return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 })
    }

    const daysSinceStart = Math.floor(
      (Date.now() - run.startedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    const recommendation = await analyzeRun({
      useCaseType: run.useCase.type,
      currentStep: run.currentStep,
      totalSteps: run.useCase.steps.length,
      logs: run.logs.map((l) => ({
        stepNumber: l.stepNumber,
        channel: l.channel,
        status: l.status,
        sentAt: l.sentAt,
      })),
      daysSinceStart,
    })

    return NextResponse.json({ success: true, data: recommendation })
  } catch (error) {
    console.error("Run analysis failed:", error)
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 })
  }
}
