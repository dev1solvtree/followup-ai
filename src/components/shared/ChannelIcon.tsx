"use client"

import { Mail, MessageSquare, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

const channelConfig = {
  EMAIL: { icon: Mail, label: "Email", color: "text-blue-400" },
  WHATSAPP: { icon: MessageSquare, label: "WhatsApp", color: "text-green-400" },
  SMS: { icon: Phone, label: "SMS", color: "text-purple-400" },
} as const

type ChannelType = keyof typeof channelConfig

export function ChannelIcon({ channel, className, showLabel = false }: { channel: ChannelType; className?: string; showLabel?: boolean }) {
  const config = channelConfig[channel]
  const Icon = config.icon
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon className={cn("h-4 w-4", config.color)} />
      {showLabel && <span className={cn("text-sm", config.color)}>{config.label}</span>}
    </span>
  )
}
