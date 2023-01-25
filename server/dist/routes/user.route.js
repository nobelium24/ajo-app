"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_controller_1 = require("../controllers/user.controller");
const group_model_1 = __importDefault(require("../models/group.model"));
router.post("/signup", user_controller_1.registerUser);
router.post("/signin", user_controller_1.signIn);
router.post("/creategroup", user_controller_1.createGroup);
router.post("/joingroup", user_controller_1.joinGroup);
router.post("/grouppayment", user_controller_1.addGroupAmount);
router.post("/fundwallet", user_controller_1.fundWallet);
router.post("/forgotpassword", user_controller_1.forgotPasswordEmail);
router.post("/resetpassword", user_controller_1.resetPassword);
router.post("/verifybvn", user_controller_1.verifyBVN);
router.post("/createsavings", user_controller_1.createSavingsPlan);
router.post("/fundsavings", user_controller_1.fundSavingsPlan);
router.post("/test", user_controller_1.test);
router.post("/test2", (req, res) => {
    let email = req.body.email;
    let groupName = req.body.groupName;
    let passcode = req.body.passcode;
    let test = { groupName: groupName, passcode: passcode, groupMembers: [{ email: email }] };
    // let test = {email:"123"}
    // let ram = groupModel.create({ _id: "63c6767d7baed1b53ba60f18" }, {$push:{groupMembers:test}})
    let ram = group_model_1.default.create(test);
    console.log(res);
    console.log(ram);
});
exports.default = router;
