const User=require("../modal/UserModal")
const Todo= require("../modal/TodoModal")
const mongoose=require("mongoose")

exports.getAllChildren = async (req, res) => {
    try {
      const { page, limit } = req.query;
  
      const pageNo = Number(page || 1);
      const pageLimit = Number(limit || 10);
      const skip = (pageNo - 1) * pageLimit;
  
      const matcher = { role: "children" };
  
      const children = await User.aggregate([

        { $match: matcher },

        { $sort: { createdAt: -1 } },
  

        { $skip: skip },
        { $limit: pageLimit },
  

        {
          $lookup: {
            from: "todos",          // ✅ FIX
            localField: "_id",
            foreignField: "userId",
            as: "todos"
          }
        },
  
        // 5️⃣ Calculate todo stats
        {
          $addFields: {
            totalTodos: { $size: "$todos" },
            doneTodos: {
              $size: {
                $filter: {
                  input: "$todos",
                  as: "t",
                  cond: { $eq: ["$$t.isDone", true] }
                }
              }
            },
            pendingTodos: {
              $size: {
                $filter: {
                  input: "$todos",
                  as: "t",
                  cond: { $eq: ["$$t.isDone", false] }
                }
              }
            }
          }
        },
  
        // 6️⃣ Remove sensitive / unnecessary fields
        {
          $project: {
            password: 0,
            todos: 0,
            __v: 0
          }
        }
      ]);
  
      const totalDoc = await User.countDocuments(matcher);
  
      res.status(200).json({
        success: true,
        message: "Children fetched successfully",
        data: children,
        pagination: {
          page: pageNo,
          limit: pageLimit,
          total: totalDoc,
          totalPage: Math.ceil(totalDoc / pageLimit)
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };


  exports.getChildrenDetails = async (req, res) => {
    try {
      const { userId } = req.query;
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required"
        });
      }
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId"
        });
      }
  
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const children = await User.aggregate([
        // 1️⃣ Match child
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
            role: "children"
          }
        },
  
        // 2️⃣ Lookup ONLY TODAY todos
        {
          $lookup: {
            from: "todos",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$isDeleted", false] },
                      { $gte: ["$createdAt", startOfDay] },
                      { $lte: ["$createdAt", endOfDay] }
                    ]
                  }
                }
              },
              { $sort: { createdAt: -1 } }
            ],
            as: "todos"
          }
        },
  
        // 3️⃣ Stats (ONLY TODAY TODOS)
        {
          $addFields: {
            totalTodos: { $size: "$todos" },
            doneTodos: {
              $size: {
                $filter: {
                  input: "$todos",
                  as: "t",
                  cond: { $eq: ["$$t.isDone", true] }
                }
              }
            },
            pendingTodos: {
              $size: {
                $filter: {
                  input: "$todos",
                  as: "t",
                  cond: { $eq: ["$$t.isDone", false] }
                }
              }
            }
          }
        },
  
        // 4️⃣ Clean response
        {
          $project: {
            password: 0,
            __v: 0
          }
        }
      ]);
  
      if (!children.length) {
        return res.status(404).json({
          success: false,
          message: "Child not found"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Children details fetched successfully",
        data: children[0]
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };


  exports.getChildrenTodoHistory= async (req, res) => {
    try {
      const { userId } = req.query;
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required"
        });
      }
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId"
        });
      }
  
    
      const children = await User.aggregate([
        // 1️⃣ Match child
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
            role: "children"
          }
        },
  
        // 2️⃣ Lookup ONLY TODAY todos
        {
          $lookup: {
            from: "todos",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                   
                    ]
                  }
                }
              },
              { $sort: { createdAt: -1 } }
            ],
            as: "todos"
          }
        },

  
        // 4️⃣ Clean response
        {
          $project: {
            password: 0,
            __v: 0
          }
        }
      ]);
  
      if (!children.length) {
        return res.status(404).json({
          success: false,
          message: "Child not found"
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Children details fetched successfully",
        data: children[0]
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };


  exports.addNotification=async(req, res) => {

    try {
        const {title,description,forChild,ReminderType,sendTo}=req.body;
      
  
        if(!title || !description){
            return res.status(400).json({
                success: false,
                message: "Please provide title and description"
            })
        }
  
  
  
        const newNotification=await Notification.create({title,description,forChild,ReminderType,sendTo});
        await newNotification.save()
  
                
        res.status(200).json({
            success: true,
            message: "Notification created successfully"
        })
  
  
        
    } catch (error) {
        console.log(error)
         res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
        
    }
   
  }
  


  
  
  