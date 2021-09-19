// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from "express";
import dotEnv from "dotenv-flow";
import setupParseServer from "b4amtf";
import { setupWebClient } from "f4amtf";
import { installProxyMiddlewares } from "amtf-proxy";

const NODE_ENV_DEV = "development";
const nodeEnv = process.env.NODE_ENV || NODE_ENV_DEV;
console.log(`nodeEnv: ${nodeEnv}`);
process.env.NODE_ENV = nodeEnv;
dotEnv.config();

const app = express();
setupParseServer(app, nodeEnv);
setupWebClient(app);
installProxyMiddlewares(app);

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`${new Date()} - app is listening on port: ${port}`);
});
