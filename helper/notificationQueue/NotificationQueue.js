const { Queue } = require('bullmq');
const NotificationWorker = require('./NotificationWorker');
const { connection } = NotificationWorker;
const myQueue = new Queue('notificationQueue',{connection: connection});


// async function addJobs() {
//   // await myQueue.add('notificationJob', { tokens: [], title: '', body: 'World' });
// }
// addJobs();


module.exports = myQueue;