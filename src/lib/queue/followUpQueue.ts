import { Queue, Worker } from "bullmq"

const getConnectionOpts = () => ({
  host: new URL(process.env.REDIS_URL ?? "redis://localhost:6379").hostname,
  port: parseInt(new URL(process.env.REDIS_URL ?? "redis://localhost:6379").port || "6379"),
})

let queueInstance: Queue | null = null

export function getFollowUpQueue(): Queue {
  if (!queueInstance) {
    queueInstance = new Queue("followup-steps", {
      connection: getConnectionOpts(),
    })
  }
  return queueInstance
}

export async function scheduleFollowUpStep(params: {
  runId: string
  stepNumber: number
  delayMs: number
}) {
  const queue = getFollowUpQueue()
  await queue.add(
    `step-${params.runId}-${params.stepNumber}`,
    {
      runId: params.runId,
      stepNumber: params.stepNumber,
    },
    {
      delay: params.delayMs,
      removeOnComplete: true,
      removeOnFail: 100,
    }
  )
}

export function createFollowUpWorker(
  processor: (job: { data: { runId: string; stepNumber: number } }) => Promise<void>
): Worker {
  return new Worker(
    "followup-steps",
    async (job) => {
      await processor(job)
    },
    {
      connection: getConnectionOpts(),
      concurrency: 5,
    }
  )
}
