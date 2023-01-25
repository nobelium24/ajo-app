"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    userName: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true },
    bvnStatus: { type: Boolean, required: true, trim: true, default: false },
    wallet: { type: Number, default: 0 }
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
