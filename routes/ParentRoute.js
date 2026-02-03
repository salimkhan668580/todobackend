const express=require("express");
const parentController=require("../controller/parentController")
const parentRoute=express.Router();
const parentLoggedin= require("../middleware/parentLoggedIn")

parentRoute.get("/stats",parentController.stats)
parentRoute.use(parentLoggedin)
parentRoute.get("/",parentController.getAllChildren)
parentRoute.get("/parentProfile",parentController.parentProfile)
parentRoute.get("/details",parentController.getChildrenDetails)
parentRoute.get("/todoHistory",parentController.getChildrenTodoHistory)
parentRoute.post("/sendNotification",parentController.addNotification)
parentRoute.get("/sendNotificationHistory",parentController.notificationSendHistory)


module.exports=parentRoute