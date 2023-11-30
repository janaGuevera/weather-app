const path = require("path");
const express = require("express");
const hbs = require("hbs");
const session = require("express-session");
const fileUpload = require("express-fileupload");
require("./db/mongoose.js");

const userRouter = require("./router/user-router.js");
const taskRouter = require("./router/task-router.js");

const app = express();
const port = process.env.PORT;

app.set("view engine", "hbs");

app.use(session({secret: process.env.SESSION_SECRET, saveUninitialized: true, resave: true}));

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());

app.use((req, res, next) => {
    if(req.session.user){
        req.userId = req.session.user._id;
    }

    next();
});

app.use(userRouter);
app.use(taskRouter);

app.listen(port);