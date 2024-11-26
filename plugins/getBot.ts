/*
!name=获取bot信息
!desc=指令[/getBot],查询bot的相关信息
!priority=10
 */

import { command } from "decrateor";
import { Context } from "telegraf";
import { toYml } from "Utils";

export default command("/getBot")(async (ctx: Context) => {
  const botInfo = await ctx.telegram.getMe();
  ctx.reply(`<pre>${toYml(botInfo)}</pre>`, { parse_mode: "HTML" });
})
