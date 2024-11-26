/*
!name=舔狗语录
!desc=随机获取一条舔狗语录并返回
!priority=10
 */

import { Context } from "telegraf";
import { command } from "decrateor";

export default command(",tiangou")(async (ctx: Context) => {
  const response = await fetch(`https://api.52vmy.cn/api/wl/yan/tiangou`);
  const res = await response.json();
  if (res.code === 200) {
    await ctx.reply(res.content);
  } else {
    await ctx.reply(`出错了呜呜呜 ~ API 服务器返回了错误。\n${res.msg || ""}`);
  }
});
