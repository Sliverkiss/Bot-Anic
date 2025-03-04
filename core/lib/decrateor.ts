import {Content} from "telegraf";

export function command(cmd: string | ((text: string) => boolean)) {
    return function (handler: (ctx: Content) => void) {
      return function (ctx: Content) {
        const messageText = ctx?.message?.text ?? ''; // 获取消息文本，确保不为 undefined 或 null
  
        // 处理匹配逻辑：如果是字符串，检查 startsWith；如果是函数，调用函数判断
        const isMatch = typeof cmd === 'string' 
          ? messageText.startsWith(cmd)
          : typeof cmd === 'function' && cmd(ctx);
  
        // 如果匹配，则执行 handler
        if (isMatch) {
          try {
              handler(ctx);
          } catch(e) {
              ctx.reply(e)
          }
        }
      };
    };
  }