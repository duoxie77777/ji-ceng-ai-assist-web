# ji-ceng-ai-assist-web

> 基层 AI 辅助服务 - 面向基层群众的纯中文服务平台（不包含i18n）

## 技术栈

Vue 3 + TypeScript + Vite (Rolldown) + Pinia + Vue Router

## 开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run update-icon # 更新 iconfont 图标
```

## 图标使用

```vue
<SvgIcon name="Vue" :size="32" color="#42b883" />
```

## 项目结构

```
src/
├── api/          # API 接口
├── components/   # 公共组件
├── router/       # 路由配置
├── store/        # 状态管理
├── utils/        # 工具函数
└── views/        # 页面视图
```
