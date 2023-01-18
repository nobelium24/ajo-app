import mongoose from "mongoose";
const contributions = new mongoose.Schema({
    email: String,
    amount: Number
})

export default contributions