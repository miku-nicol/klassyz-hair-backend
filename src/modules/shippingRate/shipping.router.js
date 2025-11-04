const express = require("express");
const { addShipping, getShipping, updateShippingRate, deleteShippingRate } = require("./shipping.controller");
const validateUser = require("../../middleware/validate_user");
const isAdmin = require("../../middleware/isAdmin");


const shippingRouter = express.Router()

shippingRouter.route("/add").post(validateUser, isAdmin, addShipping);
shippingRouter.route("/getall").get(validateUser, getShipping);
shippingRouter.route("/update/:id").put(validateUser, isAdmin, updateShippingRate);
shippingRouter.route("/delete/:id").delete(validateUser, isAdmin, deleteShippingRate);

module.exports = { shippingRouter };