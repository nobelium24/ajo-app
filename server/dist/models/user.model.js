"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    password: String,
    wallet: Array
});
let saltRound = 10;
userSchema.pre("save", function (next) {
    if (this.password != undefined) {
        bcryptjs_1.default.hash(this.password, saltRound, (err, hash) => {
            if (err) {
                console.log(err, "Error occured");
            }
            else {
                this.password = hash;
                console.log(hash);
                next();
            }
        });
    }
});
let userModel = mongoose_1.default.models.user_tbs || mongoose_1.default.model("user_tbs", userSchema);
exports.default = userModel;
