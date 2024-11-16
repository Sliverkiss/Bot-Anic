import { Content } from "telegraf";

class Sandbox {
  constructor() {}

  // 执行代码的函数，传入任何对象和上下文
  async execute(code: string, ctx: Content) {
    const sandboxContext = this.createContextProxy(ctx);

    try {
      const result = await this.runInSandbox(code, sandboxContext);
      return result; // 返回执行结果
    } catch (err) {
      throw err;
    }
  }

  // 创建通用的 Proxy 对象，可以代理任何包含方法的对象
  private createContextProxy(ctx: Content) {
    return new Proxy(ctx, {
      get(target, prop) {
        // 如果访问的是一个函数（即方法），则返回一个可调用的函数
        if (typeof target[prop] === "function") {
          return (...args: Content[]) => {
            try {
              return target[prop](...args); // 调用目标方法
            } catch (error) {
              console.error(`Error in ${String(prop)}:`, error);
              throw error;
            }
          };
        }
        // 默认返回目标对象中的属性
        return target[prop];
      },
    });
  }

  // 运行代码，进行模块加载
  private async runInSandbox(code: string, ctx: Content) {
    // 将代码转换为模块 Blob URL（适用于 Deno 的环境）
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);

    try {
      const module = await import(url); // 使用 import 动态导入模块
      if (typeof module.default === "function") {
        return module.default(ctx); // 执行模块中的默认导出函数
      } else {
        throw new Error("Module must export a default function.");
      }
    } catch (error) {
      throw new Error(`Failed to execute sandbox code: ${error}`);
    } finally {
      // 清理 Blob URL，避免内存泄漏
      URL.revokeObjectURL(url);
    }
  }
}

export { Sandbox };
