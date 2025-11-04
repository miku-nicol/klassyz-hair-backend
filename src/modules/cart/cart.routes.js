const express = require("express")
const { addItemToCart, getUserCart, removeItemFromCart, clearCart, updateCartQuantity } = require("./cart.contoller");
const validateUser = require("../../middleware/validate_user");


const cartRouter= express.Router()

cartRouter.route("/add").post(validateUser,addItemToCart);
cartRouter.route("/get").get(validateUser,getUserCart)
cartRouter.route("/remove/:productId").delete(validateUser,removeItemFromCart)
cartRouter.route("/clear").delete(validateUser,clearCart)
cartRouter.route("/update").put(validateUser,updateCartQuantity)




module.exports = { cartRouter };