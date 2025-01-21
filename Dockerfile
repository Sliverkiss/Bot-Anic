# 使用最新的 Deno 镜像
FROM denoland/deno:latest

# 设置工作目录
WORKDIR /app

# 将当前目录下的所有文件复制到容器中的 /app 目录
COPY . .

# 开放 9886 端口
EXPOSE 9886

# 设置容器启动时的命令
CMD ["deno", "task", "start"]
