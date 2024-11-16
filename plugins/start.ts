import { Content } from "telegraf";

export default function (ctx: Content) {
  if (!ctx?.message?.text?.startsWith("/start")) return;
  //回复
  ctx.reply("你好！这里是Anic-Bot，有什么可以为您效劳的吗？");
}
