import mongoose, { mongo } from "mongoose";

const doctorSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    qualification:{
        type:String,
        required:true,
    },
    experience:{
        type:Number,
        default: 0
    },
    worksInHospital:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hospital"
    }]
})

export const doctor = mongoose.model("doctor",doctorSchema)