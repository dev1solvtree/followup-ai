import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const run = await prisma.followUpRun.findUnique({
      where: { id: params.id },
      include: {
        contact: true,
        useCase: { include: { steps: { orderBy: { stepNumber: "asc" } } } },
        logs: { orderBy: { sentAt: "asc" } },
      },
    })

    if (!run) {
      return NextResponse.json({ success: false, error: "Run not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: run })
  } catch (error) {
    console.error("Failed to fetch run:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch run" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { status, currentStep, nextActionAt } = body

    const now = new Date()
    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (currentStep !== undefined) updateData.currentStep = currentStep
    if (nextActionAt !== undefined) updateData.nextActionAt = nextActionAt

    if (status === "SUCCESS") {
      updateData.successAt = now
      updateData.completedAt = now
    }
    if (status === "FAILED" || status === "STOPPED") {
      updateData.completedAt = now
    }

    const run = await prisma.followUpRun.update({
      where: { id: params.id },
      data: updateData,
      include: {
        contact: true,
        useCase: { include: { steps: true } },
        logs: { orderBy: { sentAt: "asc" } },
      },
    })

    return NextResponse.json({ success: true, data: run })
  } catch (error) {
    console.error("Failed to update run:", error)
    return NextResponse.json({ success: false, error: "Failed to update run" }, { status: 500 })
  }
}
