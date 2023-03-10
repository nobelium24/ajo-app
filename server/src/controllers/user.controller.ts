//@ts-ignore
import userModel from "../models/user.model";
import groupModel from "../models/group.model"
import savingsModel from "../models/savings.model";
import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs"
import jsonwebtoken, { JsonWebTokenError } from "jsonwebtoken"
import nodemailer from "nodemailer"
const SECRET = process.env.SECRET



interface NewUser {
    readonly _id?: string
    firstName: string
    lastName: string,
    userName: string,
    email: string,
    password: string,
    bvnStatus: boolean,
    wallet: number
}


interface NewGroup {
    groupName: string
    passcode: string
    groupMembers?: object[]
}


const registerUser = async (req: Request, res: Response, next:NextFunction) => {
    const newUser: NewUser = req.body
    const email = newUser?.email
    const userName = newUser?.userName
    try {
        await userModel.findOne({ email: email }, (err: string, result: null) => {
            if (err) {
                console.log(err);
                if (res.status != undefined) {
                    res.status(500).send({ message: "Internal server error", status: false })
                }
            } else {
                if (result) {
                    console.log(result);
                    res.status(409).send({ message: "Email already exists in our database. Please, register with a new email", status: false })
                } else {
                    userModel.findOne({ userName: userName }, (err: string, result2: null) => {
                        if (err) {
                            console.log(err);
                            if (res.status != undefined) {
                                res.status(500).send({ message: "Internal server error", status: false })
                            }
                        } else if (result2) {
                            console.log(result);
                            res.status(409).send({ message: "Username is being used by another person. Please use another username", status: false })
                        } else {
                            let form = new userModel(newUser)
                            form.save((err: string) => {
                                if (err) {
                                    console.log("an error occured", err);
                                    res.status(500).send({ message: "user signup failed", status: false })
                                } else { res.status(201).send({ message: "registration successful", status: true }) }
                            })
                        }
                    })
                }
            }
        })
    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }
}


const signIn = async (req: Request, res: Response, next: NextFunction) => {
    let password = req.body.password
    let email = req.body.email
    let userName = req.body.userName
    try {
        await userModel.findOne({
            $or: [
                { email: email },
                { userName: userName },
            ]
        }).then((user) => {
            if (!user) {
                res.status(400).send({ message: "Invalid email or username", status: false })
            } else {
                if (password != undefined) {
                    try {
                        bcryptjs.compare(password, user.password).then((result) => {
                            switch (result) {
                                case result:
                                    if (SECRET != undefined) {
                                        const token = jsonwebtoken.sign({ email, userName }, SECRET, { expiresIn: "128h" })
                                        console.log(token);
                                        res.status(200).send({
                                            message: "Welcome", token: token, status: true,
                                            result: { firstName: user.firstName, lastName: user.lastName, userName: user.userName }
                                        })
                                    }
                                    break;
                                case !result:
                                    res.status(400).send({ message: 'invalid password', status: false })
                                default:
                                    break;
                            }
                        })
                    } catch (error) {
                        res.status(500).send({ message: "Internal server error", status: false })
                        return next(error)
                    }
                }
            }
        })

    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)

    }
}

const dashCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization
        if (auth != undefined) {
            const token = auth.split(' ')[1]
            // console.log(request.headers.authorization)
            // const token = request.token
            console.log(token)
            if (SECRET != undefined) {
                jsonwebtoken.verify(token, SECRET, (err, decoded) => {
                    if (err) {
                        console.log(err.message)
                        res.status(401).send({ message: "Unauthorized" })
                    }

                    else {
                        console.log(decoded)
                        if (decoded != undefined) {
                            res.status(200).send({ message: 'verification successful', status: true })
                        }
                    }
                })
            }
        }
    } catch (error) {
        res.status(500).send({ message: "internal server error", status: false })
        return next(error)
    }
}


interface Group {
    email?: string,
    userName?: string
}


const createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const userName: string = req.body?.userName
    const groupName: string = req.body.groupName
    const passcode: string = req.body.passcode
    const newGroup: NewGroup = { groupName: groupName, passcode: passcode, groupMembers: [] }
    try {
        await userModel.findOne({ userName: userName }, (err: string, user: NewUser) => {
            if (err) {
                console.log(err);
                if (res.status != undefined) {
                    res.status(501).send({ message: "Internal server error", status: false })
                }
            } else {
                if (!user) {
                    res.status(401).send({ message: "You don't have an account with us. Kindly create an account to create an ajo group", status: false })
                } else {
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can create a group", status: false })
                    } else {
                        groupModel.findOne({ groupName: groupName }, (err: string, result: string) => {
                            if (err) {
                                console.log(err);
                                if (res.status != undefined) {
                                    res.status(501).send({ message: "Internal server error", status: false })
                                }
                            } else if (result) {
                                res.status(409).send({ message: "Group name already in use. Please, register with a new group name", status: false })
                            } else {
                                let member: Group = { userName: userName }
                                newGroup.groupMembers?.push(member)
                                console.log(newGroup);
                                groupModel.create(newGroup).then((ram) => {
                                    ram ? groupModel.findOne({ groupName: groupName }).then((group: Group2) => {
                                        group ? groupModel.updateOne({ _id: group._id }, { $push: { generalAmount: { userName: userName, amount: 0 } } }).then((ram) => {
                                            ram ? res.status(201).send({ message: "Group created successfully", status: true }) :

                                                res.status(500).send({ message: "Group creation failed. Try again", status: false })
                                        }) :
                                            res.status(404).send({ message: "group not in existence" })
                                    }) : res.status(404).send({ message: "group not in existence" })

                                })

                                // res.send({ message: "Group created successfuly", status: true })

                            }
                        })
                    }
                }
            }
        })

    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }

}





const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
    let userName = req.body.userName
    let groupName = req.body.groupName
    let passcode = req.body.passcode
    try {
        await userModel.findOne({ userName: userName }).then(
            (user: NewUser) => {
                if (!user) {
                    res.status(401).send({ message: "You don't have an account with us. Kindly create an account to join an ajo group", status: false })
                } else {
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can join a group", status: false })
                    } else {
                        groupModel.findOne({ groupName: groupName }, (err: string, group: Group2) => {
                            console.log(group)
                            if (err) {
                                console.log(err);
                                res.status(500).send({ message: "Internal server error", status: false })
                            } else if (!group) {
                                res.status(404).send({ message: "Group dosen't exist. kindly create a new group", status: false })
                            } else {
                                try {
                                    if (group.passcode != undefined) {
                                        bcryptjs.compare(passcode, group.passcode, (err, same) => {
                                            if (same) {
                                                try {
                                                    group.groupMembers?.map((i: any) => {
                                                        if (i.userName == userName) {
                                                            res.status(208).send({ message: "You are already in this group", status: false })
                                                        } else {
                                                            groupModel.updateOne({ _id: group._id }, { $push: { groupMembers: { userName: userName } } })
                                                                .then((ram) => {
                                                                    console.log(ram)
                                                                    switch (ram.acknowledged) {
                                                                        case true:
                                                                            groupModel.updateOne({ _id: group._id },
                                                                                { $push: { generalAmount: { userName: userName, amount: 0 } } }).then((ram) => {
                                                                                    ram ? res.status(200).send({ message: "Added to group successfuly", status: true }) :
                                                                                        res.status(500).send({ message: "You were unable to join group. Try again", status: false })
                                                                                })
                                                                            break;
                                                                        case false:
                                                                            res.status(500).send({ message: "You were unable to join group. Try again", status: false })
                                                                            break
                                                                        default:
                                                                            break;
                                                                    }
                                                                })
                                                        }
                                                    })
                                                } catch (err) {
                                                    return err
                                                }

                                            }
                                        })
                                    }
                                } catch (error) {
                                    res.status(500).send({ message: "Internal server error", status: false })
                                    return next(error)
                                }
                            }
                        })
                    }
                }
            }
        )
    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }

}

