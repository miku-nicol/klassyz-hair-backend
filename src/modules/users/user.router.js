const express = require("express");
const { registerUser, loginUser, registerAdmin } = require("./user.controller");

const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/register-admin").post(registerAdmin);




module.exports = { userRouter };