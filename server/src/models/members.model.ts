import mongoose from "mongoose";
const members = new mongoose.Schema({
   email:{type:String}
})

export default members