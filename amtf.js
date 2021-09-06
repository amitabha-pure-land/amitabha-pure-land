import express from 'express';
import dotEnv from 'dotenv-flow';
import { installProxyMiddlewares } from "./lib/proxyMiddlewares.js";

const NODE_ENV_DEV = "development";
const nodeEnv = process.env.NODE_ENV || NODE_ENV_DEV;
console.log(`nodeEnv: ${nodeEnv}`);
process.env.NODE_ENV = nodeEnv;
dotEnv.config();

const app = express();
const port = process.env.PORT || 3000;

installProxyMiddlewares(app);

app.listen(port, function () {
  console.log(`app is listening on port: ${port}`);
});
