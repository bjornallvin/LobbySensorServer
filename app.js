require("dotenv").config();
global.sensorState = require("./config"); // default configs
const common = require("./common");
const arduino = require("./arduino");
const express = require("express");
const wss = require("./wss");
const path = require("path");
const router = require("./routes");
const app = express();

app.use("/", router);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));
app.use(express.static(path.resolve(__dirname, "public")));

app.listen(80, function() {
    common.debug("listening on port 80");
});

setTimeout(() => {
    common.initDevice();
}, 2000);

module.exports = app;
