/*
!name=圈x脚本查询
!desc=用于查询sliverkiss收集的圈x脚本
!priority=10
 */

import { Context } from "telegraf";
import { command } from "decrateor";

export default command("/script")(async (ctx: Context) => {
  const keyWord = ctx?.message?.text?.split(" ").slice(1).join(" ") || "";
  if (!keyWord) {
    return await ctx.reply("⚠️ 请传入要查询的关键词~", {
      parse_mode: "HTML",
    });
  }

  const data = await getData();
  const result = extractData(data).filter(({ tagName }) =>
    tagName?.toLowerCase().includes(keyWord.toLowerCase())
  );

  if (!result.length) {
    return await ctx.reply("⚠️ 未查询到相关脚本~", { parse_mode: "HTML" });
  }

  const hitokito = await getHitokito();
  const inlineKeyboard = result.map((e) => [
    { text: e?.tagName, url: e?.jsLink },
    { text: "图标链接", url: e?.imgUrl },
  ]);

  await ctx.reply(hitokito, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
});

// 提取数据
function extractData(
  arr: any[]
): { jsLink?: string; tagName?: string; imgUrl?: string }[] {
  const jsRegex = /https:\/\/[^\s,]+\.js/;
  const tagRegex = /tag=([^,]+)/;
  const imgUrlRegex = /img-url=([^,]+)/;

  return arr.flatMap(({ config }) => {
    const jsLink = jsRegex.exec(config)?.[0];
    const tagName = tagRegex.exec(config)?.[1];
    const imgUrl = imgUrlRegex.exec(config)?.[1];

    return jsLink || tagName || imgUrl ? [{ jsLink, tagName, imgUrl }] : [];
  });
}

// 获取数据
async function getData(): Promise<any> {
  const response = await fetch(
    "https://gist.githubusercontent.com/Sliverkiss/a7496bd073820942b44a9b36874aaf4c/raw/sliverkiss.gallery.json"
  );
  const data = await response.json();
  return data.task;
}

// 获取Hitokito（随机一言）
async function getHitokito(): Promise<string> {
  const hitokotoType: Record<string, string> = {
    a: "动画",
    b: "漫画",
    c: "游戏",
    d: "小说",
    e: "原创",
    f: "网络",
    g: "其他",
    h: "影视",
    i: "诗词",
    j: "网易云音乐",
    k: "哲学",
    l: "抖机灵",
  };

  try {
    let hitokotoJson = null;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch("https://v1.hitokoto.cn/?charset=utf-8");
        hitokotoJson = await response.json();
        if (hitokotoJson) break;
      } catch (error) {
        if (i === 9) {
          console.error(error);
          return "Failed to fetch data after multiple attempts.";
        }
      }
    }

    if (!hitokotoJson) {
      return "Failed to fetch data after multiple attempts.";
    }

    let additional = "";
    if (hitokotoJson.from) additional += `《${hitokotoJson.from}》`;
    if (hitokotoJson.type && hitokotoType[hitokotoJson.type])
      additional += `（${hitokotoType[hitokotoJson.type]}）`;
    if (hitokotoJson.from_who) additional += `${hitokotoJson.from_who}`;

    return `${hitokotoJson.hitokoto} ${additional}`;
  } catch (e) {
    return "Failed to fetch data after multiple attempts.";
  }
}
