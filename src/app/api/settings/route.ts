import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.orgId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.user.orgId },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.orgId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    const org = await prisma.organization.update({
      where: { id: session.user.orgId },
      data: { ...(name !== undefined && { name }) },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
