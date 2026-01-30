const notificationSchema = new mongoose.Schema({
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
     ReminderType: {
        type: Boolean,
        enum:["morning","evening","parentSend"],
        required: true
    },

},{timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
