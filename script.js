const express = require("express");
var bodyParser = require("body-parser");
var { ObjectId } = require("mongodb");
const config = require("./Config/config.json");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://sviden:wsa123456@cluster0.nkfxr.mongodb.net/toDoApp?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));

db.once("open", () => {
    console.log("database connected");
});

const quotesModel = require("./models/Quotes.js");
const userModel = require("./models/Task.js");

app.get("/randphrase", async (req, res) => {
    quotesModel.find({}, (err, result) => {
        if (err) {
            res.send(err);
        }
        res.send(result);
    });
});

app.post("/addtask", async (req, res) => {
    const taskTitle = req.body.taskTitle;
    const details = req.body.details;
    const dateToDo = req.body.dateToDo;
    const createDate = req.body.createDate;
    const userEmail = req.body.userEmail;

    const task = {
        title: taskTitle,
        description: details,
        createDate: createDate,
        dateToDo: dateToDo,
    };

    try {
       await userModel.updateOne({ email: userEmail }, { $push: { tasks: task } });
        console.log("task saved");
    } catch (error) {
        console.log(error);
    }

    res.send();
});

//get all tasks from database
app.get("/alltasks", async (req, res) => {
    const email = req.query.email;
    console.log(email);
    let response = await userModel.findOne({ email: email }).select({ tasks: 1, _id: 0 });
    const tasks = response.tasks;
    res.send(tasks);
});

//delete task

app.delete("/deletetask/:id/:mail", async (req, res) => {
    console.log(req.query);
    const id = req.params.id;
    const mail = req.params.mail;
    console.log(id);
    try {
        let response = await userModel.updateOne({ email: mail }, { $pull: { tasks: { _id: id } } });
    } catch (error) {
        res.send(error);
    }

    res.send("deleted");
});

//update task

app.put("/updatetask/:id", async (req, res) => {
    const id = req.params.id;
    const details = req.body.details;
    try {
        await userModel.updateOne(
            { "tasks._id": ObjectId(id) },
            {
                $set: {
                    "tasks.$.description": details,
                },
            }
        );
        res.send("updated");
    } catch {
        res.send("update error");
    }

    res.send();
});

//create user

app.post("/signup", async (req, res) => {
    const userName = req.body.user;
    const email = req.body.email;
    const password = req.body.password;

    const newUser = new userModel({
        userName,
        email,
        password,
    });
    try {
        const checkUser = await userModel.findOne({ email: email });
        console.log("FIND USER: ", checkUser);
        if (checkUser === null) {
            await newUser.save();
            console.log("user saved");
        } else {
            console.log("user exist");

            res.send("userExist");
        }
    } catch (error) {
        console.log(error);
    }

    res.send();
});

//Check if exist

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await userModel.findOne({ email: email, password: password });
        console.log(user);
        if (user === null) {
            res.send("User does not exist");
        } else {
            res.send(user);
        }
    } catch (e) {
        console.log(e);
    }
});

//get loged in user name

app.get("/username", async (req, res) => {
    const email = req.query.email;
    try {
        const user = await userModel.findOne({ email: email });
        console.log(user.userName + "userNAME");
        if (user) {
            res.send(user.userName);
        } else {
            res.send("user not found");
        }
    } catch (error) {
        console.log(error);
    }
});

let thePort = process.env.PORT ? process.env.PORT : 8080;
app.listen(thePort, (req, res) => {
    console.log(`server runnning on port ${thePort}`);
});