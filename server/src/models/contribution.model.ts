import mongoose from "mongoose";
const contributions = new mongoose.Schema({
    userName: String,
    amount: {type:Number, default:0}
})

export default contributions