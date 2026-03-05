import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId")
    const search = searchParams.get("search")

    const contacts = await prisma.contact.findMany({
      where: {
        ...(orgId && { orgId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      },
      include: { _count: { select: { runs: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: contacts })
  } catch (error) {
    console.error("Failed to fetch contacts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, metadata, orgId } = body

    const contact = await prisma.contact.create({
      data: { name, email, phone, company, metadata, orgId },
    })

    return NextResponse.json({ success: true, data: contact })
  } catch (error) {
    console.error("Failed to create contact:", error)
    return NextResponse.json({ success: false, error: "Failed to create contact" }, { status: 500 })
  }
}
