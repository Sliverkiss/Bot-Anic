/*
!name=autoDelete插件
!desc=自动删除bot发送的消息，并默认bot在发言下面回复
!priority=1000
*/

import { Context } from 'telegraf';  // 根据需要引入 telegraf 的类型

export default function (ctx: Context) {
    // 存储原始的 ctx.reply 方法
    const originalReply = ctx.reply.bind(ctx);

    // 重写 ctx.reply 方法
    ctx.reply = async (...args: [string, { [key: string]: any }?]): Promise<any> => {
        try {
            const options = args[1] || {};

            // 如果 ctx.message 存在，添加 reply_to_message_id 选项
            if (ctx?.message?.message_id) {
                options.reply_to_message_id = ctx?.message?.reply_to_message?.message_id || ctx.message.message_id;
            }

            // 调用原始的 ctx.reply 方法并传递修改后的选项
            const sentMessage = await originalReply(args[0], options);

            // 检查是否是 bot 发送的消息
            if (sentMessage && sentMessage?.message_id) {
                const messageId = sentMessage.message_id;
                const chatId = sentMessage.chat.id;

                // 获取命令（如果存在）
                const command = ctx?.message?.text?.split(" ")[0];
                console.log(`⭕️ 检测到指令 [${command}]`);
                // 设置定时删除
                setTimeout(async () => {
                    try {
                        await ctx.telegram.deleteMessage(chatId, messageId);
                    } catch (error) {
                        // 捕获删除消息时的异常
                        console.error('Error deleting message:', error);
                    }
                }, 60000); // 60秒后删除消息
            }

            // 返回发送的消息
            return sentMessage;
        } catch (e) {
            // 捕获删除消息时的异常
            console.error('Error deleting message:', error);
        }
    };
}
