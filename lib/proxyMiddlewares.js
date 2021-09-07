import proxy from 'express-http-proxy';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { nextTick } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATIC_PAGES_FOLDER = join(__dirname, '../docs');
console.log(`STATIC_PAGES_FOLDER: ${STATIC_PAGES_FOLDER}`);

const DYNAMIC_PAGE_HOST = 'https://namo-amitabha.herokuapp.com';
const DYNAMIC_PAGE_HOST_REGEX = /https:\/\/namo-amitabha.herokuapp.com/g;
const DYNAMIC_PAGE_PARSE_REGEX = /https:\/\/namo-amitabha.herokuapp.com\/parse/g;

const dynamicFileProxy = proxy(DYNAMIC_PAGE_HOST, {
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const contentType = headers['content-type'];
    userReq.userResDecoratorNeeded = contentType && (contentType.startsWith("text") || contentType.startsWith("application/javascript"));
    return headers;
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    if (userReq.userResDecoratorNeeded) {
      let text = proxyResData.toString('utf8');
      text = text.replace(DYNAMIC_PAGE_PARSE_REGEX, process.env.PARSE_SERVER_URL);
      text = text.replace(DYNAMIC_PAGE_HOST_REGEX, '');
      return text;
    }
    return proxyResData;
  }
});

function getTargetUrl(reqUrl) {
  const end = reqUrl.includes("youtu") ? "-4" : reqUrl.length;
  let targetUrl = reqUrl.slice(1, end);
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

    targetUrl = "https://api.onedrive.com/v1.0/shares/u!" + b64 + "/root/content";
  }

  // console.log(`targetUrl: ${targetUrl}`);
  return new URL(targetUrl);
}

function getHost(req) {
  return getTargetUrl(req.url).origin;
}

const genericProxy = proxy(getHost, {
  memoizeHost: false,
  proxyReqPathResolver: function (req) {
    const targetUrl = getTargetUrl(req.url);
    return targetUrl.pathname + targetUrl.search;
  }
});

export function installProxyMiddlewares(app) {
  app.use('/proxy', genericProxy);

  app.get('/*', (req, res, next) => {
    const fileFullPath = join(STATIC_PAGES_FOLDER, req.path)
    if (fs.existsSync(fileFullPath)) {
      // console.log(`servicing static file: ${fileFullPath}`);
      res.sendFile(fileFullPath);
    } else {
      // console.log(`routing to dynamic site for path: ${req.path}`);
      next();
    }
  });

  app.use('/', dynamicFileProxy);
};
