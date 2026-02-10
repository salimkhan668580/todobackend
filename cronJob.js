const { CronJob } = require("cron");
const Todo = require("./modal/TodoModal");
const User = require("./modal/UserModal");
const Notification = require("./modal/NotificationModal");
const { sendPushNotification } = require("./helper/helper");

/* =========================================================
   🌅 MORNING REMINDER
   👉 Children who DID NOT add any task today
========================================================= */
exports.morningReminderJob = new CronJob(
//   "*/1 * * * *", // ⏱ TEST MODE
  "0 5,7,9 * * *", // ✅ PROD
  async () => {
    try {
      console.log("⏰ Morning reminder cron running");

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todosToday = await Todo.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false,
      }).select("userId");

      const activeUserIds = todosToday.map(t => t.userId.toString());

      const inactiveChildren = await User.find({
        _id: { $nin: activeUserIds },
        role: "children",
        fcmToken: { $exists: true, $ne: [] },
      });

      if (!inactiveChildren.length) {
        console.log("✅ All children added task today");
        return;
      }

      const childrenIds = inactiveChildren.map(u => u._id.toString());
      const allTokens = inactiveChildren.flatMap(u => u.fcmToken);

      // ✅ SINGLE notification document
      await Notification.create({
        sendTo: childrenIds,
        title: "⏰ Task Reminder",
        description: "Aaj aapne koi task add nahi kiya. Abhi add kar lo!",
        forChild: true,
        ReminderType: "morning",
      });

      // ✅ SINGLE push call
      await sendPushNotification({
        tokens: allTokens,
        title: "⏰ Task Reminder",
        body: "Aaj aapne koi task add nahi kiya. Abhi add kar lo!",
        type: "morning",
        additionalData: {
          reminderType: "morning",
        },
      });

      console.log(`📨 Morning reminder sent to ${childrenIds.length} children`);
    } catch (error) {
      console.error("❌ Morning cron error:", error);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);

/* =========================================================
   🌙 EVENING REMINDER
   👉 Children who added task but DID NOT complete any
========================================================= */
exports.eveningReminderJob = new CronJob(
//   "*/1 * * * *", // ⏱ TEST MODE
  "0 18,20 * * *", // ✅ PROD
  async () => {
    try {
      console.log("🌙 Evening reminder cron running");

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todosToday = await Todo.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false,
      }).select("userId isDone");

      const usersWithTodo = new Set();
      const usersWithCompletedTodo = new Set();

      todosToday.forEach(todo => {
        const uid = todo.userId.toString();
        usersWithTodo.add(uid);
        if (todo.isDone) usersWithCompletedTodo.add(uid);
      });

      const targetUserIds = [...usersWithTodo].filter(
        uid => !usersWithCompletedTodo.has(uid)
      );

      if (!targetUserIds.length) {
        console.log("✅ All children completed at least one task today");
        return;
      }

      const childrenUsers = await User.find({
        _id: { $in: targetUserIds },
        role: "children",
        fcmToken: { $exists: true, $ne: [] },
      });

      if (!childrenUsers.length) return;

      const childrenIds = childrenUsers.map(u => u._id.toString());
      const allTokens = childrenUsers.flatMap(u => u.fcmToken);

      // ✅ SINGLE notification document
      await Notification.create({
        sendTo: childrenIds,
        title: "🌙 Task Pending Reminder",
        description:
          "Aapne aaj task add kiya hai, lekin abhi tak complete nahi kiya. Kripya task complete karein.",
        forChild: true,
        ReminderType: "evening",
      });

      // ✅ SINGLE push call
      await sendPushNotification({
        tokens: allTokens,
        title: "🌙 Task Pending Reminder",
        body:
          "Aapne aaj task add kiya hai, lekin abhi tak complete nahi kiya. Kripya task complete karein.",
        type: "evening",
        additionalData: {
          reminderType: "evening",
        },
      });

      console.log(`📨 Evening reminder sent to ${childrenIds.length} children`);
    } catch (error) {
      console.error("❌ Evening cron error:", error);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);