interface Group2 {
    readonly _id?: string,
    groupName?: string,
    passcode?: string,
    groupMembers?: [],
    generalAmount?: [{ userName?: string, amount?: number }],
    groupWallet?: number
}

const addGroupAmount = async (req: Request, res: Response, next: NextFunction) => {
    let amount = req.body.amount
    let groupName = req.body.groupName
    let userName = req.body.userName
    try {
        await userModel.findOne({ userName }).then(
            (user: NewUser) => {
                if (!user) {
                    res.status(401).send({ message: "You don't have an account with us", status: false })
                } else {
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can make a contribution", status: false })
                    } else {
                        try {
                            groupModel.findOne({ groupName: groupName }).then(
                                (group: Group2) => {
                                    if (!group) {
                                        res.status(404).send({ message: "You can't make payment as you do not belong to a group", status: false })
                                    } else {
                                        let newFund = user.wallet - amount
                                        if (newFund < 0) {
                                            res.status(404).send({ message: "Insufficient funds. Please fund wallet", status: false })
                                        } else {


                                            userModel.updateOne({ _id: user._id }, { $set: { wallet: newFund } }).then((ram) => {
                                                console.log(ram);
                                                switch (ram.acknowledged) {
                                                    case true:

                                                        if (group.generalAmount != undefined) {
                                                            let updatedContribution = group.generalAmount[0].amount + amount
                                                            console.log(updatedContribution);

                                                            let updatedGroupWallet = group.groupWallet + amount
                                                            groupModel.updateOne({ _id: group._id }, { $set: { groupWallet: updatedGroupWallet } }).then((ram) => {
                                                                console.log(ram);
                                                            })

                                                            groupModel.updateOne({ _id: group._id, "generalAmount.userName": user.userName },
                                                                { $set: { "generalAmount.$.amount": updatedContribution } })
                                                                .then((ram) => {
                                                                    console.log(ram);
                                                                    switch (ram.acknowledged) {
                                                                        case true:
                                                                            res.status(201).send({ message: "Payment made successfuly", status: true })
                                                                            break;
                                                                        case false:
                                                                            let reversedFunds = user.wallet + amount
                                                                            userModel.updateOne({ _id: user._id }, { $set: { wallet: reversedFunds } }).
                                                                                then((goat) => {
                                                                                    goat.acknowledged ?
                                                                                        res.status(200).send({ message: "Payment failed. Money reversed successlully", status: false }) :
                                                                                        res.status(500).send({ message: "Payment failed. Reversal failed. Contact admin", status: false })
                                                                                })

                                                                            break
                                                                        default:
                                                                            break;
                                                                    }
                                                                })
                                                        }


                                                        break;
                                                    case false:
                                                        res.status(500).send({ message: "Payment failed", status: false })
                                                        break
                                                    default:
                                                        break;
                                                }
                                            })

                                        }

                                    }
                                }
                            )
                        } catch (error) {
                            res.status(501).send({ message: "Internal server error", status: false })
                            return next(error)
                        }
                    }
                }
            }
        )
    } catch (error) {

        return error
    }
}


const fundWallet = async (req: Request, res: Response, next: NextFunction) => {
    const fund = req.body.fund
    const userName = req.body.userName
    try {
        await userModel.findOne({ userName: userName }).then(
            (user: NewUser) => {
                if (!user) {
                    res.status(401).send({ message: "Account not found", status: false })
                } else {
                    if (user.bvnStatus === false) {
                        res.status(406).send({ message: "You have to verify your BVN before you can fund wallet", status: false })
                    } else {
                        let newFund = user.wallet + fund
                        userModel.updateOne({ _id: user._id }, { $set: { wallet: newFund } })
                            .then((ram) => {
                                console.log(ram);
                                switch (ram.acknowledged) {
                                    case true:
                                        res.status(201).send({ message: "Wallet funded successfully", status: true })
                                        break;
                                    case false:
                                        res.status(500).send({ message: "Payment failed", status: false })
                                        break
                                    default:
                                        break;
                                }

                            })
                    }
                }
            }
        )
    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }

}


