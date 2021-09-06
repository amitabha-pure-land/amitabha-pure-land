import proxy from 'express-http-proxy';

const STATIC_PAGE_HOST = 'https://namo-amitabha.herokuapp.com';
const STATIC_PAGE_HOST_REGEX = /https:\/\/namo-amitabha.herokuapp.com/g;

const staticFileProxy = proxy(STATIC_PAGE_HOST, {
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const contentType = headers['content-type'];
    userReq.userResDecoratorNeeded = contentType && contentType.startsWith("text");
    return headers;
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    if (userReq.userResDecoratorNeeded) {
      let text = proxyResData.toString('utf8');
      text = text.replace(STATIC_PAGE_HOST_REGEX, '');
      return text;
    }
    return proxyResData;
  }
});

export function installProxyMiddlewares (app) {
  app.use('/', staticFileProxy);
};
