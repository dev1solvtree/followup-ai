"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/PageHeader"
import { Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Configure your organization settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader><CardTitle className="text-base">n8n Integration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">n8n Webhook Base URL</Label>
              <Input placeholder="https://n8n.yourserver.com" className="bg-secondary mt-1" />
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black"><Save className="mr-2 h-4 w-4" />Save</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader><CardTitle className="text-base">API Keys</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Anthropic API Key</Label>
              <Input type="password" placeholder="sk-ant-..." className="bg-secondary mt-1" />
            </div>
            <div>
              <Label className="text-xs">Resend API Key</Label>
              <Input type="password" placeholder="re_..." className="bg-secondary mt-1" />
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black"><Save className="mr-2 h-4 w-4" />Save</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader><CardTitle className="text-base">Organization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Organization Name</Label>
              <Input placeholder="Your Company" className="bg-secondary mt-1" />
            </div>
            <div>
              <Label className="text-xs">Slug</Label>
              <Input placeholder="your-company" className="bg-secondary mt-1" />
            </div>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black"><Save className="mr-2 h-4 w-4" />Save</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-border">
          <CardHeader><CardTitle className="text-base">Channel Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Set priority order for channel delivery. If primary fails, fallback channels are used automatically.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span>1. WhatsApp</span>
                <span className="text-muted-foreground">Primary</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span>2. Email</span>
                <span className="text-muted-foreground">Fallback</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span>3. SMS</span>
                <span className="text-muted-foreground">Last resort</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
