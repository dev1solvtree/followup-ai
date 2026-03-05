import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId")

    const useCases = await prisma.useCase.findMany({
      where: orgId ? { orgId } : undefined,
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        _count: { select: { runs: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: useCases })
  } catch (error) {
    console.error("Failed to fetch use cases:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch use cases" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, description, icon, color, successCondition, channels, orgId, steps } = body

    const useCase = await prisma.useCase.create({
      data: {
        name,
        type,
        description,
        icon,
        color,
        successCondition,
        channels,
        orgId,
        steps: steps ? {
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
        } : undefined,
      },
      include: { steps: { orderBy: { stepNumber: "asc" } } },
    })

    return NextResponse.json({ success: true, data: useCase })
  } catch (error) {
    console.error("Failed to create use case:", error)
    return NextResponse.json({ success: false, error: "Failed to create use case" }, { status: 500 })
  }
}
