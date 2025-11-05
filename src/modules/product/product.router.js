const express= require("express");
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, fixImagePaths, restoreImagePaths, createAccessory } = require("./product.controller");

const validateUser = require("../../middleware/validate_user");
const isAdmin = require("../../middleware/isAdmin");
const { uploadSingleImg } = require("../../utils/multer");



const productRouter = express.Router();

productRouter.route("/create").post(validateUser,isAdmin, uploadSingleImg,createProduct);
productRouter.route("/getAll").get( getAllProducts);
productRouter.route("/getById/:id").get(validateUser, isAdmin, getProductById);
productRouter.route("/update/:id").put(validateUser, isAdmin,uploadSingleImg ,updateProduct);
productRouter.route("/delete/:id").delete(validateUser, isAdmin, deleteProduct);
productRouter.route("/create").post(validateUser,isAdmin,uploadSingleImg,createAccessory)


module.exports = { productRouter };
