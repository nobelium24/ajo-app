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
