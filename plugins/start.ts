export default function (ctx) {
    if (ctx?.message?.text?.startsWith("/start")) {
        ctx.reply("你好！这里是Anic-Bot，有什么可以为您效劳的吗？");
    }
    return "First plugin resultaaaaa";
}