import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { contacts, orgId } = body as {
      contacts: Array<{ name: string; email?: string; phone?: string; company?: string; metadata?: Record<string, unknown> }>
      orgId: string
    }

    if (!Array.isArray(contacts) || !orgId) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }

    const created = await prisma.contact.createMany({
      data: contacts.map((c) => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        metadata: (c.metadata ?? {}) as Record<string, string>,
        orgId,
      })),
    })

    return NextResponse.json({ success: true, data: { count: created.count } })
  } catch (error) {
    console.error("Failed to import contacts:", error)
    return NextResponse.json({ success: false, error: "Failed to import contacts" }, { status: 500 })
  }
}
