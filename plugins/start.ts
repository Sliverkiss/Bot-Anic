 /*
!name=开始插件
!desc=/start命令，用于bot起始打招呼
!priority=10
 */

import { Content } from "telegraf";

export default function (ctx: Content) {
  if (!ctx?.message?.text?.startsWith("/start")) return;
  //回复
  ctx.reply("你好！这里是Anic-Bot，有什么可以为您效劳的吗？");
}
