import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const now = new Date()
    const run = await prisma.followUpRun.update({
      where: { id: params.id },
      data: {
        status: "SUCCESS",
        successAt: now,
        completedAt: now,
      },
      include: { contact: true, useCase: true },
    })

    return NextResponse.json({ success: true, data: run })
  } catch (error) {
    console.error("Failed to mark run as success:", error)
    return NextResponse.json({ success: false, error: "Failed to mark run as success" }, { status: 500 })
  }
}
