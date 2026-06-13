# 百度地图配置说明

## 如何获取百度地图API Key

### 1. 注册百度账号
访问 [百度地图开放平台](https://lbsyun.baidu.com/) 并注册账号

### 2. 创建应用
1. 登录后进入 [控制台](https://lbsyun.baidu.com/apiconsole/key)
2. 点击"创建应用"
3. 填写应用信息：
   - 应用名称：无锡灵山景区交通监控系统
   - 应用类型：选择"浏览器端"
   - Referer白名单：
     - 开发环境：`localhost/*`
     - 生产环境：`您的域名/*`

### 3. 获取API Key
创建成功后，系统会生成一个AK（API Key），复制这个Key

### 4. 配置到项目
打开项目根目录的 `.env` 文件，将获取到的API Key填入：

```env
VITE_BAIDU_MAP_KEY=您的百度地图API_Key
```

### 5. 重启开发服务器
修改 `.env` 文件后需要重启开发服务器才能生效

## 无锡灵山景区坐标信息

- **经度**: 120.085300
- **纬度**: 31.434200
- **缩放级别**: 15

## 关键路段标记

1. **灵湖大桥**: 120.0950, 31.4400
2. **千波桥**: 120.0750, 31.4280
3. **灵湖路**: 120.0900, 31.4350
4. **古竹路**: 120.0800, 31.4380

## 功能说明

- ✅ 实时路况显示（红色/橙色=拥堵，绿色=畅通）
- ✅ 景区主标记点（带跳动动画）
- ✅ 关键路段标记
- ✅ 导航控件（缩放、平移）
- ✅ 比例尺控件
- ✅ 滚轮缩放

## 注意事项

1. 百度地图API Key是免费的，但有配额限制
2. 请勿将API Key提交到公开的代码仓库
3. 生产环境请配置正确的Referer白名单
4. 如遇到地图加载失败，请检查：
   - API Key是否正确
   - Referer白名单是否配置
   - 网络连接是否正常
   - 浏览器控制台是否有错误信息

## 百度地图开放平台文档

- [JavaScript API v3.0文档](https://lbsyun.baidu.com/index.php?title=jspopularGL)
- [实时路况图层](https://lbsyun.baidu.com/index.php?title=jspopularGL/guide/layer)
- [标注和覆盖物](https://lbsyun.baidu.com/index.php?title=jspopularGL/guide/marker)
