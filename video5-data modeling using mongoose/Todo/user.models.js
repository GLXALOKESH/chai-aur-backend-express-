import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
        },
        Password:{
            type:String,
            required:true,
        }
    },
    {timestamp:true}
)

export const User = mongoose.model("User", userSchema)