/*
!name=祖安语录
!desc=儒雅随和，用于兑现，指令为,diss
!priority=10
 */
import { Content } from "telegraf";
import { command } from "decrateor";

export default command(",diss")(async (ctx: Content) => {
  const dissMessage = await getDissMessage();
  if (dissMessage) {
    await ctx.reply(dissMessage);
  } else {
    await ctx.reply("出错了呜呜呜 ~ 试了好多好多次都无法访问到 API 服务器 。");
  }
});

// 定义一个函数来发送diss消息
async function getDissMessage(): Promise<string | null> {
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(
        "https://api.oddfar.com/yl/q.php?c=1009&encode=text"
      );
      if (response.ok) {
        const text = await response.text();
        return text;
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
    }
  }
  return null;
}
