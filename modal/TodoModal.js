
const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
        
    },
    title: {
        type: String,
        required: true
    },
    isDone: {
        type: Boolean,
        default: false
    },
    doneTime:{
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
