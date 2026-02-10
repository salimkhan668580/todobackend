const express = require('express')
const dbConnect = require("./db/dbConnect");
const app = express()
require('dotenv').config()
const authRoute = require('./routes/Auth');
const parentRoute= require('./routes/ParentRoute');
const userRoute= require('./routes/userRoute');
const morgan = require('morgan');
const helper = require('./helper/helper');
const tokenRoute = require('./routes/TokenRoute');
const cronJob = require('./cronJob');
require('./helper/notificationQueue/NotificationWorker');
require('./helper/notificationQueue/NotificationQueue');


const port = 3000

dbConnect(); 




app.use(express.json());
app.use(morgan('dev'))
cronJob.eveningReminderJob.start();
cronJob.morningReminderJob.start();


app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/parent', parentRoute);
app.use('/api/token', tokenRoute);







app.post("/api/pushNotification", async (req, res) => {
  const { title, body, token } = req.body;

  try {
    if (!title || !body || !token) {
      return res.status(400).json({
        error: "title, body, and token are required",
      });
    }

 

    await helper.sendPushNotification({
      tokens: token, 
      title,
      body,
    });

    return res.status(200).json({
      message: "Notification has been sent",
    });
  } catch (error) {
    console.error("Push notification error:", error);
    return res.status(500).json({
      error: "Failed to send notification",
    });
  }

})





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});