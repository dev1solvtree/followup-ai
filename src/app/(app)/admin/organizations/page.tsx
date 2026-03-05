"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { Building2, Users, FolderKanban, Activity, ExternalLink } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
  n8nWebhookBase: string
  createdAt: string
  _count: {
    users: number
    useCases: number
    runs: number
    contacts: number
  }
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/organizations")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOrgs(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organizations"
        description="Manage customer organizations and their n8n webhook connections"
      />

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orgs.map((org) => (
            <Link key={org.id} href={`/admin/organizations/${org.id}`}>
              <Card className="bg-[#1A1A1A] border-border hover:border-amber-500/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{org.name}</h3>
                        <p className="text-sm text-muted-foreground">{org.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{org._count.users}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FolderKanban className="h-4 w-4" />
                        <span>{org._count.useCases}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>{org._count.runs}</span>
                      </div>

                      <Badge
                        variant={org.n8nWebhookBase ? "default" : "destructive"}
                        className={org.n8nWebhookBase ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                      >
                        {org.n8nWebhookBase ? "n8n Connected" : "No Webhook"}
                      </Badge>

                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
