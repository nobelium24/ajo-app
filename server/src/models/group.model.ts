import mongoose from "mongoose";
import bcryptjs from "bcryptjs"
import members from "./members.model";
const groupSchema = new mongoose.Schema({
    groupName: String,
    passcode: String,
    groupMembers:[members],
})

let saltRound = 15
groupSchema.pre("save", function (next) {
    if (this.passcode != undefined) {
        bcryptjs.hash(this.passcode, saltRound, (err, hash) => {
            if (err) {
                console.log(err);
            }else{
                this.passcode = hash
                next()
            }
        })
    }
})

let groupModel = mongoose.models.group_tbs || mongoose.model("group_tbs", groupSchema)

export default groupModel