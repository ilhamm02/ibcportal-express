const express = require("express");
const routers = express.Router();
const { transactionControllers } = require("../controllers");

routers.get("/list", transactionControllers.list);
routers.get("/detail", transactionControllers.detail);

module.exports = routers;
