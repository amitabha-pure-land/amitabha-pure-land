import express from "express";
import proxy from "express-http-proxy";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import crypto from "crypto";
import cmd from "node-cmd";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATIC_PAGES_FOLDER = join(__dirname, "../docs");

const STATIC_PAGE_HOST = "https://amitabha-pure-land.github.io";
const STATIC_PAGE_HOST_REGEX = /https:\/\/amitabha-pure-land.github.io/g;

const DYNAMIC_PAGE_HOST_REGEX = /https:\/\/namo-amitabha.herokuapp.com/g;
const DYNAMIC_PAGE_OLD_HOST_REGEX = /https:\/\/amituofo.herokuapp.com/g;

const YOUTUBE_URL_REGEX1 = /https:\/\/www.youtube.com\/watch\?v=/g;
const YOUTUBE_URL_REGEX2 = /https:\/\/youtu.be\//g;

function processStaticHtml(html, fromDynamicHost = false, newUrl = "") {
  if (fromDynamicHost) {
    html = html.replace(DYNAMIC_PAGE_HOST_REGEX, newUrl);
    html = html.replace(DYNAMIC_PAGE_OLD_HOST_REGEX, newUrl);
  } else {
    html = html.replace(STATIC_PAGE_HOST_REGEX, "");
  }

  const url = `/online/watch#/?v=`;
  html = html.replace(YOUTUBE_URL_REGEX1, url);
  html = html.replace(YOUTUBE_URL_REGEX2, url);
  return html;
}

let userResDecoratorNeeded = false;

const staticFileProxy = proxy(STATIC_PAGE_HOST, {
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const contentType = headers["content-type"];
    userResDecoratorNeeded = contentType && contentType.startsWith("text");
    return headers;
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    if (userResDecoratorNeeded) {
      const html = proxyResData.toString("utf8");
      return processStaticHtml(html);
    }
    return proxyResData;
  },
});

function installDynamicProxy(app, pathname) {
  const target =
    process.env.DYNAMIC_PAGE_HOST || "https://namo-amitabha.herokuapp.com";
  console.log(`creating proxy for ${pathname} with URL: ${target}${pathname} `);
  const dynamicFileProxy = proxy(target, {
    proxyReqPathResolver(req, res) {
      // console.log(`pathname: ${pathname} req.url: ${req.url}`);
      return pathname === "/" ? req.url : pathname + req.url;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      const contentType = headers["content-type"];
      if (contentType) {
        if (contentType.startsWith("text")) {
          userResDecoratorNeeded = 1;
        } else if (
          contentType.startsWith("application/javascript") ||
          contentType.startsWith("application/json")
        ) {
          userResDecoratorNeeded = 2;
        }
      }

      return headers;
    },
    userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
      if (userResDecoratorNeeded) {
        const newUrl =
          userResDecoratorNeeded === 1 ? "" : process.env.SERVER_BASE_URL;
        const html = proxyResData.toString("utf8");
        return processStaticHtml(html, true, newUrl);
      }

      return proxyResData;
    },
  });

  app.use(pathname, dynamicFileProxy);
}

let isProxyingForYoutube = false;
let resolvedTargetUrl;

async function resolveTargetUrl(req, res, next) {
  const reqUrl = req.url;
  const end =
    reqUrl.includes("youtu") && reqUrl.endsWith(".mp4") ? "-4" : reqUrl.length;
  let targetUrl = reqUrl.slice(1, end);
  // console.log(`initial targetUrl: ${targetUrl}`);

  if (targetUrl.startsWith("yt/")) {
    isProxyingForYoutube = true;
    const target =
      process.env.DYNAMIC_PAGE_HOST || "https://namo-amitabha.herokuapp.com";
    const url = target + req.url.replace("/proxy", "");
    targetUrl = await axios
      .get(url)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    isProxyingForYoutube =
      targetUrl.includes("youtu") || targetUrl.includes("googlevideo");
    targetUrl = decodeURIComponent(targetUrl);

    if (targetUrl.startsWith("https://1drv.ms")) {
      let b64 = Buffer.from(targetUrl).toString("base64");
      let length = b64.length;

      while (length-- > 0) {
        if (b64[length] !== "=") {
          break;
        }
      }

      b64 = b64.slice(0, length + 1);
      b64 = b64.split("/").join("_");
      b64 = b64.split("+").join("-");

      targetUrl =
        "https://api.onedrive.com/v1.0/shares/u!" + b64 + "/root/content";
    }
  }

  resolvedTargetUrl = new URL(targetUrl);
  next();
}

