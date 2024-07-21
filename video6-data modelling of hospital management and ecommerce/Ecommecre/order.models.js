import mongoose, { mongo } from "mongoose";
const orderItemSchema= mongoose.Schema({
    productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        type: Number,
        default:0
    }
})
const orderSchema = mongoose.Schema({
    orderPrice:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    Status:{
        type:String,
        enum: ['PENDING', 'CANCELLED', 'DELIVERED'],
      default: 'PENDING',
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"  
    },
    orderItems:[orderItemSchema]

},
{timestamps:true})

export const Order = mongoose.model("Order",orderSchema)