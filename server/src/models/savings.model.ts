import mongoose from "mongoose";
const savingsSchema = new mongoose.Schema({
    userName:{type:String, required:true, trim:true, unique:true},
    amountSaved:{type:Number, default:0},
    savingsName:{type:String, trim:true, required:true}
})

let savingsModel = mongoose.models.savings_tbs || mongoose.model("savings_tbs", savingsSchema)

export default savingsModel