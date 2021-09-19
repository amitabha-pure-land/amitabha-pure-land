import express from "express";
import dotEnv from "dotenv-flow";
import setupParseServer from "b4amtf";
import { setupWebClient } from "f4amtf";
import { installProxyMiddlewares } from "amtf-proxy";
import { arch, exit } from "process";

console.log(`This processor architecture is ${arch}`);
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
  exit(0);
});

// Using a single function to handle multiple signals
function handle(signal) {
  console.log(`Received ${signal}`);
}

process.on("SIGINT", handle);
process.on("SIGTERM", handle);

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
