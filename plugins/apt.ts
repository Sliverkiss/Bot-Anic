import { dirname, join, resolve } from "path";

export default async function (ctx) {
  if (!ctx?.message?.text.startsWith(",apt")) return;
  //移除插件
  if (ctx?.message?.text.startsWith(",apt remove")) {
    const [, , pluginName] = ctx?.message?.text?.split(" ");
    if (!pluginName) {
      return await ctx.reply("请传入移除插件名称");
    }
    const __dirname = dirname(new URL(import.meta.url).pathname);
    const rootDir = resolve(__dirname, "..");
    const pluginDir = join(rootDir, "plugins", `${pluginName}.ts`);

    try {
      // 删除文件
      await Deno.remove(pluginDir);
      await ctx.reply(`移除${pluginName}插件成功喵～`);
    } catch (error) {
      throw new Error(`移除插件失败！${error.message}`);
    }
  } else if (ctx?.message?.text.startsWith(",apt install")) {
    const message = ctx?.message?.reply_to_message;
    if (!message?.document) {
      return await ctx.reply("⚠️请在需要安装的插件下回复该指令～");
    }

    const file = message.document;
    const fileId = file.file_id;
    const fileName = file.file_name;

    if (!fileName?.match(/\.ts$/)) {
      throw new Error("插件格式错误");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);
    const pluginContent = await response.text();

    const pluginName = fileName.replace(/\.ts$/, "");

    const __dirname = dirname(new URL(import.meta.url).pathname);
    const rootDir = resolve(__dirname, "..");
    const pluginDir = join(rootDir, "plugins", `${pluginName}.ts`);

    try {
      // 写入文件内容
      await Deno.writeTextFile(pluginDir, pluginContent);
      await ctx.reply(`添加 [${pluginName}] 插件成功喵～`);
    } catch (error) {
      throw new Error(`移除插件失败！${error.message}`);
    }
  } else {
    await ctx.reply(",apt install\t直接回复文件\n ,apt remove [插件名]");
  }
}
