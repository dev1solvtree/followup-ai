interface WebhookPayload {
  runId: string
  stepNumber: number
  channel: "EMAIL" | "WHATSAPP" | "SMS"
  recipient: {
    name: string
    phone?: string
    email?: string
  }
  message: string
  subject?: string | null
  callbackUrl: string
  metadata: {
    useCaseType: string
    orgId: string
  }
}

interface WebhookResponse {
  success: boolean
  data?: unknown
  error?: string
}

export async function triggerN8nWebhook(
  baseUrl: string,
  payload: WebhookPayload
): Promise<WebhookResponse> {
  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/webhook/followup-send`

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `n8n webhook returned ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown webhook error",
    }
  }
}

export function buildWebhookPayload(params: {
  runId: string
  stepNumber: number
  channel: "EMAIL" | "WHATSAPP" | "SMS"
  contact: { name: string; email?: string | null; phone?: string | null }
  message: string
  subject?: string | null
  useCaseType: string
  orgId: string
}): WebhookPayload {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return {
    runId: params.runId,
    stepNumber: params.stepNumber,
    channel: params.channel,
    recipient: {
      name: params.contact.name,
      phone: params.contact.phone ?? undefined,
      email: params.contact.email ?? undefined,
    },
    message: params.message,
    subject: params.subject,
    callbackUrl: `${appUrl}/api/webhooks/n8n/delivery`,
    metadata: {
      useCaseType: params.useCaseType,
      orgId: params.orgId,
    },
  }
}
