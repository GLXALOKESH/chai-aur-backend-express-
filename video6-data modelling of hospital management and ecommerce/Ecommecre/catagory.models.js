import mongoose from "mongoose";

const catagorySchema = mongoose.Schema({
name:{
    type: String,
    minlength:3,
}
},
{timestamps:true})

export const Catagory = mongoose.model('Catagory',catagorySchema)