const codeGenerator = () => {
    let code = Math.floor(Math.random() * 999999) + 100000
    return code
}
const code = codeGenerator()


const forgotPasswordEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, } = req.body
    try {
        await userModel.findOne({ email: email }).then(
            (user: NewUser) => {
                if (!user) {
                    res.status(401).send({ message: "You don't have an account with us. Kindly create an account to join an ajo group", status: false })
                } else {
                    if (SECRET != undefined) {
                        let token = jsonwebtoken.sign({ email }, SECRET, { expiresIn: 300 })
                        const contactTemplate: string = `<div>
                        <div>
                          <h2 style="color:#2036ea ;">Message Title:-Password Reset</h2>
                           <p>
                            
                           </p>
                        </div>
                        <ul>
                         <li>Name : ${userName}</li>
                         <li>Email: ${email}</li>
                        </ul>
                        <div>
                          <h2 style="color:#2036ea ;">Message :-</h2>
                          <p>
                            Dear ${userName}, kindly input the code:(${token}) to change your password. 
                            This code will expire in 5 minutes. Please don't share with anyone.
                          </p>
                        </div>
                        <p style="color:#2036ea ;"><i>KIK cosmetics.</i></p>
                        </div>
                        `
                        let mail = process.env.GMAIL
                        let pws = process.env.PASSWORD
                        let transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: mail,
                                pass: pws
                            }
                        })
                        let mailOptions = {
                            from: "",
                            to: `${email}`,
                            subject: "KIK COSMETICS ?????? Support Message",
                            text: "Reset password",
                            html: contactTemplate,
                        }
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                res.status(500).send({ message: "Internal Server Error!!!", status: false });
                            } else {
                                res.status(200).send({
                                    message: "Check your mail box",
                                    status: true,
                                });
                            }
                        })
                    }
                }
            }
        )
    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }
}



const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    let email = req.body.email
    let token = req.body.token
    const token2 = token.split(' ')[1]
    let password = req.body.password
    let salt = bcryptjs.genSaltSync(10)
    let hash = bcryptjs.hashSync(password, salt)
    console.log(hash);

    try {
        await userModel.findOne({ email: email }).then(
            (user: NewUser) => {
                if (!user) {
                    res.status(401).send({ message: "You don't have an account with us.", status: false })
                } else {
                    if (SECRET != undefined) {
                        jsonwebtoken.verify(token2, SECRET, (decoded: any) => {
                            if (!decoded) {
                                res.status(401).send({ message: "Invalid or expired token", status: false })
                            } else {
                                userModel.updateOne({ _id: user._id }, { $set: { password: hash } })
                                    .then((ram) => {
                                        console.log(ram);
                                        switch (ram.acknowledged) {
                                            case true:
                                                res.status(201).send({ message: "Password changed successfuly", status: true })
                                                break;
                                            case false:
                                                res.status(409).send({ message: "Password changed failed", status: false })
                                                break
                                            default:
                                                break;
                                        }
                                    })
                            }
                        })
                    }
                }
            }

        )
    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }
}

const verifyBVN = async (req: Request, res: Response, next: NextFunction) => {
    let userName = req.body.userName
    let status = req.body.status
    try {
        await userModel.findOne({ userName: userName }).then((user) => {
            switch (user) {
                case !user:
                    res.status(401).send({ message: "You don't have an account with us.", status: false })
                    break;
                case user:
                    if (status != undefined) {
                        if (user.bvnStatus === true) {
                            res.status(200).send({ message: "BVN already verified", status: true })
                        } else {
                            if (status === "success") {
                                userModel.updateOne({ _id: user._id }, { $set: { bvnStatus: true } })
                                    .then((ram) => {
                                        console.log(ram);
                                        switch (ram.acknowledged) {
                                            case true:
                                                res.status(200).send({ message: "BVN verification Sccessful", status: true })
                                                break;
                                            case false:
                                                res.status(409).send({ message: "BVN status not recorded. Try again", status: false })
                                                break
                                            default:
                                                break;
                                        }
                                    })
                            }
                        }
                    }

                default:
                    break;
            }
        })
    } catch (error) {
        res.status(501).send({ message: "Internal server error", status: false })
        return next(error)
    }

}


