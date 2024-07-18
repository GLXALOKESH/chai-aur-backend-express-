import mongoose, { models, mongo } from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        content:{
            type:String,
            required : true,
        },
        complete:{
            type: Boolean,
            default:false,
        },
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        subtodos:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Subtodo"
        },]

    },
    {timestamps:true}
)

export const Todo = mongoose.model("Todo",todoSchema);