// helper/notificationQueue/NotificationWorker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

const Notification = require('../../modal/NotificationModal');
const User = require('../../modal/UserModal');         // adjust path to your User model
const { sendPushNotification } = require('../helper'); // adjust path if different

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null,
});

const notificationWorker = new Worker(
  'notificationQueue',
  async (job) => {
    const { notificationId } = job.data;
    if(notificationId=="test-fail"){
      throw new Error("Intentional failure for testing");
    }

    console.log('Notification job received:', job.data);

    // 1️⃣ Load notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      console.warn('Notification not found:', notificationId);
      return;
    }

    // 2️⃣ Fetch recipients by IDs in sendTo
    const recipients = await User.find({
      _id: { $in: notification.sendTo },
    });

    const tokens = recipients
      .flatMap((u) => u.fcmToken || [])
      .filter(Boolean);

    if (tokens.length === 0) {
      console.log('No FCM tokens for notification', notificationId);
      await Notification.findByIdAndUpdate(notificationId, { status: 'FAILED' });
      return;
    }

    // 3️⃣ Send push notification
    await sendPushNotification({
      tokens,
      title: notification.title,
      body: notification.description,
    });

    // 4️⃣ Update status to SENT

  },
  { connection },
);

notificationWorker.on('completed', async (job) => {
  const { notificationId } = job.data;
  await Notification.findByIdAndUpdate(notificationId, { status: 'SENT' });
  console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', async (job, error) => {
  const { notificationId } = job.data;
  await Notification.findByIdAndUpdate(notificationId, { status: 'FAILED' });
  console.log(`Notification job ${job.id} failed with error: ${error.message}`);
});

module.exports = { notificationWorker, connection };