interface Save {
    userName?: string
    amountSaved?: number
    savingsName?: string
}
const createSavingsPlan = async (req: Request, res: Response, next: NextFunction) => {
    let newPlan = req.body
    // let savingsName = req.body.savingsName
    let userName = req.body.userName

    try {
        await userModel.findOne({ userName: userName }).then(
            (user) => {
                switch (user) {
                    case !user:
                        res.status(401).send({ message: "You don't have an account with us.", status: false })
                        break;
                    case user:
                        if (user.bvnStatus === false) {
                            res.status(406).send({ message: "You have to verify your BVN before you can create a savings plan", status: false })
                        } else {
                            savingsModel.findOne({ userName: userName }).then(
                                (save: Save) => {
                                    if (save) {
                                        res.status(200).send({ message: "You already have a savings plan.", status: false })

                                    } else {
                                        let form = new savingsModel(newPlan)
                                        form.save((err: string) => {
                                            if (err) {
                                                console.log(err);
                                                res.status(500).send({ message: "Plan creation failed. Try again", status: false })
                                            } else { res.status(201).send({ message: "Plan creation successful", status: true }) }
                                        })
                                    }
                                }
                            )
                        }

                    default:
                        break;
                }
            }
        )
    } catch (error) {
        res.status(501).send({ message: "Internal server error", status: false })
        return next(error)
    }
}


const fundSavingsPlan = async (req: Request, res: Response, next: NextFunction) => {
    let savingsName = req.body.savingsName
    let userName = req.body.userName
    let amountSaved = req.body.amountSaved
    try {
        await userModel.findOne({ userName: userName }).then(
            (user) => {
                switch (user) {
                    case !user:
                        res.status(401).send({ message: "You don't have an account with us.", status: false })
                        break;
                    case user:
                        if (user.bvnStatus === false) {
                            res.status(406).send({ message: "You have to verify your BVN before you can fund savings plan", status: false })
                        } else {
                            let newFund = user.wallet - amountSaved
                            if (newFund < 0) {
                                res.status(404).send({ message: "Insufficient funds. Please fund wallet", status: false })
                            } else {
                                userModel.updateOne({ _id: user._id }, { $set: { wallet: newFund } }).then((ram) => {
                                    console.log(ram);
                                    switch (ram.acknowledged) {
                                        case true:
                                            savingsModel.findOne({ userName: userName }).then(
                                                (found) => {
                                                    if (found) {
                                                        let newMoney = amountSaved + found.amountSaved
                                                        savingsModel.updateOne({ _id: found._id }, { $set: { amountSaved: newMoney } })
                                                            .then((ram) => {
                                                                console.log(ram);
                                                                switch (ram.acknowledged) {
                                                                    case true:
                                                                        res.status(200).send({ message: "Funds saved successfuly", status: true })
                                                                        break;
                                                                    case false:
                                                                        res.status(500).send({ message: "Funds not saved. Try again", status: false })
                                                                        break
                                                                    default:
                                                                        break;
                                                                }
                                                            })
                                                    }
                                                }
                                            )
                                            break;
                                        case false:
                                            res.status(500).send({ message: "Payment failed", status: false })
                                            break
                                        default:
                                            break;
                                    }
                                })
                            }
                        }
                    default:
                        break;
                }
            }
        )
    } catch (error) {
        res.status(500).send({ message: "Internal server error", status: false })
        return next(error)
    }

}

const test = async (req: Request, res: Response, next: NextFunction) => {

}


export {
    registerUser, signIn, createGroup, joinGroup, addGroupAmount, fundWallet,
    forgotPasswordEmail, test, resetPassword, verifyBVN, createSavingsPlan, fundSavingsPlan, dashCheck
}
// module.exports = { registerUser }