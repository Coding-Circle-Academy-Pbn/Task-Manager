const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://nikhil:nikhil123@first.kke580f.mongodb.net/?appName=First")
.then(()=> console.log("Connected to MongoDB"))
.catch((err) => console.log(err));

let tasks = [];
// UI Routes
app.get('/dashboard',(req,res)=>{
    res.redirect('/dashboard-counts');
})
app.get('/add-task',(req,res)=>{
    res.render("addTask");
})
app.get('/',(req,res)=>{
    // res.redirect('/tasks');
    res.render("index");
})
// SHOW
app.get("/tasks",async (req,res)=>{
    const tasks = await Task.find().sort({createdAt:-1});
    res.render("index",{tasks});
})

// CREATE
app.post("/tasks",async(req,res)=>{
    const {title,date} = req.body;
    await Task.create({title,date});
    // tasks.push({title:req.body.title});

    res.redirect("/tasks");
})

app.get('/dashboard-counts',async (req,res)=>{
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({completed:true});
    const pendingTasks = await Task.countDocuments({completed:false});
    const today = new Date();
    const tasksDueToday = await Task.countDocuments({
        date: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
        }
    }); 
    const formattedCounts = {
        totalTasks: totalTasks,
        completedTasks: completedTasks,
        pendingTasks: pendingTasks,
        tasksDueToday: tasksDueToday
    };
    console.log(formattedCounts);
    res.render("dashboard",{formattedCounts});
})

app.get("/task/:id", async (req,res)=>{
    const task = await Task.findById(req.params.id);
    res.render("taskDetails",{task});
})

app.post("/task/:id", async (req,res)=>{
    const {title,completed} = req.body;
let complete;
    console.log(title,completed);
    if(completed === "on"){
        complete = true;
    }else{
        complete = false;
    }
    await Task.findByIdAndUpdate(req.params.id,{title,completed:complete});
    res.redirect("/tasks");
})
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});