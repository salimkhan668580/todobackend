const express=require("express");
const parentController=require("../controller/parentController")
const parentRoute=express.Router();
const parentLoggedin= require("../middleware/parentLoggedIn")

parentRoute.use(parentLoggedin)
parentRoute.get("/",parentController.getAllChildren)
parentRoute.get("/details",parentController.getChildrenDetails)
parentRoute.get("/todoHistory",parentController.getChildrenTodoHistory)
parentRoute.post("/sendNotification",parentController.addNotification)


module.exports=parentRoute