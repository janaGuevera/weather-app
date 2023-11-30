const express = require("express");
const path = require("path");
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const ObjectId = require("mongoose").Types.ObjectId;
const sendEmail = require("../utils/email.js");

const router = express.Router();

// ================== Routes for Pages ===================
router.get("/", (req, res) => {
    if(req.session.user){
        req.session.user = undefined;
    }
    
    res.render("index");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/confirm_email", async (req, res) => {
    const userId = req.query.userid;

    try{
        const user = await User.findByIdAndUpdate(
            userId, 
            {isEmailValidated: true},
            {new: true}
        )

        res.redirect("/");
    }catch(e){
        res.redirect("/?error=" + e.message);
    }
});

router.get("/users/profile", auth, (req, res) => {
    res.render("profile", {user: req.session.user});
});


//  ============== API Resources for User Model =====================
router.post("/api/users/login", async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if(user){
            if(user.isEmailValidated){
                req.session.user = user;
                return res.send(user);
            }

            return res.send({error: "Please confirm your email!"})
        }

        return res.send({error: "Invalid email or password!"})
    }catch(e){
        res.send({error: e.message});
    }
});

// Create user resource
router.post("/api/users", async (req, res) => {
    try{
        const user = new User(req.body);
        await user.save();

        // Send confirm email to user
        sendEmail({
            receiver: user.email,
            subject: "Confirm Your email",
            content: `<p>Please click the below link to confirm your email!</p>
                    <a href="${process.env.DOMAIN}/confirm_email?userid=${user._id}">Confirm Email</a>
            `
        });

        res.send(user);
    }catch(e){
        if(e.message.includes("E11000")){
            return res.send({error: "Email already exist!"});
        }

        res.send({error: e.message});
    }
});

// Get all users resource
router.get("/api/users", async (req, res) => {
    try{
        const users = await User.find({});
        res.send(users);
    }catch(e){
        res.send({error: e.message});
    }
});

// Get a User
router.get("/api/users/:id", async (req, res) => {
    const id = req.params.id;

    try{
        const user = await User.findById(id);
        
        if(user){
            return res.send(user);
        }

        res.send({error: "User not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});

// Update a User
router.patch("/api/users", async (req, res) => {
    try{
        if(req.files){
            const result = await User.uploadAvatar(req.files.profileImage);
    
            if(result.error){
                return res.send(result);
            }
    
            req.body.imagePath = result.fileName;
        }

        // find out the fields the user trying to update
        const updates = Object.keys(req.body);

        // Set the allowed updates
        const allowedUpdates = ["name", "age", "password", "email", "imagePath"];

        const isAllowed = updates.every((update) => {
            return allowedUpdates.includes(update);
        });

        if(!isAllowed){
            return res.send({error: "Invalid Updates"});
        }
    
        const user = await User.findById(req.session.user._id);

        if(!user){
            return res.send({error: "Unable to update. User not found!"});
        }

        const prevImagePath = user.imagePath;

        updates.forEach((update) => { 
            user[update] = req.body[update]
        });

        await user.save();
        req.session.user = user;
        res.send(user);

        if(req.body.imagePath && prevImagePath !== "profile.png"){
            User.removeAvatar(prevImagePath);
        }
    }catch(e){

        console.log(e);
        res.send({error: e.message});
    }   
});

// Delete a User
router.delete("/api/users/:id", async (req, res) => {
    const id = req.params.id;

    try{
        const user = await User.findByIdAndDelete(id);
        
        if(user){
            return res.send(user);
        }

        res.send({error: "Unable to delete. User not found!"});
    }catch(e){
        res.send({error: e.message});
    }
});


module.exports = router;