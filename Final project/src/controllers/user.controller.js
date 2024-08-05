import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import { User } from "../models/user.models.js"
import mongoose from "mongoose";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser= asyncHandler(async (req,res) =>{
    
    const {username ,email , fullName , password} = req.body
    if(
        [username ,email , fullName , password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existuser =await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existuser){
        throw new ApiError(409,"Username or email already exists")

    }
   

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar File Is Required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const cover = coverLocalPath ? await uploadOnCloudinary(coverLocalPath) : null;
    if(!avatar){
        throw new ApiError(400,"Avatar file is reqired for cludinary")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:cover?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createduser){
        throw new ApiError(500,"Something Went Wrong in server")
    }

    return res.status(201).json(
        new ApiResponce(200,createduser,"Successfully registered")
    )
})


export {registerUser}