import mongoose from "mongoose";
const savingsSchema = new mongoose.Schema({
    userName:{type:String, required:true, trim:true},
    amountSaved:{type:Number}
})