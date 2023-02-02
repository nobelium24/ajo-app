import express from "express"
const router = express.Router()
import { registerUser, signIn, createGroup, test, joinGroup, addGroupAmount, fundWallet, forgotPasswordEmail,
     resetPassword, verifyBVN, createSavingsPlan, fundSavingsPlan, dashCheck } from "../controllers/user.controller"
import groupModel from "../models/group.model"

router.post("/signup", registerUser)
router.post("/signin", signIn)
router.post("/creategroup", createGroup)
router.post("/joingroup", joinGroup)
router.post("/grouppayment", addGroupAmount)
router.post("/fundwallet",fundWallet)
router.post("/forgotpassword", forgotPasswordEmail)
router.post("/resetpassword", resetPassword)
router.post("/verifybvn", verifyBVN)
router.post("/createsavings", createSavingsPlan)
router.post("/fundsavings", fundSavingsPlan)
router.post("/test", test)
router.get("/dashcheck", dashCheck)
router.post("/test2", (req, res) => {
    let email  = req.body.email
    let groupName  = req.body.groupName
    let passcode  = req.body.passcode
    
    let test = {groupName:groupName, passcode:passcode, groupMembers:[{email:email}]}

    // let test = {email:"123"}
    // let ram = groupModel.create({ _id: "63c6767d7baed1b53ba60f18" }, {$push:{groupMembers:test}})
    let ram = groupModel.create(test)
    console.log(res);
    
    console.log(ram);
})



export default router
