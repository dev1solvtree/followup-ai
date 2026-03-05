import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId")
    const status = searchParams.get("status")
    const useCaseId = searchParams.get("useCaseId")

    const runs = await prisma.followUpRun.findMany({
      where: {
        ...(orgId && { orgId }),
        ...(status && { status: status as "ACTIVE" | "SUCCESS" | "FAILED" | "PAUSED" | "STOPPED" }),
        ...(useCaseId && { useCaseId }),
      },
      include: {
        contact: true,
        useCase: { include: { steps: { orderBy: { stepNumber: "asc" } } } },
        logs: { orderBy: { sentAt: "desc" } },
      },
      orderBy: { startedAt: "desc" },
    })

    return NextResponse.json({ success: true, data: runs })
  } catch (error) {
    console.error("Failed to fetch runs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch runs" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { useCaseId, contactId, orgId, metadata, startNow } = body

    const useCase = await prisma.useCase.findUnique({
      where: { id: useCaseId },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    })

    if (!useCase) {
      return NextResponse.json({ success: false, error: "Use case not found" }, { status: 404 })
    }

    const firstStep = useCase.steps[0]
    const now = new Date()
    const delayMs = firstStep ? firstStep.delayHours * 60 * 60 * 1000 : 0
    const nextActionAt = startNow !== false ? new Date(now.getTime() + delayMs) : null

    const run = await prisma.followUpRun.create({
      data: {
        orgId,
        useCaseId,
        contactId,
        metadata,
        currentStep: 0,
        nextActionAt,
      },
      include: {
        contact: true,
        useCase: { include: { steps: true } },
      },
    })

    return NextResponse.json({ success: true, data: run })
  } catch (error) {
    console.error("Failed to create run:", error)
    return NextResponse.json({ success: false, error: "Failed to create run" }, { status: 500 })
  }
}