function getHost(req) {
  const host = resolvedTargetUrl.origin;
  return host;
}

const genericProxy = proxy(getHost, {
  memoizeHost: false,
  proxyReqPathResolver: function (req) {
    return resolvedTargetUrl.pathname + resolvedTargetUrl.search;
  },
  proxyReqOptDecorator: function (proxyReqOpts, req) {
    if (isProxyingForYoutube) {
      // proxyReqOpts.headers["x-forwarded-for"] =
      //   "45.119.158.13,::ffff:10.10.11.79,::ffff:10.10.86.7";
      proxyReqOpts.headers["x-forwarded-host"] =
        proxyReqOpts.headers["x-forwarded-host"] || "localhost";
    }

    return proxyReqOpts;
  },
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    if (isProxyingForYoutube) {
      if (headers.location) {
        headers.location = `/proxy/${encodeURIComponent(headers.location)}`;
        // console.log("Response headers: ", headers);
      }
    }
    return headers;
  },
});

function ensureProperUrlMiddleware(req, res, next) {
  const parts = req.url.split("?");
  const queryString = parts[1];
  const originalPath = parts[0];

  if (!originalPath.includes(".") && !originalPath.endsWith("/")) {
    const updatedPath = `${originalPath}/`;
    // console.log(`originalPath: ${originalPath} updatedPath: ${updatedPath}`);
    return res.redirect(updatedPath + (queryString ? "?" + queryString : ""));
  }

  return next();
}

const verifySignature = (req, res, next) => {
  if (req.body) {
    console.log(`verifySignature - latest commit: ${req.body.after} `);
  }
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha1", process.env.GITHUB_SECRET);
  const digest = "sha1=" + hmac.update(payload).digest("hex");
  const checksum = req.headers["x-hub-signature"];

  if (!checksum || !digest || checksum !== digest) {
    console.log(`verifySignature failed! checksum: ${checksum} `);
    return res.status(403).send("auth failed");
  }

  return next();
};
const handleGitEvent = (req, res) => {
  console.log(`handling event: ${req.headers["x-github-event"]}`);
  if (req.headers["x-github-event"] === "push") {
    cmd.runSync("bash git.sh", (err, data) => {
      if (err) return console.log(err);
      console.log(data);
      return res.status(200).send(data);
    });
  } else if (req.headers["x-github-event"] === "ping") {
    return res.status(200).send("PONG");
  } else {
    return res.status(200).send("Unsupported Github event. Nothing done.");
  }
};

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

export function installProxyMiddlewares(app) {
  app.use("/proxy", resolveTargetUrl, genericProxy);

  installDynamicProxy(app, "/online");
  installDynamicProxy(app, "/parse");
  installDynamicProxy(app, "/dashboard");

  app.use(express.json());
  // Github webhook listener
  app.post("/git", verifySignature, handleGitEvent);

  if (fs.existsSync(STATIC_PAGES_FOLDER)) {
    console.log(`servicing static file from folder: ${STATIC_PAGES_FOLDER}`);
    app.get("/*", (req, res, next) => {
      let fileFullPath = join(STATIC_PAGES_FOLDER, req.path);
      if (fileFullPath.endsWith("/")) {
        fileFullPath += "index.html";
      }
      if (fs.existsSync(fileFullPath)) {
        // console.log(`servicing static file: ${fileFullPath}`);
        if (fileFullPath.endsWith("html")) {
          let html = fs.readFileSync(fileFullPath, {
            encoding: "utf8",
            flag: "r",
          });
          html = processStaticHtml(html);
          return res.send(html);
        } else {
          return res.sendFile(fileFullPath);
        }
      }
      // console.log(`routing to dynamic site for path: ${req.path}`);
      return next();
    });
    installDynamicProxy(app, "/");
  } else {
    console.log(`servicing static file from URL: ${STATIC_PAGE_HOST}`);
    app.use("/", ensureProperUrlMiddleware);
    app.use("/", staticFileProxy);
  }

  app.use(logErrors);
}
