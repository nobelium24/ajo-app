//@ts-ignore
import express from "express"
const app = express()
import cors from "cors"
require("dotenv").config()

import router from "./routes/user.route"
import bodyParser from "body-parser"
import morgan from "morgan"
app.use(bodyParser.urlencoded({ extended: true, limit: "70mb" }))
app.use(bodyParser.json({ limit: "70mb" }))
app.use(cors({ origin: "*" }))
app.use("/users", router)
const URI = process.env.MONGO_URI
app.use(morgan("dev"))
import mongoose from "mongoose"
if (URI != undefined) {
    mongoose.set("strictQuery", false)
    mongoose.connect(URI, (err) => {
        if (err) {
            console.log(err, "Connection error");
        } else {
            console.log("Connection successful");
        }
    })
}

import { Request, Response, NextFunction } from "express";


app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).send({status:"Not found"})
    next()
})

app.listen(4000, () => {
    console.log("Server Started");
})