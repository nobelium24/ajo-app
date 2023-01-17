"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
require("dotenv").config();
const user_route_1 = __importDefault(require("./routes/user.route"));
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "70mb" }));
app.use(body_parser_1.default.json({ limit: "70mb" }));
app.use((0, cors_1.default)({ origin: "*" }));
app.use("/users", user_route_1.default);
const URI = process.env.MONGO_URI;
app.use((0, morgan_1.default)("dev"));
const mongoose_1 = __importDefault(require("mongoose"));
if (URI != undefined) {
    mongoose_1.default.set("strictQuery", false);
    mongoose_1.default.connect(URI, (err) => {
        if (err) {
            console.log(err, "Connection error");
        }
        else {
            console.log("Connection successful");
        }
    });
}
app.use((req, res, next) => {
    res.status(404).send({ status: "Not found" });
    next();
});
app.listen(4000, () => {
    console.log("Server Started");
});
