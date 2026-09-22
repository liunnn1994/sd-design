# SD Design - 快速上手指南

<div align="center">

[![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/liunnn1994/sd-design)

</div>

> 使用上方的 Zread 与 AI 对话上手本项目

欢迎来到 SD Design 项目！本指南将帮助你快速了解项目的基本结构，并指导你完成开发、联调、测试和发布的完整工作流。

## 目录

1. [项目简介](#项目简介)
2. [环境准备](#环境准备)
3. [快速启动](#快速启动)
4. [项目结构](#项目结构)
5. [开发与调试](#开发与调试)
6. [代码规范与检查](#代码规范与检查)
7. [测试与验证](#测试与验证)
8. [发布与维护](#发布与维护)

## 项目简介

SD Design 是一个基于 Vue 3 的企业级组件库，采用 `pnpm workspace` 的 monorepo 架构进行管理。该项目不仅包含了组件库本身，还包含了一个基于 Astro Starlight 的文档站以及一个轻量级的源码联调环境。

Trigger、Tooltip、Dropdown、Select、Tour 等锚点型悬浮层使用 `@floating-ui/vue` 作为统一定位内核。业务侧可通过 `floatingOptions` 使用完整的 Floating UI Vue 配置，原有定位属性继续兼容。

内容裁剪统一依赖 `vue-clamp`：可直接使用 `LineClamp`、`RichLineClamp`、`InlineClamp`、`WrapClamp`，`Ellipsis`、TagGroup、InputTag、Menu 等既有组件也共享这套测量实现。

## 环境准备

在开始之前，请确保你的本地环境满足以下要求：

- Node.js >= 24.16.0 (建议使用 `nvm` 或 `fnm` 管理)
- pnpm >= 11.0.9 (推荐使用 `corepack enable pnpm` 启用)

## 快速启动

第一次拉取代码后，请按以下步骤启动项目：

```bash
# 1. 安装项目所有依赖
pnpm install

# 2. 一键启动开发环境（同时启动组件库监听和文档站服务）
pnpm run dev
```

启动成功后，你可以在浏览器中访问终端输出的文档站地址（通常为 http://localhost:4321），在此查看和调试组件。

## 项目结构

本项目主要由以下四个包构成：

- `packages/web-vue`：**核心组件库**，包含所有 Vue 组件源码、样式、测试及构建脚本。
- `packages/sd-vue-docs`：**文档站**，基于 Astro，用于展示组件文档和在线示例，负责消费组件库产物。
- `packages/web-vue-debug`：**最小调试环境**，专门用于本地开发时直接使用组件库源码进行样式和逻辑的联调，无需通过文档站。
- `packages/sd-mcp`：**MCP 服务**，把组件 API 元数据暴露给 AI 助手（Claude Code、Codex、VS Code Copilot 等），便于在 AI 辅助开发时准确使用组件，详见 [packages/sd-mcp/README.md](packages/sd-mcp/README.md)。

## 开发与调试

我们推荐在开发组件时，先在轻量级的调试环境中验证，再补充完善文档和示例。

### 1. 组件联调

如果你只是想快速测试一个组件的功能或修改样式：

```bash
# 启动最小化源码调试应用
pnpm run dev:web-vue
```

此时你可以在 `packages/web-vue-debug/src/App.vue` 中直接引入并测试你的组件，而不用关心文档站的复杂环境。

### 2. 文档站联调

如果你正在编写或更新组件文档：

```bash
# 仅启动文档站服务
pnpm run dev:docs
```

### 3. 全量开发

如果是日常需求开发，需要同时看到组件和文档的实时反馈：

```bash
# 全量启动
pnpm run dev
# 或
pnpm run dev:all
```

## 代码规范与检查

为了保证代码质量，项目中引入了严格的 lint 和格式化工具（如 `oxlint`, `oxfmt`, `stylelint`）。

- **格式化代码**：
  ```bash
  pnpm run format
  ```
- **代码静态检查**：
  ```bash
  pnpm run lint
  # 若需自动修复可执行
  pnpm run lint:fix
  ```
- **本地全量检查（提交前建议执行）**：包含了 lint、类型检查(typecheck) 和 单元测试(test)。
  ```bash
  pnpm run check
  ```
  如果你想完全模拟 CI 环境的校验标准：
  ```bash
  pnpm run check:ci
  ```

## 主题开发

启动文档站后打开 `/guides/theme-editor/`。基础模式调整品牌色、圆角、字号和控件高度；高级模式可搜索、分类和重置全局或组件 token，切换真实文档示例检查结果。

切换到“页面示例”可预览交付工作台中的表格、表单、告警、进度和弹窗状态。空白区域或抓手模式可拖动；Ctrl/⌘ + 滚轮缩放，工具栏“适应宽度”复位。键盘聚焦画布后可用方向键平移、+/− 缩放、0 复位，输入框中的键盘操作不受影响。

新增组件时在 `components/<name>/style/token.scss` 中定义 Sass token，并添加对应 `src/components/generated/<name>/*.vue` 文档示例。运行 `pnpm --filter @sdata/web-vue run theme:generate`（常规开发启动、构建也会自动执行），组件和字段会进入编辑器。不要手改 token 文件的 `@generated runtime tokens` 区域或 `theme-catalog.json`。

导出的 JSON 可直接作为 `<sd-config-provider :theme="theme">` 的输入。主题的 `algorithm: ['dark', 'compact']` 也会随文件保存，不需要另存页面开关状态。

内置预设支持明暗往返切换；`theme-mode` 同时控制背景语义和 seed 色板，compact 不改变继承模式。旧 JSON 中显式设置的浅色背景不会自动删除，可在高级模式重置对应 token 或重新选择预设。

主题回归：`pnpm --filter @sdata/web-vue run test:theme`。文档站在 `http://localhost:4321` 运行时，可执行 `pnpm --filter @sdata/web-vue run test:theme:e2e` 验证实际路由、文件导入导出和移动布局。

## 测试与验证

项目使用 Vitest 进行单元测试。我们要求所有核心逻辑和组件都需包含充足的单测覆盖。

- **运行组件库测试**：
  ```bash
  pnpm run test
  ```

## 发布与维护

项目通过根目录脚本统一控制包的打包、升级等流程。在发版或合并到主干前，务必保证 CI 校验通过。

- **全量打包验证**：
  ```bash
  pnpm run build
  ```
- **发版前校验**：
  ```bash
  pnpm run release:check
  ```
- **一键更新所有依赖及工具**（仅限维护者）：
  ```bash
  pnpm run upgrade:all
  ```

> 深入了解项目架构、模块依赖关系，请参阅 [`ARCHITECTURE.md`](ARCHITECTURE.md)。
