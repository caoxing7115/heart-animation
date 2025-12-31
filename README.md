
# 2026 跨年盛典 Web App

这是一个基于 React 和 Google Gemini API 开发的 2026 新年庆祝应用。

## 特性
- **实时烟火**：Canvas 驱动的粒子系统，支持点击/触摸交互。
- **倒计时器**：精准计算至 2026 年 1 月 1 日。
- **AI 祝福语**：集成 Gemini 3，根据用户名字实时生成富有诗意的中英双语寄语。
- **电影级视觉**：玻璃拟态 UI，适配移动端与桌面端。

## 部署到 GitHub Pages
1. 在 GitHub 上创建一个新仓库。
2. 将此项目的所有文件上传。
3. 在仓库设置 (Settings) -> Pages 中，选择部署分支（通常是 `main`）。
4. 由于该应用使用了 `process.env.API_KEY`，在 GitHub Pages 静态环境下，您需要将 API Key 直接填入 `services/geminiService.ts`（请注意安全，私有部署建议通过服务端中转）。

## 技术栈
- React 19
- Tailwind CSS
- Canvas API
- Google Gemini API (GenAI SDK)
- esm.sh (CDN 加载模块)
