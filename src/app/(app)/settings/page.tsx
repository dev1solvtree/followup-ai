"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { Save, Mail, MessageCircle, Smartphone } from "lucide-react"

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setOrgName(res.data.name)
          setOrgSlug(res.data.slug)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Settings" description="Configure your organization settings" />
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Configure your organization settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Organization Name</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your Company"
                className="bg-secondary mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Slug</Label>
              <Input value={orgSlug} disabled className="bg-secondary/50 mt-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Contact admin to change your slug</p>
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
            <CardTitle className="text-base">Channel Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Channel priority for message delivery. If primary fails, fallback channels are used automatically.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>WhatsApp</span>
                </div>
                <span className="text-muted-foreground text-xs">Primary</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>Email</span>
                </div>
                <span className="text-muted-foreground text-xs">Fallback</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  <span>SMS</span>
                </div>
                <span className="text-muted-foreground text-xs">Last resort</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
