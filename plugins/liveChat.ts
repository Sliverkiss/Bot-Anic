/*
!name=私聊liveChat
!desc=开启bot双向私聊功能
!priority=10
 */

import { Context } from "telegraf";
import { command } from "decrateor";
import { kv } from "kv";

export default command((ctx) => ctx?.chat?.type === "private")(
  async (ctx: Context) => {
    const chatId = ctx.chat.id.toString();
    const messageId = ctx.message.message_id.toString();
    const adminUserId = "5232284790"; // 字符串类型

    // 加载 liveChatList
    const result = await kv.get<{ [key: string]: string }>(["liveChatList"]);
    const liveChatList = new Map<string, string>(
      Object.entries(result?.value || {})
    );

    // 如果消息来自管理员
    if (chatId === adminUserId) {
      const originalMessageId =
        ctx.message.reply_to_message?.message_id?.toString();

      // 如果是回复消息且映射中存在对应的用户
      if (originalMessageId && liveChatList.has(originalMessageId)) {
        const originalUserId = liveChatList.get(originalMessageId)!;

        // 处理管理员发送的消息
        await handleAdminMessage(ctx, originalUserId);
      }
    } else {
      // 将用户消息转发给管理员
      try {
        const sentMessage = await ctx.telegram.forwardMessage(
          adminUserId,
          chatId,
          parseInt(messageId)
        );
        liveChatList.set(sentMessage.message_id.toString(), chatId);

        // 将 Map 转换为普通对象并保存到数据库
        const liveChatListObject = Object.fromEntries(liveChatList);
        await kv.set(["liveChatList"], liveChatListObject);
      } catch (error) {
        console.error("Error forwarding message to admin:", error);
      }
    }
  }
);

/**
 * 处理管理员回复的消息
 */
async function handleAdminMessage(ctx: Context, userId: string) {
  const message = ctx.message;

  switch (true) {
    case !!message.text:
      await ctx.telegram.sendMessage(userId, message.text);
      break;
    case !!message.photo:
      const photo = message.photo.pop(); // 获取最后一张图片
      if (photo) {
        await ctx.telegram.sendPhoto(userId, photo.file_id);
      }
      break;
    case !!message.document:
      await ctx.telegram.sendDocument(userId, message.document.file_id);
      break;
    case !!message.video:
      await ctx.telegram.sendVideo(userId, message.video.file_id);
      break;
    case !!message.audio:
      await ctx.telegram.sendAudio(userId, message.audio.file_id);
      break;
    case !!message.sticker:
      await ctx.telegram.sendSticker(userId, message.sticker.file_id);
      break;
    default:
      console.log("Unsupported message type.");
      break;
  }
}
