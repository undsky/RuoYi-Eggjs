/*
 * @Author: 姜彦汐
 * @Date: 2023-12-22 20:01:21
 * @LastEditors: 姜彦汐
 * @LastEditTime: 2023-12-24 11:23:42
 * @Description:
 * @Site: https://www.undsky.com
 */
/* eslint valid-jsdoc: "off" */
const fs = require("fs");
const path = require("path");

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "o%Fp(=-GLFN;7";

  // add your middleware config here
  config.middleware = ["formatBody"];

  config.cors = {
    allowMethods: "GET,POST,PUT,DELETE,PATCH",
    // credentials: true,
    // origin: () => '*'
  };

  config.accessControl = {
    match: /^\/api[\/]?((?!version|login|register|captchaImage).)*$/i,
  };

  config.jwt = {
    enable: true,
    match: config.accessControl.match,
    secret: "z2Em*CpGBZDw+",
    expiresIn: "7d",
    getToken(ctx) {
      const authorization = ctx.headers.authorization;
      if (authorization) {
        const [pre, token] = authorization.split(" ");
        if ("Bearer" == pre || "Token" == pre) {
          return token;
        }
      }
      return ctx.request.body.token || ctx.query.token;
    },
    isRevoked: async (ctx, payload) => {
      return "revoked" == (await ctx.app.cache.default.get(payload.jti));
    },
  };

  config.bodyParser = {
    jsonLimit: "10mb",
    formLimit: "10mb",
    enableTypes: ["json", "form", "text"],
    extendTypes: {
      text: ["text/xml", "application/xml"],
    },
  };

  config.multipart = {
    fieldNameSize: 100,
    fieldSize: "10mb",
    fields: 100,
    fileSize: "100mb",
    files: 10,
    whitelist: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".wbmp",
      ".mp3",
      ".wav",
      ".mp4",
      ".avi",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
      ".pdf",
      ".txt",
      ".zip",
      ".gz",
      ".tgz",
      ".gzip",
    ],
  };

  config.static = {
    prefix: "/public/",
  };

  const _appPath = path.join(appInfo.baseDir, "app");
  config.uploadRelPath = path.join(config.static.prefix, "uploads");
  config.uploadAbsPath = path.join(_appPath, config.uploadRelPath);

  config.siteFile = {
    "/favicon.ico": fs.readFileSync(
      path.join(_appPath, config.static.prefix, "favicon.ico")
    ),
  };

  config.onerror = {
    all(err, ctx) {
      if ("UnauthorizedError" == err.name) {
        ctx.body = JSON.stringify({
          code: 500,
          msg: "UnauthorizedError",
        });
      }
    },
  };

  // 验证码配置
  config.captcha = {
    enabled: true, // 是否启用验证码
    type: "math", // 验证码类型：char-字符 math-数学
    category: "text", // 图片类型：svg-SVG格式 text-纯文本
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false, // 关闭 CSRF（使用 JWT）
    },
  };

  // 数据库映射配置
  config.database = {
    master: {
      driver: "mysql", // 数据库驱动：mysql, pgsql, sqlite
      instance: "ruoyi", // 主库实例名称（写操作）
    },
    slave: {
      driver: "mysql", // 数据库驱动：mysql, pgsql, sqlite
      instance: "ruoyi", // 从库实例名称（读操作），默认同主库
    },
    readWriteSplit: false, // 是否启用读写分离
  };

  return config;
};
