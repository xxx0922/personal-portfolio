# traffic-dashboard｜大交通仪表盘说明入口

> 说明：这是一个说明入口目录，不存放真实源码。

## 真实项目目录

大交通仪表盘真实代码目录位于：

```text
../app-8p3pb8bea7sx
```

也就是：

```text
D:\TRAE\CC\personal-portfolio\app-8p3pb8bea7sx
```

## 项目用途

该项目是无锡灵山景区交通监控仪表盘，主要用于：

- 实时入园人数监控
- 预约游客数据管理
- 停车场实时状态管理
- 短驳车服务启动/关闭
- 短驳管控点位管理
- 节假日客流对比分析
- 节假日启动短驳对比分析
- Webhook 通知配置，支持企业微信、钉钉、飞书机器人
- 历史客流车流数据上传与分析
- 地图和路线入口

## 为什么不直接重命名真实目录

真实目录 `app-8p3pb8bea7sx` 内部包含秒哒应用 ID、Supabase 配置、外部 API 地址等内容，例如：

```text
VITE_APP_ID=app-8p3pb8bea7sx
```

这些 ID 与外部服务绑定，不建议直接修改。

此外，当前目录可能被 Node/Vite/VS Code 等进程占用，直接重命名容易失败或影响正在运行的服务。

因此当前采用说明入口方式：

```text
traffic-dashboard/README.md  →  指向真实目录 app-8p3pb8bea7sx/
```

## 本地启动方式

进入真实项目目录后启动：

```bash
cd ../app-8p3pb8bea7sx
npm run dev -- --host 127.0.0.1
```

或根据项目实际脚本使用 pnpm/npm 启动。

## 注意

如未来需要真正重命名目录，建议在电脑重启后、确认无 Node/Vite/VS Code/文件资源管理器占用时再操作。
