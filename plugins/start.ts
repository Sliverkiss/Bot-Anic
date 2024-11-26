/*
!name=开始插件
!desc=/start命令，用于bot起始打招呼
!priority=10
 */

import { Context } from "telegraf";
import { command } from "decrateor";

export default command("/start")((ctx: Context) => {
  ctx.reply("你好！这里是Anic-Bot，有什么可以为您效劳的吗？");
});