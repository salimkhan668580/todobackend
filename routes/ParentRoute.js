const express=require("express");
const parentController=require("../controller/parentController")
const parentRoute=express.Router();
const parentLoggedin= require("../middleware/parentLoggedIn")

parentRoute.use(parentLoggedin)
parentRoute.get("/",parentController.getAllChildren)


module.exports=parentRoute