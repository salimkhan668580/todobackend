
const Todo=require("../modal/TodoModal");
const mongoose = require("mongoose");
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

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const todoUserId =
      todo.userId._id ? todo.userId._id.toString() : todo.userId.toString();

    const reqUserId = req.user._id.toString();

    if (todoUserId !== reqUserId) {
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

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const todoUserId =
      todo.userId._id ? todo.userId._id.toString() : todo.userId.toString();

    const reqUserId = req.user._id.toString();

    if (todoUserId !== reqUserId) {
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




