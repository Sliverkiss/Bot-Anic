import { Telegraf,Context } from "telegraf";
import { PluginManager } from "./core/pluginManager.ts";
import { config } from "dotenv";


// 加载 .env 文件中的环境变量
const env = config();
const botToken = env.BOT_TOKEN;  // 获取 BOT_TOKEN 环境变量

if (!botToken) {
  throw new Error("BOT_TOKEN is not set in the environment variables");
}

// 初始化机器人和插件管理器
const bot = new Telegraf(botToken);

// 初始化插件管理器
const pluginManager = new PluginManager("./plugins");

// 设置插件管理器初始化和 Telegraf 机器人中间件

(async () => await pluginManager.initialize())().catch((e) => console.log(e));

// 设置中间件类型
bot.use(async (ctx: Context, next: () => Promise<void>) => {
  // 执行插件
  await pluginManager.executePlugins(ctx);
  
  // 调用下一步中间件
  return next();
});


bot.launch();
console.log("🚀 Bot is running...");
