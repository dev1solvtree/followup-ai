/**
 * WORKER BOOTSTRAP
 *
 * Run this as a separate process (NOT inside Next.js):
 *   npm run worker
 *
 * It connects to Redis, listens for scheduled follow-up steps,
 * and processes them using processFollowUpStep.
 *
 * In production, use PM2 or Docker to keep this running.
 */

import { createFollowUpWorker } from "./followUpQueue"
import { processFollowUpStep } from "./processFollowUpStep"

const worker = createFollowUpWorker(processFollowUpStep)

worker.on("completed", (job) => {
  // eslint-disable-next-line no-console
  console.info(`[Worker] Step completed: ${job.name}`)
})

worker.on("failed", (job, err) => {
  // eslint-disable-next-line no-console
  console.error(`[Worker] Step failed: ${job?.name}`, err.message)
})

// eslint-disable-next-line no-console
console.info("[Worker] FollowUp worker started, waiting for jobs...")
