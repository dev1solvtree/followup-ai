"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Users, Plus, Search, Upload, Mail, Phone } from "lucide-react"
import Link from "next/link"

interface ContactData {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  createdAt: string
  _count: { runs: number }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactData[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    fetch(`/api/contacts?${params}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setContacts(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="space-y-8">
      <PageHeader title="Contacts" description="Manage your follow-up contacts">
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Import CSV</Button>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black">
          <Plus className="mr-2 h-4 w-4" />Add Contact
        </Button>
      </PageHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1A1A1A] border-border"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#1A1A1A] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState icon={Users} title="No contacts yet" description="Add contacts to start follow-up sequences">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black"><Plus className="mr-2 h-4 w-4" />Add Contact</Button>
        </EmptyState>
      ) : (
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-sm">
                      {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {contact.email && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" /> {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" /> {contact.phone}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">{contact._count.runs} runs</span>
                    <Link href={`/runs/new?contactId=${contact.id}`}>
                      <Button size="sm" variant="outline">Start Run</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
