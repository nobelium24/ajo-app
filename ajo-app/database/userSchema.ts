import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import second from ''
let userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    password: String
})

// let saltRound = 15
// userSchema.pre("save", function (next) {
//     if (this.password != undefined) {
//         bcryptjs.hash(this.password, saltRound, (err, hashedPassword) => {
//             if (err) {
//                 console.log(err, "Error occured");
//             }
//             else {
//                 this.password = hashedPassword
//                 console.log(hashedPassword);
//                 next()
//             }
//         })
//     }
// })
userSchema.pre("save", function (next) {
    if (this.password != undefined) {
        bcrypt.hash(this.password, 15,  (err, hash) => {
            if (err) {
                console.log(err, "Error occured");
            }
            else {
               this.password = hash
               console.log(hash);
               
               next()
            }
        });
    }
})

let userModel = mongoose.models.user_tbs || mongoose.model("user_tbs", userSchema)

export default userModel