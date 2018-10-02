"use strict";

const express = require("express");
const fs = require("fs");
const httpProxy = require("http-proxy");
const https = require("https");
const path = require("path");

let proxy = httpProxy.createProxyServer({
   secure: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0"
});
proxy.on("error", function(err, req, res) {
   res.status(500).end();
});

let app = express();
app.use(function(req, res, next) {
   if (/^\/(sdk|vsanHealth)/.test(req.url)) {
      req.url = req.originalUrl;
      proxy.web(req, res, {
         target: req.headers["vsphere-target"]
      });
   } else {
      return next();
   }
});
app.use("/vsphere.js",
      express.static(path.join(__dirname, "../dist/vsphere.js")));
app.use("/definitions",
      express.static(path.join(__dirname, "../definitions")));
app.use("/node_modules",
      express.static(path.join(__dirname, "../node_modules")));
app.use(express.static(path.join(__dirname, "vsanhealthService")));

let options = {
   pfx: fs.readFileSync(path.join(__dirname, "vsanhealthService/sample.pfx"))
};
https.createServer(options, app).listen(4443);

console.log("The sample is now available at https://localhost:4443");
