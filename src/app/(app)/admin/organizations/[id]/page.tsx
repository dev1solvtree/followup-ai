"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { Save, ArrowLeft, Users, FolderKanban, Activity, UserCircle } from "lucide-react"
import Link from "next/link"

interface OrgUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface OrgDetail {
  id: string
  name: string
  slug: string
  n8nWebhookBase: string
  createdAt: string
  users: OrgUser[]
  _count: { useCases: number; runs: number; contacts: number }
}

export default function AdminOrgDetailPage() {
  const params = useParams()
  const [org, setOrg] = useState<OrgDetail | null>(null)
  const [name, setName] = useState("")
  const [webhookBase, setWebhookBase] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/organizations/${params.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setOrg(res.data)
          setName(res.data.name)
          setWebhookBase(res.data.n8nWebhookBase)
        }
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/organizations/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, n8nWebhookBase: webhookBase }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save organization:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={org.name}
          description={`Slug: ${org.slug} \u2022 Created: ${new Date(org.createdAt).toLocaleDateString()}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <FolderKanban className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{org._count.useCases}</p>
              <p className="text-xs text-muted-foreground">Use Cases</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{org._count.contacts}</p>
              <p className="text-xs text-muted-foreground">Contacts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{org._count.runs}</p>
              <p className="text-xs text-muted-foreground">Runs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader>
            <CardTitle className="text-base">Organization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Organization Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">n8n Webhook Base URL</Label>
              <Input
                value={webhookBase}
                onChange={(e) => setWebhookBase(e.target.value)}
                placeholder="https://clienta.solvtree.com"
                className="bg-secondary mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The app will POST to: {webhookBase || "..."}/webhook/followup-send
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : saved ? "Saved" : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader>
            <CardTitle className="text-base">Users ({org.users.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {org.users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{user.name ?? "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge
                  variant={user.role === "ADMIN" ? "default" : "secondary"}
                  className={user.role === "ADMIN" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""}
                >
                  {user.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
