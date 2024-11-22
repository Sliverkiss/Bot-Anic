/*
!name=插件
!desc=帮助，用于查询插件属性信息
!priority=10
 */

import { Content } from "telegraf";
import { pluginCache } from "cache";

export default function (ctx: Content) {
  if (!ctx?.message?.text?.startsWith(",help")) return;
  const [, pluginName] = ctx?.message?.text?.split(" ");
  const plugin = pluginCache.get(pluginName);
  if (plugin) {
    //回复
    ctx.reply(JSON.stringify(plugin));
  } else {
    ctx.reply("查找的插件信息不存在");
  }
}
