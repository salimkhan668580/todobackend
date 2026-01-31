
const Todo=require("../modal/TodoModal");
const mongoose = require("mongoose");
const User=require("../modal/UserModal")
const Notification=require("../modal/NotificationModal")

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

exports.create= async(req, res) => {

    try {
        const {title}=req.body;
        const userId=req.user;

        if(!title){
            return res.status(400).json({
                success: false,
                message: "Please provide title"
            })
        }
        if(!userId){
            return res.status(400).json({
                success: false,
                message: "token not found"
            })
        }
        const newTodo=await Todo.create({title,userId});
        await newTodo.save()

                
        res.status(200).json({
            success: true,
            message: "Task created successfully"
        })


        
    } catch (error) {
        console.log(error)
         res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
        
    }
   
}

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

    const userId=req.user._id


    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }


    if (todo.userId==userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    todo.isDone = true;
    todo.doneTime=Date.now();
    await todo.save();

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
exports.notification= async(req, res) => {

  try {
      const {page,limit}=req.query
      const userId=req.user._id;

      const pageNo=Number(page||"1");
      const pageLimit=Number(limit||"10");
      const skip = (pageNo - 1) * pageLimit;



      if(!userId){
          return res.status(400).json({
              success: false,
              message: "You have must login"
          })
      }

      const matcher = {
        sendTo: { $in: [userId.toString()] }
      };

      console.log(matcher)

      const notification=await Notification.aggregate([
        {
          $match:matcher
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip }, 
        { $limit: pageLimit }
      ]);

const totalDoc=await Notification.countDocuments(matcher)
              
      res.status(200).json({
        success: true,
        message: "Todos fetched successfully",
        data: notification,
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







