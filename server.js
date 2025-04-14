const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// -----ENV Setup----- //
require("dotenv").config();
const PORT = 4000;
const routes = require("./routes");

// -----Middleware----- /
app.use(cors({
  origin: "http://localhost:3000", // or "*", for testing
  credentials: true, // if using cookies/auth headers
}));
app.use(bodyParser.json());

app.use("/api/campaign", routes.campaign);
app.use("/api/user", routes.user);
app.use("/api/donate", routes.payment);
app.use("/api/donation", routes.donation);
app.use("/api/query", routes.query);

app.get("*", function (req, res) {
  res.send("404 Error");
});

app.listen(PORT, function () {
  console.log("Server running successfully");
});
