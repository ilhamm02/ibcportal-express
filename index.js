const express = require("express");
const cors = require("cors");
const bearerToken = require("express-bearer-token");
const app = express();

app.use(cors());
app.use(express.json());
app.use(bearerToken());

app.get("/", (req, res) => {
  res.status(200).send("<h4>Welcome to your-api</h4>");
});

const {
  statusRouters,
  transactionRouters,
  blockRouters,
  validatorRouters,
  balanceRouters,
  searchRouters,
  ibcRouters,
} = require("./routers");

app.use("/ibc", statusRouters);
app.use("/ibc/txs", transactionRouters);
app.use("/ibc/balance", balanceRouters);
app.use("/ibc/search", searchRouters);
app.use("/ibc/ibc", ibcRouters);

app.listen(2200, () => console.log("Api Running :", 2200));
