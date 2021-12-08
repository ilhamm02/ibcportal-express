const express = require("express");
const routers = express.Router();
const { balanceControllers } = require("../controllers");

routers.get("/", balanceControllers.balance);

module.exports = routers;
