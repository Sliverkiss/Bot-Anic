export class QingLong {
    private host: string;
    private clientId: string;
    private clientSecret: string;
    private token: string;
    private envs: Array<any>;

    /**
     * 对接青龙API
     * @param HOST http://127.0.0.1:5700
     * @param Client_ID xxx
     * @param Client_Secret xxx
     */
    constructor(HOST: string, Client_ID: string, Client_Secret: string) {
        this.host = HOST;
        this.clientId = Client_ID;
        this.clientSecret = Client_Secret;
        this.token = "";
        this.envs = [];
    }

    // 处理请求
    async request(t: { url: string, headers?: Record<string, string>, params?: Record<string, string | number>, body?: string }, m: string = "GET") {
        try {
            let { headers, params, body, url } = t;
            // 处理 GET 请求头部
            if (m.toUpperCase() === "GET" && params) {
                let queryString = new URLSearchParams(params as Record<string, string>).toString();
                url = `${url}?${queryString}`;
            }
            const opts: RequestInit = {
                method: m.toUpperCase(),
                headers: headers,
                body: body
            };
            const response = await fetch(url, opts);
            
            const res = await response.json();
            return res;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // 获取用户密钥
    async getAuthToken() {
        const options = {
            url: `${this.host}/open/auth/token`,
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
            },
        };
        try {
            console.log(`传入参数: ${JSON.stringify(options)}`);
            const { code, data, message } = await this.request(options);
            if (code === 200) {
                const { token, token_type, expiration } = data;
                this.token = `${token_type} ${token}`;
            } else {
                throw message || "Failed to obtain user token.";
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }

    // 获取所有环境变量详情
    async getEnvs() {
        const options = {
            url: `${this.host}/open/envs`,
            headers: {
                'Authorization': this.token,
            },
        };
        try {
            const { code, data, message } = await this.request(options);
            if (code === 200) {
                this.envs = data;
                console.log(`✅Obtaining environment variables succeeded.`);
            } else {
                throw message || `Failed to obtain the environment variable.`;
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }

    checkEnvByName(name: string) {
        return this.envs.findIndex((item: { name: string }) => item.name === name);
    }

    checkEnvByRemarks(remarks: string) {
        return this.envs.findIndex((item: { remarks: string }) => item.remarks === remarks);
    }

    checkEnvByValue(value: string, regex: RegExp) {
        const match = value.match(regex);
        if (match) {
            const index = this.envs.findIndex((item: { value: string }) =>
                item.value.includes(match[0])
            );
            if (index > -1) {
                console.log(`🆗${value} Matched: ${match[0]}`);
                return index;
            } else {
                console.log(`⭕${value} No Matched`);
                return -1;
            }
        } else {
            console.log(`⭕${value} No Matched`);
            return -1;
        }
    }

    selectEnvByName(name: string) {
        return this.envs.filter((item: { name: string }) => item.name === name);
    }

    selectEnvByRemarks(remarks: string) {
        return this.envs.filter((item: { remarks: string }) => item.remarks === remarks);
    }

    /**
     * 添加环境变量
     * @param array [{value:'变量值',name:'变量名',remarks:'备注'}]
     */
    async addEnv(array: Array<{ value: string, name: string, remarks: string }>) {
        const options = {
            url: `${this.host}/open/envs`,
            headers: {
                Authorization: this.token,
                "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(array),
        };
        try {
            const { code, message } = await this.request(options, "POST");
            if (code === 200) {
                console.log(`✅The environment variable was added successfully.`);
            } else {
                throw message || "Failed to add the environment variable.";
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }

    /**
     * 修改环境变量
     * @param obj {value:'变量值',name:'变量名',remarks:'备注',id:0}
     */
    async updateEnv(obj: { value: string, name: string, remarks: string, id: number }) {
        const options = {
            url: `${this.host}/open/envs`,
            method: "PUT",
            headers: {
                Authorization: this.token,
                "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(obj),
        };
        try {
            const { code, message } = await this.request(options, "PUT");
            if (code === 200) {
                console.log(`✅The environment variable was updated successfully.`);
                await this.enableEnv([obj.id]);
            } else {
                throw message || "Failed to update the environment variable.";
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }

    /**
     * 删除环境变量
     * @param ids [0,1,2] -> id数组
     */
    async deleteEnv(ids: number[]) {
        const options = {
            url: `${this.host}/open/envs`,
            method: "DELETE",
            headers: {
                Authorization: `${this.token}`,
                "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(ids),
        };
        try {
            const { code, message } = await this.request(options, "DELETE");
            if (code === 200) {
                console.log(`✅The environment variable was deleted successfully.`);
            } else {
                throw message || "Failed to delete the environment variable.";
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }

    /**
     * 启用环境变量
     * @param ids [0,1,2] -> id数组
     */
    async enableEnv(ids: number[]) {
        const options = {
            url: `${this.host}/open/envs/enable`,
            method: "PUT",
            headers: {
                Authorization: `${this.token}`,
                "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(ids),
        };
        try {
            const { code, message } = await this.request(options, "POST");
            if (code === 200) {
                console.log(`✅The environment variable was enabled successfully.`);
            } else {
                throw message || "Failed to enable the environment variable.";
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }

    /**
     * 获取单个环境变量详情
     * @param id
     * @returns 变量id
     */
    async getEnvById(id: number) {
        const options = {
            url: `${this.host}/open/envs/${id}`,
            headers: {
                Authorization: `${this.token}`,
            },
        };
        try {
            const { code, data, message } = await this.request(options);
            console.log(data);
            console.log(data.value);
            if (code === 200) {
                return data;
            } else {
                throw message || `Failed to get the environment variable.`;
            }
        } catch (e) {
            throw e ? (typeof e === "object" ? JSON.stringify(e) : e) : "Network Error.";
        }
    }
}
