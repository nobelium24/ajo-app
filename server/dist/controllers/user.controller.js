"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashCheck = exports.fundSavingsPlan = exports.createSavingsPlan = exports.verifyBVN = exports.resetPassword = exports.test = exports.forgotPasswordEmail = exports.fundWallet = exports.addGroupAmount = exports.joinGroup = exports.createGroup = exports.signIn = exports.registerUser = void 0;
//@ts-ignore
const user_model_1 = __importDefault(require("../models/user.model"));
const group_model_1 = __importDefault(require("../models/group.model"));
const savings_model_1 = __importDefault(require("../models/savings.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const SECRET = process.env.SECRET;
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = req.body;
    const email = newUser === null || newUser === void 0 ? void 0 : newUser.email;
    const userName = newUser === null || newUser === void 0 ? void 0 : newUser.userName;
    try {
        yield user_model_1.default.findOne({ email: email }, (err, result) => {
            if (err) {
                console.log(err);
                if (res.status != undefined) {
                    res.status(500).send({ message: "Internal server error", status: false });
                }
            }
            else {
                if (result) {
                    console.log(result);
                    res.status(409).send({ message: "Email already exists in our database. Please, register with a new email", status: false });
                }
                else {
                    user_model_1.default.findOne({ userName: userName }, (err, result2) => {
                        if (err) {
                            console.log(err);
                            if (res.status != undefined) {
                                res.status(500).send({ message: "Internal server error", status: false });
                            }
                        }
                        else if (result2) {
                            console.log(result);
                            res.status(409).send({ message: "Username is being used by another person. Please use another username", status: false });
                        }
                        else {
                            let form = new user_model_1.default(newUser);
                            form.save((err) => {
                                if (err) {
                                    console.log("an error occured", err);
                                    res.status(500).send({ message: "user signup failed", status: false });
                                }
                                else {
                                    res.status(201).send({ message: "registration successful", status: true });
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.registerUser = registerUser;
const signIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let password = req.body.password;
    let email = req.body.email;
    let userName = req.body.userName;
    try {
        yield user_model_1.default.findOne({
            $or: [
                { email: email },
                { userName: userName },
            ]
        }).then((user) => {
            if (!user) {
                res.status(400).send({ message: "Invalid email or username", status: false });
            }
            else {
                if (password != undefined) {
                    try {
                        bcryptjs_1.default.compare(password, user.password).then((result) => {
                            switch (result) {
                                case result:
                                    if (SECRET != undefined) {
                                        const token = jsonwebtoken_1.default.sign({ email, userName }, SECRET, { expiresIn: "128h" });
                                        console.log(token);
                                        res.status(200).send({
                                            message: "Welcome", token: token, status: true,
                                            result: { firstName: user.firstName, lastName: user.lastName, userName: user.userName }
                                        });
                                    }
                                    break;
                                case !result:
                                    res.status(400).send({ message: 'invalid password', status: false });
                                default:
                                    break;
                            }
                        });
                    }
                    catch (error) {
                        res.status(500).send({ message: "Internal server error", status: false });
                        return next(error);
                    }
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.signIn = signIn;
const dashCheck = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (auth != undefined) {
            const token = auth.split(' ')[1];
            // console.log(request.headers.authorization)
            // const token = request.token
            console.log(token);
            if (SECRET != undefined) {
                jsonwebtoken_1.default.verify(token, SECRET, (err, decoded) => {
                    if (err) {
                        console.log(err.message);
                        res.status(401).send({ message: "Unauthorized" });
                    }
                    else {
                        console.log(decoded);
                        if (decoded != undefined) {
                            res.status(200).send({ message: 'verification successful', status: true });
                        }
                    }
                });
            }
        }
    }
    catch (error) {
        res.status(500).send({ message: "internal server error", status: false });
        return next(error);
    }
};
exports.dashCheck = dashCheck;
const createGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userName = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userName;
    const groupName = req.body.groupName;
    const passcode = req.body.passcode;
    const newGroup = { groupName: groupName, passcode: passcode, groupMembers: [] };
    try {
        yield user_model_1.default.findOne({ userName: userName }, (err, user) => {
            if (err) {
                console.log(err);
                if (res.status != undefined) {
                    res.status(501).send({ message: "Internal server error", status: false });
                }
            }
            else {
                if (!user) {
                    res.status(401).send({ message: "You don't have an account with us. Kindly create an account to create an ajo group", status: false });
                }
                else {
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can create a group", status: false });
                    }
                    else {
                        group_model_1.default.findOne({ groupName: groupName }, (err, result) => {
                            var _a;
                            if (err) {
                                console.log(err);
                                if (res.status != undefined) {
                                    res.status(501).send({ message: "Internal server error", status: false });
                                }
                            }
                            else if (result) {
                                res.status(409).send({ message: "Group name already in use. Please, register with a new group name", status: false });
                            }
                            else {
                                let member = { userName: userName };
                                (_a = newGroup.groupMembers) === null || _a === void 0 ? void 0 : _a.push(member);
                                console.log(newGroup);
                                group_model_1.default.create(newGroup).then((ram) => {
                                    ram ? group_model_1.default.findOne({ groupName: groupName }).then((group) => {
                                        group ? group_model_1.default.updateOne({ _id: group._id }, { $push: { generalAmount: { userName: userName, amount: 0 } } }).then((ram) => {
                                            ram ? res.status(201).send({ message: "Group created successfully", status: true }) :
                                                res.status(500).send({ message: "Group creation failed. Try again", status: false });
                                        }) :
                                            res.status(404).send({ message: "group not in existence" });
                                    }) : res.status(404).send({ message: "group not in existence" });
                                });
                                // res.send({ message: "Group created successfuly", status: true })
                            }
                        });
                    }
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.createGroup = createGroup;
const joinGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = req.body.userName;
    let groupName = req.body.groupName;
    let passcode = req.body.passcode;
    try {
        yield user_model_1.default.findOne({ userName: userName }).then((user) => {
            if (!user) {
                res.status(401).send({ message: "You don't have an account with us. Kindly create an account to join an ajo group", status: false });
            }
            else {
                if (user.bvnStatus === false) {
                    res.status(406).send({ message: "You have to verify your BVN before you can join a group", status: false });
                }
                else {
                    group_model_1.default.findOne({ groupName: groupName }, (err, group) => {
                        console.log(group);
                        if (err) {
                            console.log(err);
                            res.status(500).send({ message: "Internal server error", status: false });
                        }
                        else if (!group) {
                            res.status(404).send({ message: "Group dosen't exist. kindly create a new group", status: false });
                        }
                        else {
                            try {
                                if (group.passcode != undefined) {
                                    bcryptjs_1.default.compare(passcode, group.passcode, (err, same) => {
                                        var _a;
                                        if (same) {
                                            try {
                                                (_a = group.groupMembers) === null || _a === void 0 ? void 0 : _a.map((i) => {
                                                    if (i.userName == userName) {
                                                        res.status(208).send({ message: "You are already in this group", status: false });
                                                    }
                                                    else {
                                                        group_model_1.default.updateOne({ _id: group._id }, { $push: { groupMembers: { userName: userName } } })
                                                            .then((ram) => {
                                                            console.log(ram);
                                                            switch (ram.acknowledged) {
                                                                case true:
                                                                    group_model_1.default.updateOne({ _id: group._id }, { $push: { generalAmount: { userName: userName, amount: 0 } } }).then((ram) => {
                                                                        ram ? res.status(200).send({ message: "Added to group successfuly", status: true }) :
                                                                            res.status(500).send({ message: "You were unable to join group. Try again", status: false });
                                                                    });
                                                                    break;
                                                                case false:
                                                                    res.status(500).send({ message: "You were unable to join group. Try again", status: false });
                                                                    break;
                                                                default:
                                                                    break;
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            catch (err) {
                                                return err;
                                            }
                                        }
                                    });
                                }
                            }
                            catch (error) {
                                res.status(500).send({ message: "Internal server error", status: false });
                                return next(error);
                            }
                        }
                    });
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.joinGroup = joinGroup;
const addGroupAmount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let amount = req.body.amount;
    let groupName = req.body.groupName;
    let userName = req.body.userName;
    try {
        yield user_model_1.default.findOne({ userName }).then((user) => {
            if (!user) {
                res.status(401).send({ message: "You don't have an account with us", status: false });
            }
            else {
                if (user.bvnStatus === false) {
                    res.status(406).send({ message: "You have to verify your BVN before you can make a contribution", status: false });
                }
                else {
                    try {
                        group_model_1.default.findOne({ groupName: groupName }).then((group) => {
                            if (!group) {
                                res.status(404).send({ message: "You can't make payment as you do not belong to a group", status: false });
                            }
                            else {
                                let newFund = user.wallet - amount;
                                if (newFund < 0) {
                                    res.status(404).send({ message: "Insufficient funds. Please fund wallet", status: false });
                                }
                                else {
                                    user_model_1.default.updateOne({ _id: user._id }, { $set: { wallet: newFund } }).then((ram) => {
                                        console.log(ram);
                                        switch (ram.acknowledged) {
                                            case true:
                                                if (group.generalAmount != undefined) {
                                                    let updatedContribution = group.generalAmount[0].amount + amount;
                                                    console.log(updatedContribution);
                                                    let updatedGroupWallet = group.groupWallet + amount;
                                                    group_model_1.default.updateOne({ _id: group._id }, { $set: { groupWallet: updatedGroupWallet } }).then((ram) => {
                                                        console.log(ram);
                                                    });
                                                    group_model_1.default.updateOne({ _id: group._id, "generalAmount.userName": user.userName }, { $set: { "generalAmount.$.amount": updatedContribution } })
                                                        .then((ram) => {
                                                        console.log(ram);
                                                        switch (ram.acknowledged) {
                                                            case true:
                                                                res.status(201).send({ message: "Payment made successfuly", status: true });
                                                                break;
                                                            case false:
                                                                let reversedFunds = user.wallet + amount;
                                                                user_model_1.default.updateOne({ _id: user._id }, { $set: { wallet: reversedFunds } }).
                                                                    then((goat) => {
                                                                    goat.acknowledged ?
                                                                        res.status(200).send({ message: "Payment failed. Money reversed successlully", status: false }) :
                                                                        res.status(500).send({ message: "Payment failed. Reversal failed. Contact admin", status: false });
                                                                });
                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                    });
                                                }
                                                break;
                                            case false:
                                                res.status(500).send({ message: "Payment failed", status: false });
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                }
                            }
                        });
                    }
                    catch (error) {
                        res.status(501).send({ message: "Internal server error", status: false });
                        return next(error);
                    }
                }
            }
        });
    }
    catch (error) {
        return error;
    }
});
exports.addGroupAmount = addGroupAmount;
const fundWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const fund = req.body.fund;
    const userName = req.body.userName;
    try {
        yield user_model_1.default.findOne({ userName: userName }).then((user) => {
            if (!user) {
                res.status(401).send({ message: "Account not found", status: false });
            }
            else {
                if (user.bvnStatus === false) {
                    res.status(406).send({ message: "You have to verify your BVN before you can fund wallet", status: false });
                }
                else {
                    let newFund = user.wallet + fund;
                    user_model_1.default.updateOne({ _id: user._id }, { $set: { wallet: newFund } })
                        .then((ram) => {
                        console.log(ram);
                        switch (ram.acknowledged) {
                            case true:
                                res.status(201).send({ message: "Wallet funded successfully", status: true });
                                break;
                            case false:
                                res.status(500).send({ message: "Payment failed", status: false });
                                break;
                            default:
                                break;
                        }
                    });
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.fundWallet = fundWallet;
const codeGenerator = () => {
    let code = Math.floor(Math.random() * 999999) + 100000;
    return code;
};
const code = codeGenerator();
const forgotPasswordEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, } = req.body;
    try {
        yield user_model_1.default.findOne({ email: email }).then((user) => {
            if (!user) {
                res.status(401).send({ message: "You don't have an account with us. Kindly create an account to join an ajo group", status: false });
            }
            else {
                if (SECRET != undefined) {
                    let token = jsonwebtoken_1.default.sign({ email }, SECRET, { expiresIn: 300 });
                    const contactTemplate = `<div>
                        <div>
                          <h2 style="color:#2036ea ;">Message Title:-Password Reset</h2>
                           <p>
                            
                           </p>
                        </div>
                        <ul>
                         <li>Name : ${userName}</li>
                         <li>Email: ${email}</li>
                        </ul>
                        <div>
                          <h2 style="color:#2036ea ;">Message :-</h2>
                          <p>
                            Dear ${userName}, kindly input the code:(${token}) to change your password. 
                            This code will expire in 5 minutes. Please don't share with anyone.
                          </p>
                        </div>
                        <p style="color:#2036ea ;"><i>KIK cosmetics.</i></p>
                        </div>
                        `;
                    let mail = process.env.GMAIL;
                    let pws = process.env.PASSWORD;
                    let transporter = nodemailer_1.default.createTransport({
                        service: "gmail",
                        auth: {
                            user: mail,
                            pass: pws
                        }
                    });
                    let mailOptions = {
                        from: "",
                        to: `${email}`,
                        subject: "KIK COSMETICS ?????? Support Message",
                        text: "Reset password",
                        html: contactTemplate,
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                            res.status(500).send({ message: "Internal Server Error!!!", status: false });
                        }
                        else {
                            res.status(200).send({
                                message: "Check your mail box",
                                status: true,
                            });
                        }
                    });
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.forgotPasswordEmail = forgotPasswordEmail;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let token = req.body.token;
    const token2 = token.split(' ')[1];
    let password = req.body.password;
    let salt = bcryptjs_1.default.genSaltSync(10);
    let hash = bcryptjs_1.default.hashSync(password, salt);
    console.log(hash);
    try {
        yield user_model_1.default.findOne({ email: email }).then((user) => {
            if (!user) {
                res.status(401).send({ message: "You don't have an account with us.", status: false });
            }
            else {
                if (SECRET != undefined) {
                    jsonwebtoken_1.default.verify(token2, SECRET, (decoded) => {
                        if (!decoded) {
                            res.status(401).send({ message: "Invalid or expired token", status: false });
                        }
                        else {
                            user_model_1.default.updateOne({ _id: user._id }, { $set: { password: hash } })
                                .then((ram) => {
                                console.log(ram);
                                switch (ram.acknowledged) {
                                    case true:
                                        res.status(201).send({ message: "Password changed successfuly", status: true });
                                        break;
                                    case false:
                                        res.status(409).send({ message: "Password changed failed", status: false });
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.resetPassword = resetPassword;
const verifyBVN = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = req.body.userName;
    let status = req.body.status;
    try {
        yield user_model_1.default.findOne({ userName: userName }).then((user) => {
            switch (user) {
                case !user:
                    res.status(401).send({ message: "You don't have an account with us.", status: false });
                    break;
                case user:
                    if (status != undefined) {
                        if (user.bvnStatus === true) {
                            res.status(200).send({ message: "BVN already verified", status: true });
                        }
                        else {
                            if (status === "success") {
                                user_model_1.default.updateOne({ _id: user._id }, { $set: { bvnStatus: true } })
                                    .then((ram) => {
                                    console.log(ram);
                                    switch (ram.acknowledged) {
                                        case true:
                                            res.status(200).send({ message: "BVN verification Sccessful", status: true });
                                            break;
                                        case false:
                                            res.status(409).send({ message: "BVN status not recorded. Try again", status: false });
                                            break;
                                        default:
                                            break;
                                    }
                                });
                            }
                        }
                    }
                default:
                    break;
            }
        });
    }
    catch (error) {
        res.status(501).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.verifyBVN = verifyBVN;
const createSavingsPlan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let newPlan = req.body;
    // let savingsName = req.body.savingsName
    let userName = req.body.userName;
    try {
        yield user_model_1.default.findOne({ userName: userName }).then((user) => {
            switch (user) {
                case !user:
                    res.status(401).send({ message: "You don't have an account with us.", status: false });
                    break;
                case user:
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can create a savings plan", status: false });
                    }
                    else {
                        savings_model_1.default.findOne({ userName: userName }).then((save) => {
                            if (save) {
                                res.status(200).send({ message: "You already have a savings plan.", status: false });
                            }
                            else {
                                let form = new savings_model_1.default(newPlan);
                                form.save((err) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send({ message: "Plan creation failed. Try again", status: false });
                                    }
                                    else {
                                        res.status(201).send({ message: "Plan creation successful", status: true });
                                    }
                                });
                            }
                        });
                    }
                default:
                    break;
            }
        });
    }
    catch (error) {
        res.status(501).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.createSavingsPlan = createSavingsPlan;
const fundSavingsPlan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let savingsName = req.body.savingsName;
    let userName = req.body.userName;
    let amountSaved = req.body.amountSaved;
    try {
        yield user_model_1.default.findOne({ userName: userName }).then((user) => {
            switch (user) {
                case !user:
                    res.status(401).send({ message: "You don't have an account with us.", status: false });
                    break;
                case user:
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can fund savings plan", status: false });
                    }
                    else {
                        let newFund = user.wallet - amountSaved;
                        if (newFund < 0) {
                            res.status(404).send({ message: "Insufficient funds. Please fund wallet", status: false });
                        }
                        else {
                            user_model_1.default.updateOne({ _id: user._id }, { $set: { wallet: newFund } }).then((ram) => {
                                console.log(ram);
                                switch (ram.acknowledged) {
                                    case true:
                                        savings_model_1.default.findOne({ userName: userName }).then((found) => {
                                            if (found) {
                                                let newMoney = amountSaved + found.amountSaved;
                                                savings_model_1.default.updateOne({ _id: found._id }, { $set: { amountSaved: newMoney } })
                                                    .then((ram) => {
                                                    console.log(ram);
                                                    switch (ram.acknowledged) {
                                                        case true:
                                                            res.status(200).send({ message: "Funds saved successfuly", status: true });
                                                            break;
                                                        case false:
                                                            res.status(500).send({ message: "Funds not saved. Try again", status: false });
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                });
                                            }
                                        });
                                        break;
                                    case false:
                                        res.status(500).send({ message: "Payment failed", status: false });
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                    }
                default:
                    break;
            }
        });
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error", status: false });
        return next(error);
    }
});
exports.fundSavingsPlan = fundSavingsPlan;
const test = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.test = test;
// module.exports = { registerUser }
