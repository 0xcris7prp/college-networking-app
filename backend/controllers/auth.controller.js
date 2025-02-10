import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";


export const signup = async (req,res) => {
    try {
        const {name, username, email, password} = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        const existingEmail = await User.findOne({email});

        if (existingEmail){
            return res.status(400).json({message: "Email Already exists"});
        }

        const existingUsername = await User.findOne({username});
        if (existingUsername){
            return res.status(400).json({message: "Username Already exists"});
       }

       //passwd contraints
       if (password.length < 8) {
            return res.status(400).json({message: "Password must be atleast 8 characters"}) 
       } 

       //hash passwd
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);

       //save new user in db
       const user = new User({
        name,
        email,
        username,
        password: hashedPassword
       });

       await user.save();

       //generate token and cookie
       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn:"3d"})
       res.cookie("jwt-token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3*24*60*60*1000,
        secure: process.env.NODE_ENV === "production" //prevent MITM attacks    
       });

       res.status(201).json({message: "User registered successfully."});

       //todo: send welcome email
       const profileUrl = process.env.CLIENT_URL + "profile/" + user.username;

       try {
            await sendWelcomeEmail(user.email, user.name, profileUrl)
       } catch (emailError) {
            console.error("Error in send welcome email block: ", emailError)
       }


    } catch (error) { 
        console.log("Error in signup controller", error.message)
    }
}

export const login = async (req,res) => {
    try {
        const {username, password} = req.body;

        //check if user exists
        const user = await User.findOne({username});
        if (!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }
        
        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        //assign jwt token
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn:'3d'});
        res.cookie("jwt-token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 3*24*60*60*1000,
            secure: process.env.NODE_ENV === "production" //prevent MITM attacks
        });

        res.status(201).json({messege: "LoggedIn Successfully"})
        
    } catch (error) {
        console.error("Error in Login controller:", error);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const logout = (req,res) => {
    res.clearCookie("jwt-token");
    res.json({message: "Logged Out Successfully"});
}

export const getCurrentUser = async (req,res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getcurrentuser controller:", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}