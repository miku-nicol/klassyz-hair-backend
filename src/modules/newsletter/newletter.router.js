const express = require ("express");
const { subscribe } = require("./newletter.controller");



const newsRouter = express.Router();
newsRouter.route ("/subscribe").post(subscribe);

module.exports = { newsRouter };