import mongoose, { modelNames } from "mongoose";

const productSchema = mongoose.Schema({
name:{
    type:String,
    required:true,
},
description:{
    type:String,
    required: true
},
price:{
    type: Number,
    default:0
},
Stock:{
    type:Number,
    default:0
},
productImage:{
    type:String
},
catagory:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Catagory",
    required:true
},
owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
}
}, {timestamps:true})

export const Product = mongoose.model('Product', productSchema)