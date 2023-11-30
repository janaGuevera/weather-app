const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const ObjectId = mongoose.Types.ObjectId;

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        min: 1,
        default: 15
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate: function(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate: function(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("The key 'password' cannot be used as password.");
            }
        }
    },
    imagePath: {
        type: String,
        default: "profile.png"
    },
    isEmailValidated: {
        type: Boolean,
        default: false
    }
});

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 8);
    }
    
    next();
});

userSchema.statics.findByCredentials = async (email, password) => {
    // Find the user by the email
    const user = await User.findOne({email: email});

    if(!user){
        return undefined;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(isMatch){
        return user;
    }

    return undefined;
}

userSchema.statics.uploadAvatar = async (file) => {
    // Create a unqiue name for the file
    const ext = file.name.split(".").pop();
    const fileName = new ObjectId().toString() + "." + ext;

    // Allow only image files
    const allowedFiles = ["png", "jpeg", "JPEG", "jpg", "gif"];

    if(!allowedFiles.includes(ext)){
       return {error: "Please upload image files!"};
    }

    // Allow only files with the size limit
    const sizeLimit = 5 * 1024 * 1024;

    if(file.size > sizeLimit){
        return {error: "The file size should be less than 5mb"};
    }

    const filePath = path.resolve("./public/images/uploads/" + fileName);

    try{
        await file.mv(filePath);
        return {fileName: fileName}
    }catch(e){
        return {error: e.message}
    }
}

userSchema.statics.removeAvatar = (file) => {
    const filePath = path.resolve("./public/images/uploads/" + file);
    fs.unlinkSync(filePath, (e) => {
        if(e){
            console.log(e);
        }
    });
}

const User = mongoose.model("User", userSchema);

module.exports = User;


