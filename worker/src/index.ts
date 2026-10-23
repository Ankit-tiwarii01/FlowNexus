import 'dotenv/config';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker('workflow-executions', async (job) => {
  // Execution engines are introduced after the Part 1 workflow-authoring foundation.
  console.info(`[worker] Received ${job.name} job ${job.id}`, job.data);
  return { acceptedAt: new Date().toISOString() };
}, { connection, concurrency: 5 });

worker.on('completed', (job) => console.info(`[worker] Job ${job.id} completed`));
worker.on('failed', (job, error) => console.error(`[worker] Job ${job?.id} failed`, error));

async function shutdown(signal: string) {
  console.info(`[worker] ${signal} received; shutting down.`);
  await worker.close(); await connection.quit(); process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
