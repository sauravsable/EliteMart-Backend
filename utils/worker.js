const { Worker } = require('bullmq');
const Mail = require('./mail');

const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Redis Cloud');
});

const emailWorker = new Worker('emailQueue', async job => {
  const { email, subject, html } = job.data;
console.log(email,subject);

  Mail.sendMail({
    email,
    subject,
    html
  });

}, { connection: redis });

emailWorker.on('completed', (job) => {
  console.log(`Email sent successfully for job ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Failed to send email for job ${job.id}: ${err}`);
});

module.exports = emailWorker;
