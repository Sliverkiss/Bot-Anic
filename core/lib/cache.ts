const functionCache = new Map<string, string>();

// 初始化缓存：遍历 plugins 目录，读取所有 .ts 文件并缓存
export async function initializeFunctionCache(pluginsDir: string) {
  try {
    for await (const file of Deno.readDir(pluginsDir)) {
      if (file.isFile && file.name.endsWith('.ts')) {
        const filePath = `${pluginsDir}/${file.name}`;
        const functionName = file.name.replace('.ts', ''); // 使用文件名作为缓存的 key
        const fileContent = await Deno.readTextFile(filePath);  // 异步读取文件内容

        functionCache.set(functionName, fileContent); // 缓存插件
      }
    }

    //console.log('Function cache initialized:', functionCache);
  } catch (error) {
    console.error('Error initializing function cache:', error);
  }
}

// 清除特定缓存
export function clearFunctionCache(key: string) {
  functionCache.delete(key);
  console.log(`Cache cleared for key: ${key}`);
}

// 更新缓存：将新的插件代码添加到缓存
export function updateFunctionCache(pluginName: string, pluginCode: string) {
  functionCache.set(pluginName, pluginCode); // 更新或添加插件
  console.log(`🚀 [${pluginName}] 检测到插件变化，开始重载...`);
}

// 导出缓存
export { functionCache };
s