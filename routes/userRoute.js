const express=require("express");
const userRoute=express.Router();
const userController=require("../controller/userController")
const userLoggedIn=require("../middleware/UserLoggedIn")



userRoute.use(userLoggedIn)
userRoute.post("/create",userController.create)
userRoute.get("/todo",userController.getTodo)
userRoute.delete("/",userController.delete)
userRoute.post("/done",userController.markDone)

userRoute.get("/profile",userController.profile)





module.exports=userRoute