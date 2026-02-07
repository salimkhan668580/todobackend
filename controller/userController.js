
const Todo=require("../modal/TodoModal");
const mongoose = require("mongoose");
const User=require("../modal/UserModal")
const Notification=require("../modal/NotificationModal");
const { sendPushNotification } = require("../helper/helper");

exports.getTodo= async(req, res) => {

    try {
        const {day,page,limit}=req.query
        const userId=req.user;

        const pageNo=Number(page||"1");
        const pageLimit=Number(limit||"10");
        const skip = (pageNo - 1) * pageLimit;
  
  
  
        if(!userId){
            return res.status(400).json({
                success: false,
                message: "You have must login"
            })
        }

        const matcher={
          userId: new mongoose.Types.ObjectId(userId),
      
        }

        if(day=="today"){
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
        
          matcher.createdAt= {
            $gte: startOfDay,
            $lte: endOfDay
          };

          matcher.isDeleted=false
          
        }
         

        const newTodo=await Todo.aggregate([
          {
            $match:matcher
          },
          { $sort: { createdAt: -1 } },
          { $skip: skip }, 
          { $limit: pageLimit }
        ]);

 const totalDoc=await Todo.countDocuments(matcher)
                
        res.status(200).json({
          success: true,
          message: "Todos fetched successfully",
          data: newTodo,
          pagination:{

            page: pageNo,
            limit: pageLimit,
            total:totalDoc,
            totalPage: Math.ceil(totalDoc / pageLimit)

          }
          
        });
    

        
    } catch (error) {
        console.log(error)
         res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
        
    }
   
}

exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    const user = req.user; // 👈 full user object

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please provide title",
      });
    }

    if (!user || !user._id) {
      return res.status(400).json({
        success: false,
        message: "User not found from token",
      });
    }

    /* ===============================
       1️⃣ Create Todo
    =============================== */
    const newTodo = await Todo.create({
      title,
      userId: user._id,
    });

    /* ===============================
       2️⃣ Find parent by email
    =============================== */
    const parentEmails = [
  "mkkhan@gmail.com",
  "ujalakhan235@gmail.com",
  "salim@gmail.com"
];
const parents = await User.find({
  email: { $in: parentEmails }
});

  //  3️⃣ Extract userIds

const parentIds = parents.map(p => p._id.toString());

    /* ===============================
       3️⃣ Save notification in DB
    =============================== */
   if (parentIds.length > 0) {
  const bodyData = {
    title: `${user.name} added a new task`,
    description: title,
    forChild: false,
    ReminderType: "parentSend",
    sendTo: parentIds,
  };
    await Notification.create(bodyData);

      /* ===============================
         4️⃣ Extract FCM tokens safely
      =============================== */
      const fcmTokens = Array.isArray(parent.fcmToken)
        ? parent.fcmToken
        : [];

      const uniqueTokens = [...new Set(fcmTokens)];

      console.log("✅ Parent FCM Tokens:", uniqueTokens);

      /* ===============================
         5️⃣ Send push notification
      =============================== */
      if (uniqueTokens.length > 0) {
        await sendPushNotification({
          tokens: uniqueTokens,
          title: `${user.name} added a new task`,
          body: title,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Task created successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


exports.delete = async (req, res) => {
  try {
    const { todoId } = req.body;
    const userId=req.user._id

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (!todo.userId.equals(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    todo.isDeleted = true;
    await todo.save();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.markDone = async (req, res) => {
  try {
    const { todoId } = req.body;

    const todo = await Todo.findById(todoId);
    const userId = req.user._id;

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (todo.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Mark task done
    todo.isDone = true;
    todo.doneTime = Date.now();
    await todo.save();

    /* ===============================
       1️⃣ Parents find by EMAIL
    =============================== */
    const parents = await User.find({
      email: { $in: ["mkkhan@gmail.com", "salim@gmail.com"] },
    });

    /* ===============================
       2️⃣ Extract FCM tokens safely
    =============================== */
    const fcmTokens = parents
      .flatMap(user => user.fcmToken || [])
      .filter(Boolean);

    const uniqueTokens = [...new Set(fcmTokens)];

    console.log("✅ Parent FCM Tokens:", uniqueTokens);

    /* ===============================
       3️⃣ Save notification in DB
    =============================== */
    const bodyData = {
      title: `${req.user.name} completed a task`,
      description: todo.title,
      forChild: false,
      ReminderType: "parentSend",
      sendTo: parents.map(p => p._id.toString()),
    };

    const newNotification = await Notification.create(bodyData);

    /* ===============================
       4️⃣ Send push notification
    =============================== */
    if (uniqueTokens.length > 0) {
      await sendPushNotification({
        tokens: uniqueTokens,
        title: `${req.user.name} completed a task`,
        body: todo.title,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task done successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.profile=async (req,res)=>{
  try {
    const {_id}=req.user
    const matcher={
      _id: new mongoose.Types.ObjectId(_id)
    }

    const userAggregation = await User.aggregate([
      {
        $match: matcher
      },
      {
        $project: {
          password: 0,
          role: 0
        }
      },
      {
        $lookup: {
          from: "todos",
          localField: "_id",
          foreignField: "userId",
          as: "todoDetails"
        }
      },
      {
        $facet: {
          userDetails: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                image: 1,
               
              }
            },
          
          ],

          stats: [
            { $unwind: "$todoDetails" },
            {
              $group: {
                _id: null,
                doneCount: {
                  $sum: { $cond: ["$todoDetails.isDone", 1, 0] }
                },
                pendingCount: {
                  $sum: { $cond: ["$todoDetails.isDone", 0, 1] }
                }
              }
            }
          ],
         
        },
        
      },
    ]);

    const result = userAggregation[0] || {};
  
      res.status(200).json({
        status:true,
        data: {
          userDetails: result.userDetails?.[0] || {},
          stats: result.stats?.[0] || {
            doneCount: 0,
            pendingCount: 0
          }
        },
        message:"User profile fetched successfully "
      })
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }


}



// =================notification=========
exports.notification = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const userId = req.user._id;

    const pageNo = Number(page || "1");
    const pageLimit = Number(limit || "10");
    const skip = (pageNo - 1) * pageLimit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "You must login"
      });
    }

    const matcher = {
      sendTo: { $in: [userId.toString()] }
    };

    // 1️⃣ Fetch notifications
    const notifications = await Notification.aggregate([
      { $match: matcher },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageLimit }
    ]);

    // 2️⃣ Unread notifications ko read mark karo
    const notificationIds = notifications
      .filter(n => n.isRead === false)
      .map(n => n._id);

    if (notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $set: { isRead: true } }
      );
    }

    const totalDoc = await Notification.countDocuments(matcher);

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
      pagination: {
        page: pageNo,
        limit: pageLimit,
        total: totalDoc,
        totalPage: Math.ceil(totalDoc / pageLimit)
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};








