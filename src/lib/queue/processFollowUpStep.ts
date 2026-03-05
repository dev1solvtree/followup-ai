/**
 * FOLLOW-UP STEP PROCESSOR
 *
 * This is the core engine that executes follow-up steps. Here's the flow:
 *
 * 1. Customer starts a Run (via /api/runs POST)
 * 2. Step 1 is scheduled in BullMQ with the appropriate delay
 * 3. When the delay expires, THIS function runs:
 *    a. Load the run + current step from DB
 *    b. Check if the run is still ACTIVE (might have been stopped by a reply)
 *    c. Get the step's messageTemplate from DB
 *    d. Enhance it with OpenAI (if aiEnhance=true), else fill {{variables}}
 *    e. POST the FINAL composed message to n8n via webhook
 *    f. n8n is a DUMB PIPE — it just delivers the message (email/whatsapp/sms)
 *    g. Log the result in RunLog
 *    h. Schedule the NEXT step (if there is one)
 * 4. n8n calls back to /api/webhooks/n8n/delivery with delivery status
 * 5. If the contact replies, n8n calls /api/webhooks/n8n/reply → may stop the run
 *
 * KEY INSIGHT: n8n receives ONE message at a time with the final text.
 * It never knows about templates, steps, or sequences.
 */

import { prisma } from "@/lib/prisma"
import { enhanceMessage } from "@/lib/ai/enhanceMessage"
import { triggerN8nWebhook, buildWebhookPayload } from "@/lib/n8n/triggerWebhook"
import { scheduleFollowUpStep } from "./followUpQueue"

interface StepJobData {
  runId: string
  stepNumber: number
}

export async function processFollowUpStep(job: { data: StepJobData }): Promise<void> {
  const { runId, stepNumber } = job.data

  // 1. Load the run with all needed relations
  const run = await prisma.followUpRun.findUnique({
    where: { id: runId },
    include: {
      contact: true,
      useCase: {
        include: { steps: { orderBy: { stepNumber: "asc" } } },
      },
      org: true,
    },
  })

  if (!run) {
    throw new Error(`Run ${runId} not found`)
  }

  // 2. Guard: only process if run is still ACTIVE
  if (run.status !== "ACTIVE") {
    return // Run was stopped/paused/completed — skip silently
  }

  // 3. Find the current step
  const step = run.useCase.steps.find((s) => s.stepNumber === stepNumber)
  if (!step) {
    throw new Error(`Step ${stepNumber} not found for run ${runId}`)
  }

  // 4. Compose the message (AI-enhanced or variable-filled)
  const contactData = {
    name: run.contact.name,
    email: run.contact.email ?? undefined,
    phone: run.contact.phone ?? undefined,
    company: run.contact.company ?? undefined,
  }
  const metadata = (run.metadata as Record<string, unknown>) ?? {}

  let finalMessage: string
  try {
    finalMessage = step.aiEnhance
      ? await enhanceMessage({
          template: step.messageTemplate,
          contact: contactData,
          metadata,
          tone: step.tone,
          stepNumber: step.stepNumber,
          totalSteps: run.useCase.steps.length,
          useCase: run.useCase.type,
        })
      : fillVariables(step.messageTemplate, { ...contactData, ...metadata })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    finalMessage = fillVariables(step.messageTemplate, { ...contactData, ...metadata })
  }

  // 5. Check that the org has an n8n webhook configured
  if (!run.org.n8nWebhookBase) {
    await prisma.runLog.create({
      data: {
        runId: run.id,
        stepNumber,
        channel: step.channel,
        message: finalMessage,
        status: "failed",
        n8nResponse: { error: "No n8n webhook configured for this organization" } as object,
      },
    })
    return
  }

  // 6. Send to n8n (n8n just delivers — it's a dumb pipe)
  const payload = buildWebhookPayload({
    runId: run.id,
    stepNumber,
    channel: step.channel,
    contact: {
      name: run.contact.name,
      email: run.contact.email,
      phone: run.contact.phone,
    },
    message: finalMessage,
    subject: step.channel === "EMAIL" ? step.subject : undefined,
    useCaseType: run.useCase.type,
    orgId: run.orgId,
  })

  const webhookResult = await triggerN8nWebhook(run.org.n8nWebhookBase, payload)

  // 7. Log the result
  await prisma.runLog.create({
    data: {
      runId: run.id,
      stepNumber,
      channel: step.channel,
      message: finalMessage,
      status: webhookResult.success ? "sent" : "failed",
      n8nResponse: webhookResult.success
        ? (webhookResult.data as object) ?? { sent: true }
        : ({ error: webhookResult.error } as object),
    },
  })

  // 8. Schedule the next step (or mark run as exhausted)
  const nextStepNumber = stepNumber + 1
  const nextStep = run.useCase.steps.find((s) => s.stepNumber === nextStepNumber)

  if (nextStep) {
    const nextDelayMs = nextStep.delayHours * 60 * 60 * 1000
    const nextActionAt = new Date(Date.now() + nextDelayMs)

    await prisma.followUpRun.update({
      where: { id: run.id },
      data: {
        currentStep: stepNumber,
        nextActionAt,
      },
    })

    await scheduleFollowUpStep({
      runId: run.id,
      stepNumber: nextStepNumber,
      delayMs: nextDelayMs,
    })
  } else {
    // No more steps — exhausted all steps without success
    await prisma.followUpRun.update({
      where: { id: run.id },
      data: {
        currentStep: stepNumber,
        status: "FAILED",
        completedAt: new Date(),
        nextActionAt: null,
      },
    })
  }
}

function fillVariables(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(data[key] ?? `[${key}]`)
  })
}
