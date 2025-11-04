const express = require("express");
const validateUser = require("../../middleware/validate_user");
const { createOrderFromCart, getUserOrders, getAllOrders, updateOrderStatus, confirmPayment, initializePayment, getOrderById } = require("./order.controller");
const isAdmin = require("../../middleware/isAdmin");


const orderRouter = express.Router();
orderRouter.route("/order").post(validateUser, createOrderFromCart);
orderRouter.route("/user").get(validateUser, getUserOrders);
orderRouter.route("/all").get(validateUser, isAdmin, getAllOrders);
orderRouter.route("/status/:id").patch(validateUser, isAdmin, updateOrderStatus)
orderRouter.route("/payment/initialize").post(validateUser, initializePayment);
orderRouter.route("/confirm-payment").post(validateUser, confirmPayment);
orderRouter.route("/:id").get(validateUser, getOrderById);


module.exports = { orderRouter }