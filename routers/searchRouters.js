const express = require("express");
const routers = express.Router();
const { searchControllers } = require("../controllers");

routers.get("/detail", searchControllers.detail);

module.exports = routers;
