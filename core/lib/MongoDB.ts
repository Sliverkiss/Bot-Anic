class MongoDB {
  BASE_URL: string;
  dataSource: string;
  database: string;
  collection: string;
  apiKey: string;

  /**
   * 初始化 MongoDB 客户端
   * @param BASE_URL API 的基础 URL
   * @param DATA_SOURCE 数据源名称
   * @param DATABASE 数据库名称
   * @param COLLECTION 集合名称
   * @param API_KEY API 密钥，用于身份验证
   */
  constructor(
    BASE_URL: string,
    DATA_SOURCE: string,
    DATABASE: string,
    COLLECTION: string,
    API_KEY: string
  ) {
    this.BASE_URL = BASE_URL;
    this.dataSource = DATA_SOURCE;
    this.database = DATABASE;
    this.collection = COLLECTION;
    this.apiKey = API_KEY;
  }

  /**
   * 辅助函数，用于发送 POST 请求
   * @param options POST 请求的配置选项
   * @returns API 返回的响应数据
   */
  private async commonPost(options: {
    url: string;
    headers?: Record<string, string>;
    body: Record<string, unknown>;
    method?: string;
  }): Promise<any> {
    const { url: u, headers: h, body: b, method: m = "POST" } = options;

    // 设置请求的选项
    const opts: RequestInit = {
      method: m,
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...h,
      },
      body: JSON.stringify({
        dataSource: this.dataSource,
        database: this.database,
        collection: this.collection,
        ...b,
      }),
    };

    try {
      // 发送 POST 请求并将响应解析为 JSON
      const response = await fetch(`${this.BASE_URL}${u}`, opts);
      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态码: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("错误:", error);
      throw error; // 抛出错误，供上层处理
    }
  }

  /**
   * 查找一个文档
   * @param document 查询条件
   * @returns 返回找到的文档或 null
   */
  async findOne(document: Record<string, unknown>): Promise<any> {
    const opts = {
      url: "/findOne",
      body: { filter: document },
    };
    return await this.commonPost(opts);
  }

  /**
   * 查找多个文档
   * @param document 查询条件
   * @returns 返回匹配的文档列表
   */
  async find(document: Record<string, unknown>): Promise<any[]> {
    const opts = {
      url: "/find",
      body: { filter: document },
    };
    return await this.commonPost(opts);
  }

  /**
   * 插入一个文档
   * @param document 要插入的文档
   * @returns 插入操作的结果
   */
  async insertOne(document: Record<string, unknown>): Promise<any> {
    const opts = {
      url: "/insertOne",
      body: { document: document },
    };
    return await this.commonPost(opts);
  }

  /**
   * 插入多个文档
   * @param documents 要插入的文档列表
   * @returns 插入操作的结果
   */
  async insertMany(documents: Record<string, unknown>[]): Promise<any> {
    const opts = {
      url: "/insertMany",
      body: { documents: documents },
    };
    return await this.commonPost(opts);
  }

  /**
   * 更新一个文档
   * @param filter 查询条件，用于找到文档
   * @param document 更新的数据
   * @returns 更新操作的结果
   */
  async updateOne(
    filter: Record<string, unknown>,
    document: Record<string, unknown>
  ): Promise<any> {
    const opts = {
      url: "/updateOne",
      body: { filter: filter, update: document },
    };
    return await this.commonPost(opts);
  }

  /**
   * 更新多个文档
   * @param filter 查询条件，用于找到文档
   * @param document 更新的数据
   * @returns 更新操作的结果
   */
  async updateMany(
    filter: Record<string, unknown>,
    document: Record<string, unknown>
  ): Promise<any> {
    const opts = {
      url: "/updateMany",
      body: { filter: filter, update: document },
    };
    return await this.commonPost(opts);
  }

  /**
   * 删除一个文档
   * @param filter 查询条件，用于找到文档
   * @returns 删除操作的结果
   */
  async deleteOne(filter: Record<string, unknown>): Promise<any> {
    const opts = {
      url: "/deleteOne",
      body: { filter: filter },
    };
    return await this.commonPost(opts);
  }

  /**
   * 删除多个文档
   * @param filter 查询条件，用于找到文档
   * @returns 删除操作的结果
   */
  async deleteMany(filter: Record<string, unknown>): Promise<any> {
    const opts = {
      url: "/deleteMany",
      body: { filter: filter },
    };
    return await this.commonPost(opts);
  }
}

export { MongoDB };
