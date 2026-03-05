import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId")
    const where = orgId ? { orgId } : {}

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [activeRuns, completedThisWeek, totalRuns, successRuns, messagesToday] =
      await Promise.all([
        prisma.followUpRun.count({ where: { ...where, status: "ACTIVE" } }),
        prisma.followUpRun.count({
          where: { ...where, status: "SUCCESS", completedAt: { gte: weekAgo } },
        }),
        prisma.followUpRun.count({ where }),
        prisma.followUpRun.count({ where: { ...where, status: "SUCCESS" } }),
        prisma.runLog.count({
          where: {
            run: where,
            sentAt: { gte: todayStart },
            status: { not: "replied" },
          },
        }),
      ])

    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0

    const recentActivity = await prisma.runLog.findMany({
      where: { run: where },
      include: {
        run: {
          include: { contact: true, useCase: true },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      data: {
        activeRuns,
        completedThisWeek,
        successRate,
        messagesToday,
        recentActivity,
      },
    })
  } catch (error) {
    console.error("Analytics overview failed:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
