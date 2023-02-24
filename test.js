const codeGenerator = () => {
    let code = Math.floor(Math.random() * 999999)+100000
    return code
}

codeGenerator()

 // await userModel.findOne({ userName: userName }).then(
        //     (user) => {
        //         switch (user) {
        //             case !user:
        //                 res.status(401).send({ message: "You don't have an account with us.", status: false })
        //                 break;
        //             case user:
        //                 if (user.bvnStatus === true) {
        //                     res.status(200).send({ message: "BVN already verified", status: true })
        //                 } else {
        //                     if (status !== "success") {
        //                         res.send({ message: "BVN verification failed. Please try again", status: false })
        //                     } else {
        //                         userModel.updateOne({ _id: user._id }, { $set: { bvnStatus: true } })
        //                             .then((ram) => {
        //                                 console.log(ram);
        //                                 switch (ram.acknowledged) {
        //                                     case true:
        //                                         res.send({ message: "BVN verification Sccessful", status: true })
        //                                         break;
        //                                     case false:
        //                                         res.send({ message: "BVN status not recorded. Try again", status: false })
        //                                         break
        //                                     default:
        //                                         break;
        //                                 }
        //                             })
        //                     }
        //                 }
        //             default:
        //                 break;
        //         }
        //     }
        // )