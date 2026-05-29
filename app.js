const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Task = require('./models/Task');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://nikhil:nikhil123@first.kke580f.mongodb.net/?appName=First")
.then(()=> console.log("Connected to MongoDB"))
.catch((err) => console.log(err));

let tasks = [];
// UI Routes
app.get("/signup",(req,res)=>{
    res.render("signup");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.post("/signup",async (req,res)=>{
    const {name,email,password} = req.body;
console.log(req.body)
    if(!name || !email || !password){
        return res.status(400).send("All fields are required");
    }
    // Check if user already exists
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).send("User already exists");
    }
    // Hash the password
    const hashedPassword = await bcrypt.hashSync(password, 10);
    // Create new user
    User.create({name,email,password:hashedPassword})
    .then((user) => {
        res.redirect("/login");
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Server error");
    });
})
app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).send("All fields are required");
    }
    const findUser = await User.findOne({email});
    if(!findUser){
        return res.status(400).send("Invalid credentials");
    }
    const isMatch = await bcrypt.compare(password, findUser.password);

    if(!isMatch){
        return res.status(400).send("Invalid credentials");
    }
    res.redirect("/dashboard");
})
app.get('/dashboard',(req,res)=>{
    res.redirect('/dashboard-counts');
})
app.get('/add-task',(req,res)=>{
    res.render("addTask");
})
app.get('/',(req,res)=>{
    res.redirect('/tasks');
    // res.render("index");
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
app.get("/me",async (req,res)=>{
    const users = await User.findOne({email:"nikhil@gmail.com"});
    console.log(users);
    res.render("user",{users});
})
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});