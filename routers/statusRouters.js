const express = require("express");
const routers = express.Router();
const { statusControllers } = require("../controllers");

routers.get("/status", statusControllers.status);

module.exports = routers;
