/*
!name=apt命令
!desc=用于安装卸载插件
!priority=8
 */

import { dirname, resolve, join } from "path";
import { Content } from "telegraf";
import { command } from "decrateor";

export default command(",apt")(async (ctx: Content) => {
  const messageText = ctx?.message?.text ?? "";
  const [, action, pluginName] = messageText.split(" ");

  // 处理移除插件
  if (action === "remove") {
    if (!pluginName) {
      return await ctx.reply("请传入移除插件名称");
    }
    await removePlugin(ctx, pluginName);
  }
  // 处理安装插件
  else if (action === "install") {
    await installPlugin(ctx);
  } else {
    await ctx.reply(",apt install\t直接回复文件\n ,apt remove [插件名]");
  }
});

//移除插件
async function removePlugin(ctx: Content, pluginName: string) {
  const __dirname = dirname(new URL(import.meta.url).pathname);
  const rootDir = resolve(__dirname, "..");
  const pluginDir = join(rootDir, "plugins", `${pluginName}.ts`);

  try {
    // 删除插件文件
    await Deno.remove(pluginDir);
    await ctx.reply(`移除${pluginName}插件成功喵～`);
  } catch (error) {
    await ctx.reply(`移除插件失败！${error}`);
  }
}

//安装插件
async function installPlugin(ctx: Content) {
  const message = ctx?.message?.reply_to_message;
  if (!message?.document) {
    return await ctx.reply("⚠️请在需要安装的插件下回复该指令～");
  }

  const file = message.document;
  const fileName = file.file_name;

  if (!fileName?.match(/\.ts$/)) {
    return await ctx.reply("插件格式错误，仅支持 .ts 格式");
  }

  try {
    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    const pluginContent = await (await fetch(fileLink.href)).text();
    const pluginName = fileName.replace(/\.ts$/, "");

    const __dirname = dirname(new URL(import.meta.url).pathname);
    const rootDir = resolve(__dirname, "..");
    const pluginDir = join(rootDir, "plugins", `${pluginName}.ts`);

    // 写入插件文件
    await Deno.writeTextFile(pluginDir, pluginContent);
    await ctx.reply(`添加 [${pluginName}] 插件成功喵～`);
  } catch (error) {
    await ctx.reply(`安装插件失败！${error}`);
  }
}
