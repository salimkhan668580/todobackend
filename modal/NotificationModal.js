
const mongoose=require("mongoose")

const notificationSchema = new mongoose.Schema({
    sendTo: {
        type: [String],
        required: true
      },      
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    forChild: {
        type: Boolean,
        required: true
    },
    senderId:{
        type:mongoose.Types.ObjectId,

    },
    isRead:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["PENDING","SENT","FAILED"],
        default:"PENDING"
    },
     ReminderType: {
        type: String,
        enum:["morning","evening","parentSend"],
        required: true
    },

},{timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
