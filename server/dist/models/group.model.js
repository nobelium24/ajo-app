"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const members_model_1 = __importDefault(require("./members.model"));
const contribution_model_1 = __importDefault(require("./contribution.model"));
const groupSchema = new mongoose_1.default.Schema({
    groupName: { type: String, required: true, unique: true, trim: true },
    passcode: { type: String, trim: true },
    groupMembers: [members_model_1.default],
    generalAmount: [contribution_model_1.default],
    groupWallet: { type: Number, default: 0 }
});
let saltRound = 15;
groupSchema.pre("save", function (next) {
    if (this.passcode != undefined) {
        bcryptjs_1.default.hash(this.passcode, saltRound, (err, hash) => {
            if (err) {
                console.log(err);
            }
            else {
                this.passcode = hash;
                next();
            }
        });
    }
});
let groupModel = mongoose_1.default.models.group_tbs || mongoose_1.default.model("group_tbs", groupSchema);
exports.default = groupModel;
