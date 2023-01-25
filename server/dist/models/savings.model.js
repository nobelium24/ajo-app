"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const savingsSchema = new mongoose_1.default.Schema({
    userName: { type: String, required: true, trim: true, unique: true },
    amountSaved: { type: Number, default: 0 },
    savingsName: { type: String, trim: true, required: true }
});
let savingsModel = mongoose_1.default.models.savings_tbs || mongoose_1.default.model("savings_tbs", savingsSchema);
exports.default = savingsModel;
