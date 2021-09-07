import proxy from 'express-http-proxy';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { nextTick } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATIC_PAGES_FOLDER = join(__dirname, '../docs');
const STATIC_PAGE_HOST_REGEX = /https:\/\/amitabha-pure-land.github.io/g;

const DYNAMIC_PAGE_HOST = 'https://namo-amitabha.herokuapp.com';
const DYNAMIC_PAGE_HOST_REGEX = /https:\/\/namo-amitabha.herokuapp.com/g;
const DYNAMIC_PAGE_PARSE_REGEX = /https:\/\/namo-amitabha.herokuapp.com\/parse/g;

const YOUTUBE_URL_REGEX1 = /https:\/\/www.youtube.com\/watch\?v=/g;
const YOUTUBE_URL_REGEX2 = /https:\/\/youtu.be\//g;

const dynamicFileProxy = proxy(DYNAMIC_PAGE_HOST, {
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const contentType = headers['content-type'];
    userReq.userResDecoratorNeeded = contentType && (contentType.startsWith("data") || contentType.startsWith("application/javascript"));
    return headers;
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    if (userReq.userResDecoratorNeeded) {
      let data = proxyResData.toString('utf8');
      data = data.replace(DYNAMIC_PAGE_PARSE_REGEX, process.env.VUE_APP_PARSE_SERVER_URL);
      data = data.replace(DYNAMIC_PAGE_HOST_REGEX, '');
      return data;
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
    let fileFullPath = join(STATIC_PAGES_FOLDER, req.path)
    if (fileFullPath.endsWith('/')) {
      fileFullPath += "index.html";
    }
    if (fs.existsSync(fileFullPath)) {
      // console.log(`servicing static file: ${fileFullPath}`);
      let handled = false;
      if (fileFullPath.endsWith("html")) {
        let data = fs.readFileSync(fileFullPath, { encoding: 'utf8', flag: 'r' });
        data = data.replace(STATIC_PAGE_HOST_REGEX, '');

        const url = `/online/watch#/?v=`;
        data = data.replace(YOUTUBE_URL_REGEX1, url);
        data = data.replace(YOUTUBE_URL_REGEX2, url);
        res.send(data);
      } else {
        res.sendFile(fileFullPath);
      }
    } else {
      // console.log(`routing to dynamic site for path: ${req.path}`);
      next();
    }
  });

  app.use('/', dynamicFileProxy);
};
