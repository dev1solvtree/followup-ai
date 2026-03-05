"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { TemplatePicker } from "@/components/use-cases/TemplatePicker"
import { AIChatBuilder } from "@/components/use-cases/AIChatBuilder"
import { ArrowLeft, LayoutTemplate, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NewUseCasePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Use Case"
        description="Choose a pre-built template or design your own with AI"
      >
        <Link href="/use-cases">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="bg-[#1A1A1A] border border-border">
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="ai-builder"
            className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <TemplatePicker />
        </TabsContent>

        <TabsContent value="ai-builder" className="mt-6">
          <div className="rounded-xl border border-border bg-[#0D0D0D] overflow-hidden">
            <AIChatBuilder />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
