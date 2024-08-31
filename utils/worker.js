const { Worker } = require('bullmq');
const Mail = require('./mail');
const Order = require('../models/orderModel');
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

const orderWorker = new Worker('orderQueue', async job => {
  try {
      if (job.name === 'createOrder') {
          const {
              shippingInfo,
              orderItems,
              paymentInfo,
              itemsPrice,
              taxPrice,
              shippingPrice,
              totalPrice,
              paidAt,
              user
          } = job.data;

          const order = await Order.create({
              shippingInfo,
              orderItems,
              paymentInfo,
              itemsPrice,
              taxPrice,
              shippingPrice,
              totalPrice,
              paidAt,
              user
          });

          console.log('Order created:', order._id);
      }
  } catch (error) {
      console.error('Error processing order creation:', error);
  }
}, {
  connection: redis
});

module.exports = {emailWorker,orderWorker};
