import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
    {
        subscriber:{
            type: mongoose.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type: mongoose.Types.ObjectId,
            ref:"User"
        },
    },
    {timestamps:true}
)

export const Subscription = mongoose.models("Subscription",subscriptionSchema)