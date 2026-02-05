
const Todo=require("../modal/TodoModal");
const mongoose = require("mongoose");
const User=require("../modal/UserModal")
const Notification=require("../modal/NotificationModal");
const logger = require("../helper/logger");



exports.saveFcm = async (req, res) => {
    try {
        const {userId, fcmToken}=req.body;
        if(!userId||!fcmToken){
            return res.status(400).json({
                sucess:false,
                message:"user id  and Fcm Token is required"
            })
        }

        const userData=await User.updateOne(
            { _id: userId },
            { $addToSet: { fcmToken: fcmToken } }
          );
        if(!userData){
            return res.status(400).json({
                sucess:false,
                message:"user not found"
            })
        }
 

       res.status(200).json({
        success:true,
        message:"FCM token save successfully"
       })
     
    } catch (error) {
      logger.error("Error while saving token", error);
  
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
