import { Sandbox } from "./lib/sandbox.ts"; // 假设你有一个沙盒环境用来执行插件
import {
  functionCache,
  initializeFunctionCache,
  updateFunctionCache,
} from "./lib/cache.ts";
import { Content } from "telegraf";

export class PluginManager {
  private sandbox: Sandbox;
  private debounceTimeoutId: number | null = null;
  private DEBOUNCE_DELAY = 300; // 设定防抖延迟时间为 300ms
  private fileLastModifiedTime: Record<string, number> = {}; // 用来记录文件的修改时间戳

  constructor(private pluginDir: string) {
    this.sandbox = new Sandbox();
    this.pluginDir = pluginDir;
  }

  // 初始化插件管理器
  async initialize() {
    // 初始化缓存
    await initializeFunctionCache(this.pluginDir);
    console.log("✅ 插件初始化完成!");

    // 开始监听插件目录的文件变化
    await this.watchPluginDirectory(this.pluginDir);
  }

  // 遍历缓存并执行每个插件
  async executePlugins(ctx: Content) {
    // 遍历缓存并执行每个插件
    for (const [pluginName, pluginCode] of functionCache.entries()) {
      try {
        await this.sandbox.execute(pluginCode, ctx);
      } catch (error) {
        await ctx.reply(`<b>⚠️ Error executing plugin ${pluginName}:</b>\n<pre>${error.message}</pre>`,{ parse_mode: 'HTML' });
        console.error(`❌ [${pluginName}] 插件调用失败:`, error.message);
      }
    }
  }

  // 监控插件目录的变化
  private async watchPluginDirectory(directory: string) {
    const watcher = Deno.watchFs(directory);

    for await (const event of watcher) {
      if (
        event.kind === "modify" || event.kind === "create" ||
        event.kind === "remove"
      ) {
        // 清除上一次的防抖定时器
        if (this.debounceTimeoutId) {
          clearTimeout(this.debounceTimeoutId);
        }

        // 延迟防抖处理
        this.debounceTimeoutId = setTimeout(async () => {
          for (const filePath of event.paths) {
            const pluginName = filePath.split("/").pop()?.replace(".ts", "") ||
              "";

            // 如果文件修改时间在防抖延迟期间没有变化，则跳过
            const currentTime = Date.now();
            const lastModifiedTime = this.fileLastModifiedTime[pluginName] || 0;

            // 如果文件的最后修改时间和当前时间差异太小，表示文件未稳定，跳过处理
            if (currentTime - lastModifiedTime < this.DEBOUNCE_DELAY) {
              console.log(`Skipping duplicate change for ${pluginName}`);
              continue; // 跳过重复的文件变更
            }

            // 更新文件的最后修改时间戳
            this.fileLastModifiedTime[pluginName] = currentTime;

            if (pluginName) {
              try {
                const pluginCode = await Deno.readTextFile(filePath);

                // 更新缓存
                updateFunctionCache(pluginName, pluginCode);
                console.log(`✅ [${pluginName}] 插件重载完成`)
              } catch (error) {
                console.error(`Error executing plugin ${pluginName}:`, error);
              }
            }
          }
        }, this.DEBOUNCE_DELAY); // 300ms 防抖延迟
      }
    }
  }
}
