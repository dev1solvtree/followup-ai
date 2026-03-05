import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { classifyReply } from "@/lib/ai/classifyReply"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { contactPhone, contactEmail, replyText, channel } = body

    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          ...(contactPhone ? [{ phone: contactPhone }] : []),
          ...(contactEmail ? [{ email: contactEmail }] : []),
        ],
      },
    })

    if (!contact) {
      return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 })
    }

    const activeRun = await prisma.followUpRun.findFirst({
      where: { contactId: contact.id, status: "ACTIVE" },
      include: { useCase: true },
      orderBy: { startedAt: "desc" },
    })

    if (!activeRun) {
      return NextResponse.json({ success: true, data: { message: "No active run for this contact" } })
    }

    const classification = await classifyReply(replyText, activeRun.useCase.type)

    await prisma.runLog.create({
      data: {
        runId: activeRun.id,
        stepNumber: activeRun.currentStep,
        channel: channel ?? "WHATSAPP",
        message: `[REPLY] ${replyText}`,
        status: "replied",
      },
    })

    if (classification.shouldStop) {
      const now = new Date()
      await prisma.followUpRun.update({
        where: { id: activeRun.id },
        data: {
          status: classification.intent === "success" ? "SUCCESS" : "STOPPED",
          completedAt: now,
          ...(classification.intent === "success" && { successAt: now }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        classification,
        runId: activeRun.id,
        stopped: classification.shouldStop,
      },
    })
  } catch (error) {
    console.error("Reply webhook failed:", error)
    return NextResponse.json({ success: false, error: "Reply processing failed" }, { status: 500 })
  }
}
