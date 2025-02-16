/*
!name=javDB查询
!desc=看片人士必备，用于快速查找番号
!priority=10
 */

import cheerio from "cheerio";
import { Context } from "telegraf";

// 定义类型
interface MovieItem {
  code: string;
  link: string;
  title: string;
  thumb: string;
  score: string;
  meta: string;
  hasMagnet: boolean;
  director?: string;
  maker?: string;
  series?: string;
  duration?: string;
  actors?: Array<{name: string, gender: 'male' | 'female'}>;
  tags?: string[];
  previewVideo?: string;
  previewImages?: string[];
  detail?: {
    director?: string;
    maker?: string;
    series?: string;
    duration?: string;
    releaseDate?: string;
    actors?: Array<{name: string, gender: 'male' | 'female'}>;
    tags?: string[];
    previewVideo?: string;
    previewImages?: string[];
  };
}

class JavDB {
  code: string;
  baseURL: string;
  list: MovieItem[];

  constructor(code = "") {
    this.code = code.toUpperCase();
    this.baseURL = "https://javdb.com";
    this.list = [];
  }

  async search() {
    const res = await fetch(`https://javdb.com/search?q=${this.code}&f=all`, {
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
      },
    });
    const data = await res.text();
    const $ = cheerio.load(data);
    const $list = $(".movie-list");

    this.list = $list
      .find(".item")
      .toArray()
      .map((item) => {
        const $a = $(item).find("a");
        return {
          code:
            /([A-Za-z]+-\d+)/
              .exec($a.find(".video-title").text()?.trim())?.[1]
              ?.replace(/\s+/g, "")
              ?.toUpperCase() || "",
          link: this.baseURL + $a.attr("href")!,
          title: $a.find(".video-title").text()?.trim() || "",
          thumb: $a.find(".cover img").attr("src")!,
          score: $a.find(".score span.value").text()?.trim() || "",
          meta: $a.find(".meta").text()?.trim() || "",
        };
      });
  }

  async getMagnet(url: string) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
      },
    });
    const data = await res.text();
    const $ = cheerio.load(data);
    const magnet = $("#magnets-content .item")
      .toArray()
      .map((item) => {
        const $item = $(item);
        const $a = $item.find(".magnet-name > a");
        return {
          link: this.baseURL + $a.attr("href")!,
          name: $a.find(".name").text()?.trim() || "",
          size: $a.find(".meta").text()?.trim() || "",
          tag: $a.find(".tags .tag").text()?.trim() || "",
          date: $item.find(".date .time").text()?.trim() || "",
        };
      });
    return magnet;
  }

  async getDetail(url: string) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const detail: any = {};
    
    // 通用函数：获取面板中的值
    const getPanelValue = (label: string) => {
      const el = $(`.panel-block strong:contains("${label}")`).parent().find('.value');
      return el.text().trim();
    };

    // 通用函数：获取面板中的链接值
    const getPanelLinkValue = (label: string) => {
      const el = $(`.panel-block strong:contains("${label}")`).parent().find('.value a');
      return el.first().text().trim();
    };

    // 获取基本信息
    detail.director = getPanelLinkValue('導演');
    detail.maker = getPanelLinkValue('片商');
    detail.series = getPanelLinkValue('系列');
    detail.duration = getPanelValue('時長');
    detail.releaseDate = getPanelValue('日期');
    
    // 获取演员列表
    const actorsBlock = $(`.panel-block strong:contains("演員")`).parent().find('.value');
    detail.actors = actorsBlock.find('a').map((_, el) => {
      const $el = $(el);
      return {
        name: $el.text().trim(),
        gender: $el.next('.symbol').hasClass('female') ? 'female' : 'male'
      };
    }).get();

    // 获取标签
    const tagsBlock = $(`.panel-block strong:contains("類別")`).parent().find('.value');
    detail.tags = tagsBlock.find('a').map((_, el) => $(el).text().trim()).get();

    // 获取评分
    const scoreEl = $('.score');
    if (scoreEl.length) {
      detail.score = scoreEl.find('.value').text().trim();
    }

    // 获取预览内容
    const previewVideo = $('#preview-video source').attr('src');
    if (previewVideo) {
      detail.previewVideo = previewVideo;
    }

    // 获取预览图片
    const previewImages = $('.preview-images .tile-item.preview-images-item');
    if (previewImages.length) {
      detail.previewImages = previewImages.map((_, el) => $(el).attr('href')).get();
    }

    // 过滤掉空值
    Object.keys(detail).forEach(key => {
      if (!detail[key] || 
          (Array.isArray(detail[key]) && detail[key].length === 0) || 
          detail[key] === '') {
        delete detail[key];
      }
    });

    return detail;
  }

  async main() {
    await this.search();
    const item = this.list.find((item) => item.code === this.code);
    if (item) {
      const detail = await this.getDetail(item.link);
      Object.assign(item, { detail });
    }
    return item;
  }
}

