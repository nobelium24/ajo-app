const mongoose = require("mongoose")
let URI = process.env.MONGO_URI
let connection = async () => {
    await mongoose.connect(URI, (err: string) => {
        if (err) {
            console.log(err);
            console.log("connection error");
        } else {
            console.log("connection successful");

        }
    })
}
export default connection