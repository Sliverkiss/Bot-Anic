 export interface Plugin {
    uuid:string,
    priority:number,
    [key: string]: any; // 任意键，值可以是任何类型
}
