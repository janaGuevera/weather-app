const express = require("express");

const Task = require("../models/task.js");
const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api_auth.js");

const router = express.Router();

//  ============== Page Routes for Task Model =====================
router.get("/tasks", auth, (req, res) => {
    res.render("tasks", {user: req.session.user});
});


//  ============== API Resources for Task Model =====================
// Create task resource
router.post("/api/tasks", apiAuth, async (req, res) => {
    try{
        const userId = req.session.user._id;
        const task = new Task(req.body);
        task.owner = userId;
        await task.save();
        res.send(task);
    }catch(e){
        res.send({error: e.message});
    }
});

// Get all tasks resource
router.get("/api/tasks", apiAuth, async (req, res) => {
    try{

        var tasks = [];

        if(req.query.search){
            tasks = await Task.find(
                {
                    owner: req.userId,
                    description: {
                    $regex:req.query.search,
                    $options: "i"
                }});
        }else{
            tasks = await Task.find({owner: req.userId});
        }
        
        res.send(tasks);
    }catch(e){
        res.send({error: e.message});
    }
});

// Get a task
router.get("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    try{
        const task = await Task.findOne({owner: req.userId, _id: id});
        
        if(task){
            return res.send(task);
        }

        res.send({error: "Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Update a Task
router.patch("/api/tasks/:id", apiAuth, async (req, res) => {
    try{
        // find out the fields the user trying to update
        const updates = Object.keys(req.body);

        // Set the allowed updates
        const allowedUpdates = ["description", "completed"];

        const isAllowed = updates.every((update) => {
            return allowedUpdates.includes(update);
        });

        if(!isAllowed){
            return res.send({error: "Invalid Updates"});
        }
    
        const task = await Task.findOneAndUpdate(
            {owner: req.userId, _id: req.params.id}, 
            req.body,
            {new: true}
        );

        if(task){
            return res.send(task);
        }

        res.send({error: "Unable to update. Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }   
});

// Delete a Task
router.delete("/api/tasks/:id", apiAuth, async (req, res) => {
    const id = req.params.id;

    try{
        const task = await Task.findOneAndDelete({owner: req.userId, _id: id});
        
        if(task){
            return res.send(task);
        }

        res.send({error: "Unable to delete. Task not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});


module.exports = router;