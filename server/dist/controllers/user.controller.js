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
exports.test = exports.joinGroup = exports.createGroup = exports.signIn = exports.registerUser = void 0;
//@ts-ignore
const user_model_1 = __importDefault(require("../models/user.model"));
const group_model_1 = __importDefault(require("../models/group.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.SECRET;
const registerUser = (req, res) => {
    const newUser = req.body;
    const email = newUser === null || newUser === void 0 ? void 0 : newUser.email;
    const userName = newUser === null || newUser === void 0 ? void 0 : newUser.userName;
    user_model_1.default.findOne({ email: email }, (err, result) => {
        if (err) {
            console.log(err);
            if (res.status != undefined) {
                res.status(501);
                res.send({ message: "Internal server error", status: false });
            }
        }
        else {
            if (result) {
                console.log(result);
                res.send({ message: "Email already exists in our database. Please, register with a new email", status: false });
            }
            else {
                user_model_1.default.findOne({ userName: userName }, (err, result2) => {
                    if (err) {
                        console.log(err);
                        if (res.status != undefined) {
                            res.status(501);
                            res.send({ message: "Internal server error", status: false });
                        }
                    }
                    else if (result2) {
                        console.log(result);
                        res.send({ message: "Username is being used by another person. Please use another username", status: false });
                    }
                    else {
                        let form = new user_model_1.default(newUser);
                        form.save((err) => {
                            if (err) {
                                console.log("an error occured");
                                res.send({ message: "user signup failed", status: false });
                            }
                            else {
                                res.send({ message: "registration successful", status: true });
                            }
                        });
                    }
                });
            }
        }
    });
};
exports.registerUser = registerUser;
const signIn = (req, res) => {
    var _a, _b;
    console.log(req.body);
    const password = (_a = req.body) === null || _a === void 0 ? void 0 : _a.password;
    const email = (_b = req.body) === null || _b === void 0 ? void 0 : _b.email;
    user_model_1.default.findOne({ email: email }, (err, user) => {
        if (err) {
            if (res.status != undefined) {
                res.status(501);
                res.send({ message: "Internal server error", status: false });
            }
        }
        else {
            if (!user) {
                res.send({ message: "Invalid Email", status: false });
            }
            else {
                if (password != undefined) {
                    bcryptjs_1.default.compare(password, user.password, (err, same) => {
                        if (err) {
                            console.log(err);
                        }
                        else if (same) {
                            if (SECRET != undefined) {
                                const token = jsonwebtoken_1.default.sign({ email }, SECRET);
                                console.log(token);
                                res.send({ message: "Welcome", token: token, status: true, result: { firstname: user.firstName, lastname: user.lastName, username: user.userName } });
                            }
                        }
                        else {
                            res.send({ message: 'invalid password', status: false });
                        }
                    });
                }
            }
        }
    });
};
exports.signIn = signIn;
const createGroup = (req, res) => {
    var _a;
    const email = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email;
    const groupName = req.body.groupName;
    const passcode = req.body.passcode;
    const newGroup = { groupName: groupName, passcode: passcode, groupMembers: [] };
    user_model_1.default.findOne({ email: email }, (err, user) => {
        if (err) {
            console.log(err);
            if (res.status != undefined) {
                res.status(501);
                res.send({ message: "Internal server error", status: false });
            }
        }
        else {
            if (!user) {
                res.send({ message: "You don't have an account with us. Kindly create an account to create an ajo group", status: false });
            }
            else {
                group_model_1.default.findOne({ groupName: groupName }, (err, result) => {
                    var _a;
                    if (err) {
                        console.log(err);
                        if (res.status != undefined) {
                            res.status(501);
                            res.send({ message: "Internal server error", status: false });
                        }
                    }
                    else if (result) {
                        res.send({ message: "Group name already in use. Please, register with a new group name", status: false });
                    }
                    else {
                        let member = { email: email };
                        (_a = newGroup.groupMembers) === null || _a === void 0 ? void 0 : _a.push(member);
                        console.log(newGroup);
                        group_model_1.default.create(newGroup);
                        res.send({ message: "Group created successfuly", status: true });
                    }
                });
            }
        }
    });
};
exports.createGroup = createGroup;
const joinGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let groupName = req.body.groupName;
    let passcode = req.body.passcode;
    try {
        yield user_model_1.default.findOne({ email: email }, (user) => {
            if (!user) {
                res.send({ message: "You don't have an account with us. Kindly create an account to join an ajo group", status: false });
            }
            else {
                group_model_1.default.findOne({ groupName: groupName }, (group) => {
                    if (!group) {
                        res.send({ message: "Group dosen't exist. kindly create a new group", status: false });
                    }
                    else {
                        try {
                            bcryptjs_1.default.compare(passcode, group.passcode, (err, same) => {
                                if (same) {
                                    group_model_1.default.updateOne({ _id: group._id }, { $push: { groupMembers: { email } } });
                                }
                            });
                        }
                        catch (error) {
                            error;
                        }
                    }
                });
            }
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.joinGroup = joinGroup;
const test = (req, res) => {
};
exports.test = test;
// module.exports = { registerUser }