// 导出执行方法
export default async function (ctx: Context) {
  // 处理 inline query
  if (ctx.inlineQuery) {
    const query = ctx.inlineQuery.query.trim().toUpperCase();
    if (!query) return;
    console.log(query);

    try {
      const javdb = new JavDB(query);
      await javdb.search();
      
      if (javdb.list.length > 0) {
        // 构建搜索结果列表
        const results = javdb.list.map((item, index) => ({
          type: 'article',
          id: index.toString(),
          title: item.title,
          description: item.meta,
          thumb_url: item.thumb,
          input_message_content: {
            message_text: `${item.title}`,
          },
          reply_markup: {
            inline_keyboard: [[
              {
                text: "获取详情",
                callback_data: `detail_${item.code}`
              }
            ]]
          }
        }));

        await ctx.answerInlineQuery(results, {
          cache_time: 10, // 缓存1小时
        });
      } else {
        await ctx.answerInlineQuery([], {
          switch_pm_text: "未找到相关番号",
          switch_pm_parameter: "start"
        });
      }
    } catch (error) {
      console.error(error);
      await ctx.answerInlineQuery([], {
        switch_pm_text: "搜索出错，请稍后重试",
        switch_pm_parameter: "error"
      });
    }
    return;
  }

  // 处理 callback query (当用户点击"获取详情"按钮时)
  if (ctx.callbackQuery && ctx.callbackQuery.data?.startsWith('detail_')) {
    const code = ctx.callbackQuery.data.replace('detail_', '');
    const javdb = new JavDB(code);
    const movie = await javdb.main();
    
    if (movie) {
      const { id } = extractInfo(movie?.title);
      let score = generateRating(movie?.score);
      
      // 构建详细信息
      const details: string[] = [];
      if (movie.detail?.director) details.push(`导演: ${movie.detail.director}`);
      if (movie.detail?.releaseDate) details.push(`日期: ${movie.detail.releaseDate}`);
      if (movie.detail?.actors) {
        const actors = movie.detail.actors.map(a => a.name).join('、');
        details.push(`演员: ${actors}`);
      }

      // 构建按钮
      const buttons = [[
        {
          text: "在线观看",
          url: `https://missav.com/${code}`
        }
      ]];

      // 如果有预览视频，添加预览按钮
      if (movie.detail?.previewVideo) {
        const previewVideo = movie.detail.previewVideo.startsWith('https:') ? 
          movie.detail.previewVideo : 
          'https:' + movie.detail.previewVideo;
          
        buttons[0].push({
          text: "预告片",
          url: previewVideo
        });
      }

      await ctx.editMessageText(`
番号: ${id}
${movie?.title}
${details.join('\n')}
评分    ${score}

<a href="${movie.thumb}">封面图</a>
`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: buttons
        }
      });
    }
  }

  // 原有的命令处理逻辑
  if (!ctx?.message?.text?.startsWith("/av")) return;
  // 发送初始消息
  let message = await ctx.reply("🐱正在查找中...");
  try {
    // 假设从用户消息中提取到的番号代码
    let code =
      ctx?.message?.text?.split(" ").slice(1).join(" ") ||
      ctx?.message?.reply_to_message?.text;
    code = code.trim().toUpperCase();
    console.log(`当前需要查找的番号: ${code}`);

    // 创建JavDB实例并查询信息
    const javdb = new JavDB(code);
    const movie = await javdb.main();
    console.log(movie);
    if (movie) {
      // 番号和介绍
      const { id, description } = extractInfo(movie?.title);
      // 评分
      let score = generateRating(movie?.score);
      
      // 构建详细信息字符串
      const details: string[] = [];
      if (movie.detail?.director) details.push(`导演: ${movie.detail.director}`);
      if (movie.detail?.series) details.push(`系列: ${movie.detail.series}`);
      if (movie.detail?.releaseDate) details.push(`日期: ${movie.detail.releaseDate}`);
      
      // 处理演员信息
      if (movie.detail?.actors && movie.detail.actors.length > 0) {
        const actors = movie.detail.actors.map(a => a.name).join('、');
        details.push(`演员: ${actors}`);
      }

      // 处理标签信息
      if (movie.detail?.tags && movie.detail.tags.length > 0) {
        const tags = movie.detail.tags.join('、');
        details.push(`标签: ${tags}`);
      }

      // 构建完整的 caption
      const caption = `
番号: ${id}
${movie?.title}
${details.join('\n')}
评分    ${score}`;

      // 构建按钮数组
      const buttons = [
        {
          text: "在线观看",
          url: `https://missav.ws/${code}`
        }
      ];

      // 如果有预览视频，添加预览按钮
      if (movie.detail?.previewVideo) {
        const previewVideo = movie.detail.previewVideo.startsWith('https:') ? movie.detail.previewVideo : 'https:' + movie.detail.previewVideo;
        buttons.push({
          text: "预告片",
          url: previewVideo
        });
      }

      // 删除之前的消息
      await ctx.telegram.deleteMessage(message.chat.id, message.message_id);
      
      // 发送带图片的新消息
      message = await ctx.telegram.sendPhoto(
        message.chat.id,
        movie.thumb,
        {
          caption: caption,
          parse_mode: "HTML",
          has_spoiler: true,
          reply_markup: {
            inline_keyboard: [buttons]
          }
        }
      );
      
      // 设置定时删除
      setTimeout(async () => {
        await ctx.telegram.deleteMessage(message.chat.id, message.message_id);
      }, 60000); // 60秒后删除消息
    } else {
      // 修改消息，告知番号未找到
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        null,
        "未找到相关番号，请重试。"
      );
    }
  } catch (error) {
    console.error(error);
    // 发送错误消息
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message.message_id,
      null,
      "查询时出错，请稍后重试。"
    );
  }
}

// 生成评分函数
function generateRating(text: string): string {
  const scoreMatch = text.match(/(\d+(\.\d+)?)分/);
  if (!scoreMatch) {
    return "无效的评分格式";
  }

  let score = parseFloat(scoreMatch[1]);
  if (score < 0) score = 0;
  if (score > 5) score = 5;

  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  const rating =
    "★".repeat(fullStars) +
    "☆".repeat(emptyStars) +
    (halfStar ? "★" : "☆").slice(0, halfStar);
  return `${rating} ${score.toFixed(2)}分`;
}

// 提取番号和介绍
function extractInfo(text: string): {
  id: string | null;
  description: string | null;
} {
  const idRegex = /[A-Z]+-\d+/;
  const descriptionRegex = /([A-Z]+-\d+)\s+(.+)/;

  const idMatch = text.match(idRegex);
  const id = idMatch ? idMatch[0] : null;

  const descriptionMatch = text.match(descriptionRegex);
  const description = descriptionMatch ? descriptionMatch[2] : null;

  return { id, description };
}
