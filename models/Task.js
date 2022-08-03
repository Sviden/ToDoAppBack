const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,    
    },
    description: String,
    createDate: String, 
    dateToDo: String
})

// const taskModel = mongoose.model("TaskInfo", TaskSchema );
// module.exports = taskModel;


const UserSchema = new mongoose.Schema({
  userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    tasks : [
        TaskSchema
    ]
})


const userModel = mongoose.model('User', UserSchema);
module.exports = userModel;