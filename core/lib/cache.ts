import { parsePlugin } from "Utils";
import { Plugin } from "../kv/plugin.ts";
import { join } from "path";
import { rootDir } from "fs";

export const functionCache = new Map<string, any>();
export const pluginCache = new Map<string, Plugin>();
export let pluginList = new Array<Plugin>();

// 初始化缓存：遍历 plugins 目录，读取所有 .ts 文件并缓存
export async function initializeFunctionCache(pluginsDir: string) {
  try {
    for await (const file of Deno.readDir(pluginsDir)) {
      if (file.isFile && file.name.endsWith(".ts")) {
        const filePath = `${pluginsDir}/${file.name}`;

        const functionName = file.name.replace(".ts", ""); // 使用文件名作为缓存的 key
        const fileContent = await Deno.readTextFile(filePath); // 异步读取文件内容
        //读取插件属性
        const pluginData = {
          uuid: functionName,
          priority: 10, //默认优先级为10
          ...parsePlugin(fileContent),
        };

        const configPath = join(rootDir, "plugins", `${functionName}.ts`);
        const module = await import(`${configPath}?t=${Date.now()}`);
        //缓存插件数据
        pluginCache.set(functionName, pluginData);
        //将编译后的javascript代码写入缓存
        functionCache.set(functionName, module); // 缓存插件
      }
    }
    //将map转换为数组
    pluginList = Array.from(pluginCache.values());
    // 根据 priority 属性排序，数字大的在前
    pluginList.sort((a, b) => b.priority - a.priority);
  } catch (error) {
    console.error("Error initializing function cache:", error);
  }
}

// 清除特定缓存
export function clearFunctionCache(key: string) {
  functionCache.delete(key);
  console.log(`Cache cleared for key: ${key}`);
}

// 更新缓存：将新的插件代码添加到缓存
export async function updateFunctionCache(
  pluginName: string,
  pluginCode: string
) {
  //读取插件属性
  const pluginData = {
    uuid: pluginName,
    priority: 10, //默认优先级为10
    ...parsePlugin(pluginCode),
  };
  //更新插件数据
  pluginCache.set(pluginName, pluginData);
  functionCache.delete(pluginName);
  
  //将map转换为数组
  pluginList = Array.from(pluginCache.values());
  pluginList.sort((a, b) => b.priority - a.priority);

  //加载路径下的模块
  const configPath = join(rootDir, "plugins", `${pluginName}.ts`);
  const module = await import(`${configPath}?t=${Date.now()}`);

  //缓存插件数据
  functionCache.set(pluginName, module); // 缓存插件
  console.log(`🚀 [${pluginName}] 检测到插件变化，开始重载...`);
}
