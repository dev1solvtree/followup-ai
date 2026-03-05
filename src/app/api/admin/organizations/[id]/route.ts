import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const org = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { useCases: true, runs: true, contacts: true } },
      },
    })

    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error("Failed to fetch organization:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch organization" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, n8nWebhookBase } = body

    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.name = name
    if (n8nWebhookBase !== undefined) updateData.n8nWebhookBase = n8nWebhookBase

    const org = await prisma.organization.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: org })
  } catch (error) {
    console.error("Failed to update organization:", error)
    return NextResponse.json({ success: false, error: "Failed to update organization" }, { status: 500 })
  }
}
