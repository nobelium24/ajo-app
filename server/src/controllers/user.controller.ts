//@ts-ignore
import userModel from "../models/user.model";
import groupModel from "../models/group.model"
import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs"
import jsonwebtoken from "jsonwebtoken"
const SECRET = process.env.SECRET



interface NewUser {
    firstName: string
    lastName: string,
    userName: string,
    email: string,
    password: string
}

interface NewGroup {
    groupName: string
    passcode: string
    groupMembers?: object[]
}

const registerUser = (req: Request, res: Response) => {
    const newUser: NewUser = req.body
    const email = newUser?.email
    const userName = newUser?.userName
    userModel.findOne({ email: email }, (err: string, result: null) => {
        if (err) {
            console.log(err);
            if (res.status != undefined) {
                res.status(501)
                res.send({ message: "Internal server error", status: false })
            }
        } else {
            if (result) {
                console.log(result);
                res.send({ message: "Email already exists in our database. Please, register with a new email", status: false })
            } else {
                userModel.findOne({ userName: userName }, (err: string, result2: null) => {
                    if (err) {
                        console.log(err);
                        if (res.status != undefined) {
                            res.status(501)
                            res.send({ message: "Internal server error", status: false })
                        }
                    } else if (result2) {
                        console.log(result);
                        res.send({ message: "Username is being used by another person. Please use another username", status: false })
                    } else {
                        let form = new userModel(newUser)
                        form.save((err: string) => {
                            if (err) {
                                console.log("an error occured");
                                res.send({ message: "user signup failed", status: false })
                            } else { res.send({ message: "registration successful", status: true }) }
                        })
                    }
                })
            }
        }
    })
}

const signIn = (req: Request, res: Response) => {
    console.log(req.body);
    const password = req.body?.password
    const email = req.body?.email
    userModel.findOne({ email: email }, (err: string, user: NewUser) => {
        if (err) {
            if (res.status != undefined) {
                res.status(501)
                res.send({ message: "Internal server error", status: false })
            }
        } else {
            if (!user) {
                res.send({ message: "Invalid Email", status: false })
            } else {
                if (password != undefined) {
                    bcryptjs.compare(password, user.password, (err, same) => {
                        if (err) {
                            console.log(err);
                        } else if (same) {
                            if (SECRET != undefined) {
                                const token = jsonwebtoken.sign({ email }, SECRET)
                                console.log(token);
                                res.send({ message: "Welcome", token: token, status: true, result: { firstname: user.firstName, lastname: user.lastName, username: user.userName } })

                            }
                        } else {
                            res.send({ message: 'invalid password', status: false })
                        }
                    })
                }
            }
        }
    })
}

interface Group {
    email: string,
    userName?: string
}

const createGroup = (req: Request, res: Response) => {
    const email: string = req.body?.email
    const groupName: string = req.body.groupName
    const passcode: string = req.body.passcode
    const newGroup: NewGroup = { groupName: groupName, passcode: passcode, groupMembers: [] }

    userModel.findOne({ email: email }, (err: string, user: NewUser) => {
        if (err) {
            console.log(err);
            if (res.status != undefined) {
                res.status(501)
                res.send({ message: "Internal server error", status: false })
            }
        } else {
            if (!user) {
                res.send({ message: "You don't have an account with us. Kindly create an account to create an ajo group", status: false })
            } else {
                groupModel.findOne({ groupName: groupName }, (err: string, result: string) => {
                    if (err) {
                        console.log(err);
                        if (res.status != undefined) {
                            res.status(501)
                            res.send({ message: "Internal server error", status: false })
                        }
                    } else if (result) {
                        res.send({ message: "Group name already in use. Please, register with a new group name", status: false })
                    } else {
                        let member: Group = { email: email }
                        newGroup.groupMembers?.push(member)
                        console.log(newGroup);
                        groupModel.create(newGroup)
                        res.send({ message: "Group created successfuly", status: true })

                    }
                })
            }
        }
    })

}

interface Group2 {
    readonly _id?: string,
    groupName?: string,
    passcode?: string,
    groupMembers?: [],
    amount?: number[]
}

const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
    let email = req.body.email
    let groupName = req.body.groupName
    let passcode = req.body.passcode
    try {
        await userModel.findOne({ email: email }).then(
            (user: NewUser) => {
                if (!user) {
                    res.send({ message: "You don't have an account with us. Kindly create an account to join an ajo group", status: false })
                } else {
                    groupModel.findOne({ groupName: groupName }, (err: string, group: Group2) => {
                        console.log(group)
                        if (err) {
                            console.log(err);
                        } else if (!group) {
                            res.send({ message: "Group dosen't exist. kindly create a new group", status: false })
                        } else {
                            try {
                                if (group.passcode != undefined) {
                                    bcryptjs.compare(passcode, group.passcode, (err, same) => {
                                        if (same) {
                                            groupModel.updateOne({ _id: group._id }, { $push: { groupMembers: { email: email } } }).then((ram) => (console.log(ram)
                                            ))
                                            res.send({ message: "Added to group successfuly", status: true })
                                        }
                                    })
                                }
                            } catch (error) {
                                return next(error)
                            }
                        }
                    })
                }
            }
        )
    } catch (error) {
        return next(error)
    }

}

const addGroupAmount = async (req: Request, res: Response, next: NextFunction) => {
    let amount = req.body.amount
    let groupName = req.body.groupName
    let email = req.body.email
    try {
        await groupModel.findOne({ groupName: groupName }).then(
            (group: Group2) => {
                if (!group) {
                    res.send({ message: "You can't make payment as you do not belong to a group", status: false })
                } else {
                    groupModel.updateOne({ _id: group._id }, { $push: { generalAmount: { email: email, amount:amount } } }).then((ram) => {
                        console.log(ram);
                        switch (ram.acknowledged) {
                            case true:
                                res.send({ message: "Payment made successfuly", status: true })
                                break;
                            case false:
                                res.send({ message: "Payment failed", status: false })
                            default:
                                break;
                        }

                    })

                }
            }
        )
    } catch (error) {
        return next(error)
    }
}

const test = (req: Request, res: Response) => {

}
export { registerUser, signIn, createGroup, joinGroup, addGroupAmount, test }
// module.exports = { registerUser }