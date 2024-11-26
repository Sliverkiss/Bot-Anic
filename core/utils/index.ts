//读取插件中的属性注释
export function parsePlugin(fileContent: string): Record<string, string> {
  // 使用正则提取所有 "!key=value" 格式的注释
  const regex = /!\s*([\w]+)\s*=\s*([^\n\r]+)/g;
  return Array.from(fileContent.matchAll(regex)).reduce((attributes, match) => {
    const key = match[1].trim();
    const value = match[2].trim();
    attributes[key] = value;
    return attributes;
  }, {} as Record<string, string>);
}

//将对象转换成字符串
export function toStr<T>(obj: T, defaultValue: string | null = null, ...args: any[]): string | null {
    try {
        return JSON.stringify(obj, ...args);
    } catch {
        return defaultValue;
    }
}
//将对象转换成yaml
export function toYml(jsonObj: Record<string, any>, indent: number = 0): string {
    const result: string[] = [];
    const indentation = '  '.repeat(indent); // 控制缩进

    for (const key in jsonObj) {
        if (jsonObj.hasOwnProperty(key)) {
            const value = jsonObj[key];
            if (typeof value === 'object' && value !== null) {
                // 如果是对象或数组，递归处理
                result.push(`${indentation}${key}:`);
                result.push(toYml(value, indent + 1));
            } else {
                // 如果是基本类型，直接输出
                result.push(`${indentation}${key}: ${String(value)}`);
            }
        }
    }

    return result.join('\n');
}

//字符串转换成对象
export function toObj<T = any>(str: string, defaultValue: T | null = null): T | null {
    try {
        return JSON.parse(str) as T;
    } catch {
        return defaultValue;
    }
}

//等待休眠
export function wait(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
}
