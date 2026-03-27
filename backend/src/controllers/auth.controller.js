import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';  
import { generateToken } from '../lib/utils.js';
import { ENV } from '../lib/env.js';
import { sendWelcomeEmail } from '../emails/emailHandlers.js';
import cloudinary from '../lib/cloudinary.js';

export const signup=async(req,res)=>{

    const {fullname,email,password}=req.body;

    try{
       if(!fullname || !email || !password){
        return res.status(400).json({message:"All fields are required"});
       }
       if(password.length<6){
        return res.status(400).json({message:"Password must be at least 6 characters"});
       }
       const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if(!emailRegex.test(email)){
        return res.status(400).json({message:"Invalid email format"});
       }

       const user= await User.findOne({email});
         if(user){
            return res.status(400).json({message:"User already exists"});
         }
    
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

         const newUser= new User({username:fullname,email,password:hashedPassword});

        if(newUser){
           const savedUser= await newUser.save();
           generateToken(res,savedUser._id);

            res.status(201).json({_id:newUser._id,username:newUser.username,email:newUser.email,profilePic:newUser.profilePic});

            try{
                await sendWelcomeEmail(savedUser.email,savedUser.fullname,ENV.CLIENT_URL);
            }catch(err){
                console.error("Error sending welcome email:",err);
            }

        }else{
            res.status(400).json({message:"Failed to create user"});
        }


    }catch(err){
        console.log("Error in signup controller:",err);
        res.status(500).json({message:"Internal server error"});

    }
};


export const login=async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"Email and password are required"});
    }

    try{
      const user= await User.findOne({email});
      if(!user){
        return res.status(400).json({message:"Invalid credentials"});
      }
      const isPasswordCorrect= await bcrypt.compare(password,user.password);
      if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid credentials"});
      }
        generateToken(res,user._id);

        res.status(200).json({_id:user._id,fullName:user.fullName,email:user.email,profilePic:user.profilePic});
    }catch(err){
      console.error("Error in login controller:",err);
      res.status(500).json({message:"Internal server error"});
    }
};

export const logout=(_,res)=>{
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message:"Logged out successfully"});
};

export const updateProfile=async(req,res)=>{
    try{
        const {profilePic}=req.body;
        if(!profilePic){
            return res.status(400).json({message:"Profile picture is required"});
        }

        const userId=req.user._id;
       const uploadResponse= await cloudinary.uploader.upload(profilePic)
        
       const updatedUser= await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true}).select("-password");

       res.status(200).json(updatedUser); 


    }catch(err){
       console.error("Error in update profile controller:",err);
       res.status(500).json({message:"Internal server error"});
    }
};
