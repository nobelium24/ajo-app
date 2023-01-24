import mongoose from "mongoose";
const contributions = new mongoose.Schema({
    userName: String,
    amount: Number
})

export default contributions