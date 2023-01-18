import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    password: String,
    wallet:Array
})

let saltRound = 10
userSchema.pre("save", function (next) {
    if (this.password != undefined) {
        bcryptjs.hash(this.password, saltRound, (err, hash) => {
            if (err) {
                console.log(err, "Error occured");

            }else{
                this.password = hash
                console.log(hash);
                next()
            }
        })
    }
})

let userModel = mongoose.models.user_tbs || mongoose.model("user_tbs", userSchema)

export default userModel