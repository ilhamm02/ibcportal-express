const express = require("express");
const routers = express.Router();
const { ibcControllers } = require("../controllers");

routers.get("/channels", ibcControllers.channel);
routers.get("/tokens/list", ibcControllers.tokenList);

module.exports = routers;
