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
    // 精确匹配：排除 /version、/login、/register、/captchaImage 和根路径 /
    // 其他路径都需要 JWT 验证
    match: /^\/(?!(?:version|login|register|captchaImage)(?:\/|$))(?!$)/i,
  };

  config.jwt = {
    enable: true,
    ignore: null,
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
      const isRevoked = "revoked" == (await ctx.app.cache.default.get(payload.jti));
      if (isRevoked) {
        // 如果是 logout 请求，允许通过（用于清理操作）
        if (ctx.originalUrl && ctx.originalUrl.endsWith('/logout')) {
          return false;
        }
      }
      return isRevoked;
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
        ctx.status = 200;
        ctx.body = {
          code: 401,
          msg: "UnauthorizedError",
        };
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

  // 日志轮转配置（防止日志文件过大）
  config.logrotator = {
    // 按文件大小轮转
    filesRotateBySize: [
      path.join(appInfo.root, 'logs', appInfo.name, 'common-error.log'),
      path.join(appInfo.root, 'logs', appInfo.name, 'egg-agent.log'),
      path.join(appInfo.root, 'logs', appInfo.name, 'egg-web.log'),
    ],
    maxFileSize: 50 * 1024 * 1024, // 单个日志文件最大 50MB
    maxFiles: 10, // 最多保留 10 个备份文件
    // 按小时轮转（也可以选择按天）
    filesRotateByHour: [
      path.join(appInfo.root, 'logs', appInfo.name, appInfo.name + '-web.log'),
    ],
    maxDays: 7, // 日志保留 7 天
  };

  // 基础日志配置
  config.logger = {
    level: 'INFO',
    consoleLevel: 'INFO',
    dir: path.join(appInfo.root, 'logs', appInfo.name),
    // 错误日志单独配置
    errorLogName: 'common-error.log',
    // 禁用日志字段缓存（避免日志信息不完整）
    buffer: true,
  };

  return config;
};
