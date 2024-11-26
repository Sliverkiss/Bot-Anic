/*
!name=插件
!desc=帮助，用于查询插件属性信息
!priority=10
 */

import { Context } from "telegraf";
import { pluginCache } from "cache";
import { toYml } from "Utils";
import { command } from "decrateor";

export default command(",help")((ctx: Context) => {
  if (ctx?.message?.text == ",help list") {
    ctx.reply(`<pre>${Array.from(pluginCache.keys()).join(",")}</pre>`, {
      parse_mode: "HTML",
    });
  } else {
    const [, pluginName] = ctx?.message?.text?.split(" ");
    const plugin = pluginCache.get(pluginName);
    if (plugin) {
      //回复
      ctx.reply(`<pre>${toYml(plugin)}</pre>`, { parse_mode: "HTML" });
    } else {
      ctx.reply("查找的插件信息不存在");
    }
  }
});
