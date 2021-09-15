import express from "express";
import dotEnv from "dotenv-flow";
import { installProxyMiddlewares } from "amtf-proxy";
import cors from "cors";
import { arch } from "process";

console.log(`This processor architecture is ${arch}`);

const NODE_ENV_DEV = "development";
const nodeEnv = process.env.NODE_ENV || NODE_ENV_DEV;
process.env.NODE_ENV = nodeEnv;
console.log(`nodeEnv: ${nodeEnv}`);

dotEnv.config();
console.log(`SERVER_BASE_URL: ${process.env.SERVER_BASE_URL}`);
console.log(`AMITABHA_MAIN_HOST: ${process.env.AMITABHA_MAIN_HOST}`);
console.log(`AMITABHA_AUXILIARY_HOST: ${process.env.AMITABHA_AUXILIARY_HOST}`);

const unhandledRejections = new Map();

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
  unhandledRejections.set(promise, reason);
});

process.on("rejectionHandled", (promise) => {
  unhandledRejections.delete(promise);
});

process.on("uncaughtException", (err, origin) => {
  console.log(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});

process.on("beforeExit", (code) => {
  console.log("Process beforeExit event with code: ", code);
});

process.on("exit", (code) => {
  console.log("Process exit event with code: ", code);
});

process.on("warning", (warning) => {
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});

process.on("SIGINT", () => {
  console.log("Received SIGINT");
});

// Using a single function to handle multiple signals
function handle(signal) {
  console.log(`Received ${signal}`);
}

process.on("SIGINT", handle);
process.on("SIGTERM", handle);

// Intentionally cause an exception, but don't catch it.
// nonexistentFunc();
// Still crashes Node.js

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

installProxyMiddlewares(app);

app.listen(port, function () {
  console.log(`${new Date()} - app is listening on port: ${port}`);
});
