import express from "express";
import dotEnv from "dotenv-flow";
import { installProxyMiddlewares } from "amtf-proxy";
import cors from "cors";

const NODE_ENV_DEV = "development";
const nodeEnv = process.env.NODE_ENV || NODE_ENV_DEV;
process.env.NODE_ENV = nodeEnv;
console.log(`nodeEnv: ${nodeEnv}`);

dotEnv.config();
console.log(`SERVER_BASE_URL: ${process.env.SERVER_BASE_URL}`);
console.log(`DYNAMIC_PAGE_HOST: ${process.env.DYNAMIC_PAGE_HOST}`);

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

installProxyMiddlewares(app);

app.listen(port, function () {
  console.log(`${new Date()} - app is listening on port: ${port}`);
});
