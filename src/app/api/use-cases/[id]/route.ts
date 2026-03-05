import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const useCase = await prisma.useCase.findUnique({
      where: { id: params.id },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        runs: {
          include: { contact: true, logs: true },
          orderBy: { startedAt: "desc" },
          take: 20,
        },
        _count: { select: { runs: true } },
      },
    })

    if (!useCase) {
      return NextResponse.json({ success: false, error: "Use case not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: useCase })
  } catch (error) {
    console.error("Failed to fetch use case:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch use case" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, description, successCondition, channels, isActive, steps } = body

    if (steps) {
      await prisma.followUpStep.deleteMany({ where: { useCaseId: params.id } })
    }

    const useCase = await prisma.useCase.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(successCondition !== undefined && { successCondition }),
        ...(channels !== undefined && { channels }),
        ...(isActive !== undefined && { isActive }),
        ...(steps && {
          steps: {
            create: steps.map((s: { stepNumber: number; delayHours: number; delayUnit?: string; channel: string; messageTemplate: string; subject?: string; tone?: string; aiEnhance?: boolean; stopIfReplied?: boolean }) => ({
              stepNumber: s.stepNumber,
              delayHours: s.delayHours,
              delayUnit: s.delayUnit ?? "hours",
              channel: s.channel,
              messageTemplate: s.messageTemplate,
              subject: s.subject,
              tone: s.tone ?? "professional",
              aiEnhance: s.aiEnhance ?? true,
              stopIfReplied: s.stopIfReplied ?? true,
            })),
          },
        }),
      },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    })

    return NextResponse.json({ success: true, data: useCase })
  } catch (error) {
    console.error("Failed to update use case:", error)
    return NextResponse.json({ success: false, error: "Failed to update use case" }, { status: 500 })
  }
}
