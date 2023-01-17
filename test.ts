let email = req.body.email
let groupName = req.body.groupName
let passcode = req.body.passcode
try {
    userModel.findOne({ email: email }, (user: NewUser) => {
        if (!user) {
            res.send({ message: "You don't have an account with us. Kindly create an account to create an ajo group", status: false })
        } else {
            groupModel.findOne({ groupName: groupName }, (group: Group2) => {
                if (!group) {
                    res.send({ message: "Group dosen't exist. kindly create a new group", status: false })
                } else {
                    try {
                        bcryptjs.compare(passcode, group.passcode, (err, same) => {
                            if (same) {
                                groupModel.updateOne({_id:group._id}, {$push:{groupMembers:{email}}})
                            }
                        })
                    } catch (error) {
                        error
                    }
                }
            })
        }
    })
} catch (error) {
    console.log(error);

}