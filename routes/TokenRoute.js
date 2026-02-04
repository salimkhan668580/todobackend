const express=require("express");
const tokenController=require("../controller/tokenController")
const tokenRoute=express.Router();


tokenRoute.post("/save",tokenController.saveFcm)

module.exports=tokenRoute;
