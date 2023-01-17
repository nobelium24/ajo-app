// import { message } from "antd";
import connection from "../../database/connection";
import userModel from "../../database/userSchema";
connection()



interface Response {
    send(arg0: {
        message: string,
        status?: boolean
    }): void,
    status?(arg: number): void
}
interface NewUser {
    firstName: string
    lastName: string,
    userName: string,
    email: string,
    password: string
}
interface Request {
    method?: string,
    body?: NewUser
}
// interface Result {
//     _id: any,
//     email: string,
//     password: string,
//     __v: number
// }
export default async function handler(req: Request, res: Response) {
    console.log(req.method);
    if (req.method == "GET") {
        res.send({ message: "Welcome" })
    } else if (req.method == "POST") {
        let newUser = req.body
        if (newUser != undefined) {
            let email = newUser.email
            userModel.findOne({ email: email }, (err: string, result:null) => {
                if (err) {
                    console.log(err);
                    if (res.status != undefined) {
                        res.status(501),
                        res.send({ message: "Internal server error", status: false })
                    }
                } else {
                    if (result) {
                        console.log(result);
                        res.send({ message: "Email already exists in our database", status: false })
                    } else {
                        let form = new userModel(newUser)
                        form.save((err: string) => {
                            if (err) {
                                console.log("an error occured");
                                res.send({ message: "user signup failed", status: false })
                            } else { res.send({ message: "registration successful", status: true }) }
                        })
                    }
                }
            })
        }

    }

}