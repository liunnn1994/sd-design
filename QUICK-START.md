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

SD Design 采用共享 Foundation 与独立框架 Adapter/View 架构。`@sdata/web-core` 管理无框架规则、原生驱动和共享样式，`@sdata/web-vue` 保留 Vue 3 视图、响应式与现有 API；未来的框架包复用 Core。仓库同时包含 Astro Starlight 文档站和源码联调环境，统一由 `pnpm workspace` 管理。

分层职责、交互流程与 Infographic 架构图见[跨框架技术方案](packages/sd-vue-docs/src/content/docs/guides/architecture.mdx)，启动文档站后访问 `/guides/architecture/`。

Trigger、Tooltip、Dropdown、Select 等锚点型悬浮层使用 `@floating-ui/vue` 作为统一定位内核。业务侧可通过 `floatingOptions` 使用完整的 Floating UI Vue 配置，原有定位属性继续兼容。

Tour 使用 driver.js，通过 `v-bind="config"` 传入原生配置，挂载后调用组件 ref 的 `drive()` 启动，卸载时自动销毁；不再提供旧的 visible/current 受控属性。自定义 Vue 内容使用 title、description、progress、footer 插槽，业务按钮可直接放入 footer。

内容裁剪统一使用 core 测量内核与本地 Vue 适配器：可继续使用 `LineClamp`、`RichLineClamp`、`InlineClamp`、`WrapClamp`，`Ellipsis`、TagGroup、InputTag、Menu 等既有组件也共享这套测量实现，不再依赖 `vue-clamp` 包。

面板分割统一使用 `PanelGroup`、`Panel` 与 `PanelSeparator`，原 `Split` 已移除。组件组支持受控/非受控尺寸、实时尺寸更新、拖拽生命周期事件、禁用调整、动态方向和自定义根标签；尺寸数值表示像素，百分比使用字符串。

## 环境准备

在开始之前，请确保你的本地环境满足以下要求：

- 使用仓库 `mise.toml` 固定的 Node.js 24.22.0 与 pnpm 12.6.0；下列 pnpm 命令可通过 `mise exec -- pnpm ...` 执行。

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

主要工作区职责如下：

- `packages/web-core`：共享 Foundation、SCSS/token 和主题生成器。
- `packages/web-vue`：Vue Adapter/View、样式兼容入口、测试及构建脚本。
- `packages/sd-vue-docs`：**文档站**，基于 Astro，用于展示组件文档和在线示例，负责消费组件库产物。
- `packages/web-vue-debug`：**最小调试环境**，专门用于本地开发时直接使用组件库源码进行样式和逻辑的联调，无需通过文档站。
- `packages/sd-mcp`：**MCP 服务**，把自动提取的组件 API 元数据（含第三方组件类型及 Message / Notification 服务配置与方法）暴露给 AI 助手（Claude Code、Codex、VS Code Copilot 等），便于在 AI 辅助开发时准确使用组件，详见 [packages/sd-mcp/README.md](packages/sd-mcp/README.md)。

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

提交变更使用 `pnpm cz`（映射到 `czg`）。中文提示、提交类型、emoji 和校验规则统一维护在根目录 `commitlint.config.ts`。

组件、站点和维护脚本都使用 TypeScript；Vue 中包含逻辑的组件统一使用 `<script setup lang="ts">`。动态输入先使用 `unknown`，通过类型守卫缩小类型，避免 `any`。类型组合优先使用 `type-fest`。

Node 24 可直接运行 `node scripts/upgradeEngines.ts` 这类脚本。原生运行仅擦除类型，不读取 `tsconfig` 的路径映射，也不做类型检查：Node 脚本使用显式 `.ts` 导入扩展名、`import type` 和可擦除语法；提交前运行 `pnpm run typecheck`。脚本由 `tsconfig.scripts.json` 严格检查，Vue、站点配置、MCP 和自动导入解析器使用各包配置检查。源码约定检查会阻止新增 JS 文件和非 TS 的 Vue 脚本。

仓库的 `typescript` 是精确锁定的 TS7/TNB，继续使用工作区 `tsc`、`vue-tsc`，不要改装原生预览包。编辑器选择 Workspace TypeScript Version。

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
- **本地全量检查（提交前建议执行）**：包含了 lint、类型检查（typecheck）和组件及回归测试（test）。
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

新增组件时在 `packages/web-core/styles/<name>/style/token.scss` 中定义共享 Sass token，并在 Vue 的 `components/<name>/style/token.scss` 保留对应 `@forward` 入口，并添加对应 `src/components/generated/<name>/*.vue` 文档示例。运行 `pnpm --filter @sdata/web-vue run theme:generate`（常规开发启动、构建也会自动执行），组件和字段会进入编辑器。不要手改 token 文件的 `@generated runtime tokens` 区域或 `theme-catalog.json`。

主题 seed 的明暗色阶由 SD Design 本地 TypeScript 算法生成，组件库及在线编辑器无需加载 Arco Design 包。

例如 SkeletonReveal 的 `skeleton-reveal-stroke`、`skeleton-reveal-stroke-width` 定义在 Core，共享样式通过运行时 token 消费覆盖值。其测量和播放规则也放在 Core，Vue 只连接响应式状态、渲染提交与 motion-v；新增框架适配器可复用同一 Foundation。

导出的 JSON 可直接作为 `<sd-config-provider :theme="theme">` 的输入。主题的 `algorithm: ['dark', 'compact']` 也会随文件保存，不需要另存页面开关状态。

内置预设支持明暗往返切换；`theme-mode` 同时控制背景语义和 seed 色板，compact 不改变继承模式。旧 JSON 中显式设置的浅色背景不会自动删除，可在高级模式重置对应 token 或重新选择预设。

主题回归：`pnpm --filter @sdata/web-vue run test:theme`。文档站在 `http://localhost:4321` 运行时，可执行 `pnpm --filter @sdata/web-vue run test:theme:e2e` 验证实际路由、文件导入导出和移动布局。

## 测试与验证

组件测试使用 Cypress（Chrome），工具脚本和生产模式回归使用 Node 内置测试运行器。`pnpm run test` 依次执行 Markdown 导出检查、ModelSelector 生产模式插槽回归和 Cypress 组件测试。

- **运行组件库测试**：
  ```bash
  pnpm run test
  ```

单独执行生产模式插槽回归：

```bash
pnpm --filter @sdata/web-vue run test:model-selector:production
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

## Markdown 内容

```vue
<template><MarkdownRender :content="content" final /></template>
<script setup lang="ts">
  import { MarkdownRender } from '@sdata/web-vue';
  const content = '## SD Markdown\n\n**富文本**与[链接](https://example.com)';
</script>
```

全量样式已包含 Markdown 基础样式，无需额外导入；只使用按需样式时改为导入 `@sdata/web-vue/es/markdown-render/style/index.js`。从 Markstream 迁移时只需替换组件 import 和模板名称，并移除原 Markstream CSS。可选 KaTeX、Mermaid、D2、Infographic 和代码增强保留原 loader 配置与降级路径，组件不会自动添加 CDN。

## F/A 开发入口

`web-core` 的 ESM 与类型产物由 `mise exec -- pnpm run build:core` 生成；Vue 的主题生成、类型检查及构建流程会先构建 core。修改共享逻辑后重跑该命令，再启动 Vue 联调服务。

- `mise exec -- pnpm run test:core`：检查无框架依赖边界、独立 ESM 加载及核心行为。
- `mise exec -- pnpm run typecheck`：工作区类型检查（含 core）。
- `mise exec -- pnpm run test:component`：核心测试与 Vue 浏览器组件测试。

消费者安装和使用 `@sdata/web-vue`；发布时 `workspace:^` 会转换为对应 Core 版本依赖，两个包都必须发布。

`release.yml` 同时监听 Core/Vue 变更。发布准备脚本先校验工作区依赖，再同步两包版本；流程从仓库根目录加载 Vue 的 semantic-release 配置，串行发布 Core→Vue，并记录两份清单和 Vue CHANGELOG。不要从 Vue 子目录直接运行该配置。维护发布脚本后，可先运行 `mise exec -- node --test packages/web-vue/scripts/release-packages.test.ts`；该命令只在临时目录改写文件，不执行发布。

共享样式可通过 `@sdata/web-core/styles/index.scss` 或具体组件子路径使用；Vue 消费者继续使用原 CSS/SCSS 入口。直接维护共享样式时可运行 `mise exec -- pnpm --filter @sdata/web-core run theme:generate`；Vue 的常规主题生成还会同步旧的目录 JSON。`mise exec -- pnpm run test:foundations` 覆盖核心行为、独立 Sass 编译、Vue 样式兼容和在线编辑器类型参考。

Tour 的 Driver 基础样式由 Vue 样式入口直接从 `driver.js` 依赖加载，使用 Vue 的按需或完整样式入口即可。直接使用 core 的 Tour SCSS 时，需由框架适配层先加载 `driver.js/dist/driver.css`，再加载 core 主题样式。

Form 与 Table 的共享业务规则分别维护在 `packages/web-core/src/form` 和 `packages/web-core/src/table`。Vue Adapter 只负责把 props/refs、事件、nextTick、生命周期和 DOM 操作接到这些规则；自定义插槽与 Vue RenderFunction 留在 Vue 类型和视图中，core 将渲染内容当作不透明数据传递。修改这些规则时先运行 `test:foundations`，再在图标/元数据生成完成后运行对应浏览器回归，避免测试与源文件生成相互干扰。

Tree/TreeSelect 的规则位于 core 的 `src/tree` 与 `src/tree-select`；Vue 旧 Tree 工具深入口保留具体 Vue 类型签名。Tree 通过 Adapter 读取受控状态并提交动画/加载状态，TreeSelect 通过 Adapter 的渲染完成回调提交模型与表单事件；修改时需同时验证 Tree 与 TreeSelect，尤其是虚拟键盘导航、懒加载后的勾选、路径标签及清空事件顺序。

Select/Cascader 的规则分别位于 core 的 `src/select`、`src/cascader`。Select 导航同时供 AutoComplete/Mention 使用；Cascader 的下拉框与独立面板共用选择、路径和加载规则。Vue 负责 `toRaw` 身份适配、Ref/Map 响应式、搜索计时和滚动。修改后需覆盖这些消费组件；完整 Vue build 还会验证旧工具深入口的运行时导出。

TimePicker 的规则位于 core 的 `src/time-picker`；列数据按小时/分钟/秒分别计算，保持禁用回调的调用范围。Vue hooks 包装响应式计算，监听外部值、面板和输入草稿；修改后同时回归 DatePicker 的时间面板消费场景。完整 Vue build 会验证旧 TimePicker 工具入口。

DatePicker 的规则位于 core 的 `src/date-picker`，包含单日期/范围 Foundation、面板导航、日历单元格、周期禁用与格式转换。Vue 提供状态 getter、状态回写、事件、焦点及预览计时；本地化月名通过回调提供，渲染型快捷选项标签留在 Vue。修改范围选择时须覆盖排序后的 start/end 禁用检查、锁定端点及 exchangeTime/fixedTime 行为，并验证旧工具和格式 hooks 的产物导出。

Upload 的共享流程位于 core 的 `src/upload`。Vue Adapter 的 `createFileItem` 包装响应式对象，列表 getter/写回及事件用于发布状态；受控列表同步和 URL 回收保留原 watch 时机。修改请求流程时须覆盖同步自定义请求、取消后迟到回调、异步 limit 预占、卸载清理及真实双标签页锁；默认 XHR 还需验证 multipart、响应解析和 URL 回填。

RichTextEditor 的共享引擎位于 core 的 `src/rich-text-editor`，Vue 在挂载/卸载时调用共享生命周期，并将组件 host 列表交给 Teleport。修改编辑流程时须覆盖光标替换、组件快照、受控回显/插件重入、历史和 HTML 片段；旧 InlineComponentNode 入口必须与 core 具有相同类身份，不能复制一份节点类。Vue 保留 lexical 依赖以支持公开 Lexical 类型/节点集成，其余 Lexical 运行插件依赖归 core。

JsonForm 的共享模块位于 core 的 `src/json-form`。修改模型流程时须覆盖受控/非受控切换、model 替换、原地写入后发布浅拷贝和同步 setter 重入；Vue Adapter 只负责 reactive 包装、watch/computed、组件注册及渲染。A2UI 的 JSON Pointer 转义、重复节点/循环处理与按需读取全局 chips 前缀必须保持原语义，不能以拆分为由扩大支持的协议范围。

Transfer 的共享流程位于 core 的 `src/transfer`。修改移动流程时，须验证选择事件先于目标值更新、change 和 Form 通知，保留有效/禁用选项划分、重复 key 与未知目标值的原语义。过滤只影响展示，全选作用于整个面板的有效选项；Vue 保留过滤输入 ref、双模型 refs 和上下文/插槽。

Checkbox/Radio/Switch 的共享规则分别位于 core 的 `src/checkbox`、`src/radio`、`src/switch`，选项规范化复用 `_utils/choice-options`。修改时须覆盖 false/0/空串、组优先级、Checkbox 最大数量与数组去重、Radio 重复变更计数，以及原生 input 回写；Switch 还须覆盖钩子拒绝/void、等待中重复点击、完成时重新检查 disabled、当前映射值和显式 loading/model 绑定。Vue 的 post-flush/nextTick、IDL indeterminate 与原生 checked 修复留在 Adapter。

Slider 的共享模块位于 core 的 `src/slider`。修改时须验证受控回写被拒绝后仍从显示值计算、范围输入排序、拖动交叉值、小数键盘边界、轨道点击最近端点和横纵坐标换算。drag 引擎通过 Adapter 获取监听目标和发布拖动状态；Vue 在禁用/卸载时清理，保留触摸取消、原生 preventDefault、Tooltip 与轨道测量时机。

Rate/Progress 的共享实现位于 core 的 `src/rate` 和 `src/progress`。修改 Rate 时覆盖半选/清空、只读与禁用后的 hover 重置、受控拒绝回写、评分事件时序及每个字符的阈值颜色。修改 Progress 时须分别验证 line/circle/steps 的旧边界行为、mini 尺寸/线宽、渐变 stop 顺序、SVG ID 和文本/ARIA 百分比；不得把拆分同时变成新的百分比裁剪规则。

InputNumber 的共享模块位于 core 的 `src/input-number`：data 负责解析/格式化/精度与边界，foundation 负责草稿、提交去重、步进、键盘和长按重分发。修改时覆盖 stringMode 的原始数字串、旧字符串/数字模式、formatter/parser 替换、change/input 模式、清除与 blur 去重；长按还须验证 800ms/150ms 延迟、原事件身份、禁用/边界前不聚焦和卸载清理。Vue 的双变 prop formatter 类型及旧公共 formatter 类型差异保持原样，精度库原有的组件 setup 阶段配置由 Adapter 调用 core 配置入口。

基础文本输入的共享逻辑位于 core 的 `src/text-input/foundation.ts`。修改时同时验证 Input / Textarea 的组合输入、粘贴与满额插入、自定义字数和截取、父级拒绝受控更新、清空和 blur 事件顺序；Input 还需覆盖 Enter 提交和密码测量文本。DOM 值修复与选区恢复由 Adapter 安排在 Vue nextTick。

Pagination 的共享引擎位于 core 的 `src/pagination`。修改时同时覆盖受控/非受控页长、首项可见性、总数归零、同步事件重入、父级拒绝更新、两端省略号及跳页框 nextTick 重置。页码描述由 foundation 产生，Vue 只缓存结果并驱动渲染和 watcher；分页器的 CSSProperties/SelectProps 仍留在 Vue 类型层。

ResizeObserver 共享状态机位于 core 的 `src/resize-observer/foundation.ts`，同目录 `browser.ts` 提供浏览器驱动，Vue 的 `_utils/resize-observer.ts` 保留转发。修改时验证第一项 entry 与同帧最新值、目标替换、取消后的迟到回调、卸载和重入监听。组件测试的公共 support 会忽略 ResizeObserver loop；该问题的专用回归须直接收集 window error 并断言为空，生产消费测试不使用此过滤。

Trigger 共享规则位于 core 的 `src/trigger`。修改时覆盖受控拒绝、原事件回调改变选项、hover/focus 延迟取消、延迟提交后计时标识保留、关闭请求时重置滚动快照、子浮层的 contextmenu 包含判断与反向过渡。位置/箭头几何由 core 提供，Vue 继续适配 Floating UI 的 refs/options 与 CSSProperties/VNode。

Menu 共享模块位于 core 的 `src/menu`。修改时覆盖注册数据的 push/splice 与替换引用、已挂载子菜单首次更新、autoOpen/autoOpenSelected/accordion 优先级、重复 key、回调后的 selectable 重读，以及布局方向对应的键盘目标。溢出测量按 DOM 顺序惰性提供宽度，保持镜像保留宽度和 10px 阈值；VNode 解析与 clone 留在 Vue。

Tabs/Collapse 共享规则分别位于 core 的 `src/tabs` 与 `src/collapse`。验证数字/字符串 key、禁用键盘行为、异步新增后读取注册顺序、受控拒绝、RTL/滚动对齐、重复折叠 key 和离场取消。Tabs 的 VNode 冻结缓存及 Collapse 的交互控件 closest 检查留在 Vue；原 TabsProps/TabPaneProps 仍通过 tabs 深入口提供，不新增根导出。

Modal/Drawer/Popconfirm 的确认和对话框规则位于 core 的 `src/dialog`，共享弹层栈、焦点和滚动锁位于 `src/popup`。验证 done/Promise 首次结果、取消否决、关闭后过期确认、层叠 Escape/焦点恢复、离场销毁、容器更换与多所有者滚动锁。组件和命令式配置中的 Vue 渲染类型继续从旧入口提供。

Message/Notification 的共享队列、服务与计时器位于 core 的 `src/notice`。验证显式/生成 ID、跨位置去重、内容/标题身份、duration/resetOnUpdate 差异、悬停重计时、关闭回调可重入、静默 clear 与外部移除容器。旧 interface 深入口保留位置常量与渲染类型；不新增根类型导出。

Image/Preview 的共享规则和拖动驱动位于 core 的 `src/image`。验证缩略图/预览 URL 分离、空 src/错误/动态页脚、按 ID 注册、显式 srcList、禁用/循环导航、受控拒绝、离散与滚轮缩放、可编辑控件键盘隔离和拖动中断。Vue 保留 ref/computed、原暴露方法和 Slot/Component 类型，旧工具及 hooks 深入口继续提供。

FilePreviewer 的共享行为、媒体加载器和 PDF 控制器位于 core 的 `src/file-previewer`。类型继续由 type 属性决定。验证 content/类型插槽优先级、旧媒体事件失效、原生/Video.js 切换、workerPort/workerSrc/主线程优先级、文档替换/销毁与渲染取消。Vue 的默认 worker URL 和构建插件继续提供离线资源；发布包验收需实际打开 PDF、检查画布与 worker，不能只检查 loading 状态。

ColorPicker 共享逻辑位于 core 的 `src/color-picker`。修改时验证受控值接受/拒绝、输入草稿与清空的事件次数、HEX8 透明度、渐变色标跨越后的节点身份、最近颜色去重和拖拽释放/卸载。Vue 的旧 interface/utils 入口保持转发；几何测量、渲染时机和指针绑定由 Adapter 提供。

Carousel 共享逻辑位于 core 的 `src/carousel`。保持 current、change 和 goTo 的 1 起始索引；验证受控拒绝后的相同请求去重、动态删项归一化、最短路径方向、自动播放重排与动画锁独立、hover 暂停/恢复及卸载清理。Vue 的子项注册和计时器适配继续驱动 Foundation，不在 Adapter 中重复切换规则。

Tour 共享逻辑位于 core 的 `src/tour`，继续使用 driver.js 原生配置/实例协议。验证显式 false、原生全局/步骤回调、highlight/setSteps、footer 对 progress 的优先级、动态插槽尺寸、过渡后定位及卸载清理。Vue 的 MutationObserver 只观察 body 直接子节点，ResizeObserver 监听当前浮层；升级 driver.js 时同步 core 的基础 CSS，并运行与已安装上游资产的样式等价测试。

滚动组件共享逻辑位于 core 的 `src/anchor`、`src/affix`、`src/back-top`，通用驱动在 `_utils/scroll-to.ts`、`_utils/tween.ts` 和 `_utils/dom.ts`。验证容器/阈值变化、监听切换、Anchor 前一 hash/字面 ID/初始 URL、Affix 顶/底偏移与内容变高、BackTop 减少动态效果偏好/中止，以及 TimePicker 连续点击取消旧滚动。Vue 不再直接依赖 b-tween 或 compute-scroll-into-view；公开滑动/DOM 工具旧深路径仍可使用。

标签与候选输入逻辑位于 core 的 `src/input-tag`、`src/auto-complete`、`src/mention`，只读提示规则位于 `text-input/readonly.ts`。验证 InputTag 的重复值/按位置删除、tagProps.closable 优先级、IME/受控草稿和布局切换；AutoComplete 的搜索/选择/清除顺序、数字零与只读关闭；Mention 多字符前缀、光标尾部与受控回写。TagData 的 Vue TagProps 专化保留在原接口，旧工具和只读 hook 深路径仍可使用。

流程组件共享逻辑位于 core 的 `src/verification-code`、`src/steps`、`src/timeline`；DOM 顺序驱动位于 `_utils/item-index.ts`。验证验证码格式化拒绝/转换、过滤粘贴、受控格子及原生 DOM 回滚、长度变化和公开 focus/blur；Steps 的同项重复通知、禁用键盘、注册更新与嵌套/重排；Timeline 的 pending 插槽、reverse、交替位置和末项。DOM 索引变更还需覆盖 Avatar/Grid 的嵌套与动态更新。

数值展示逻辑位于 core 的 `src/badge` 和 `src/statistic`。变更后覆盖 Badge 零值/溢出/自定义样式/RTL，Statistic 的 valueFrom/日期/延迟回写，Countdown 的初始 now 校正、暂停冻结、过期恢复、截止时间替换和卸载清理；同时回归 NumberFlow 组合渲染。

NumberFlow 的共享模块位于 core 的 `src/number-flow`。变更时验证本地化数字/分数位、prefix/suffix 插槽优先级、插件零增量/continuous、自定义 radix、快速连续更新/卸载、最长动画时长、分组只启动变更项及 reduced-motion 监听恢复/清理，并回归 Badge/Statistic/Countdown。

Watermark 的共享逻辑位于 core 的 `src/watermark`。覆盖完整字体测量/DPR、文字和图片、错位排列/alpha、过期图片/卸载回调、主题切换及拥有节点的删除/属性恢复；发布包消费还应解码实际 PNG 检查灰阶和主题像素，并保留旧 observer/theme/utils 深入口合同。

Cropper 的共享模块位于 core 的 `src/cropper`。验证加载构造器期间卸载、原生元素配置删除后的属性恢复、初始受控几何、图片 ready/load 后对齐、真实指针操作、换图和 destroy 后更新。发布包消费应通过原公开 getter 调用 native `$toCanvas` 检查实际裁剪像素；Vue 事件和 native expose 合同保持不变。

Scrollbar 的共享模块位于 core 的 `src/scrollbar`。验证 options/轴向禁用优先级、debounce 归一化、嵌套 StyleValue、maxHeight/maxWidth 自动尺寸、外部监听重绑和公开滚动/SDK 方法。变更时连同 Select/Tree 等滚动消费者回归，发布包再验证实际 viewport 偏移、动态尺寸和 destroy 后行为。

QrCode 的共享模块位于 core 的 `src/qr-code`。验证空值/多行值、主题及显式配色、canvas/SVG 切换、异步结果乱序和失败处理，Vue 继续验证状态刷新、图标/状态插槽与 Spin 配置；发布包消费检查真实编码输出和属性更新。

PanelGroup 的共享引擎位于 core 的 `src/panel-group`，Vue 的旧 `core/*` 深路径继续转发或提供响应式/动画适配。验证百分比尺寸、受控接受/拒绝、取消与锁释放、方向切换/RTL、折叠内容在场与动画、交叉伸缩杆及重排。不要把 Vue reactive 或 motion-v 移进 core；由 adapter 注入 axes/fill 对象和数值 MotionValue 驱动。

Calendar 的事件流程维护在 core 的 `src/calendar/events.ts`，特殊时段规范化与禁用规则位于同目录。Vue 的 `core/events.ts` 只连接普通数据状态、浅索引、数组变更观察和卸载。修改后运行 Calendar 全目录浏览器测试，重点检查异步 resize 拒绝/卸载、同长度替换、多日与全天边界、日程隔离、创建/删除和特殊时段；单元格视图交互也已接入共享层。

Calendar 的 `drag-and-drop`、`navigation`、`view-math`、`clock` 分别负责共享拖放会话、导航写入/通知、网格/标题派生和计时/滚动。Vue 的拖放门面只创建一个会话供全部实例共享；保留来源清理回调跨 await 的快照和卸载检查。视图通过 getter/setter 与现有 refs 连接，标题等派生须按分支惰性读取，避免扩展 computed 依赖。浏览器规格可分批完整覆盖；分批通过不等于修复运行器加载停滞。

Calendar 配置规则在 core 的 `calendar/config` 中维护，通过 getter 读取适配器缓存的派生值；Vue 的 useConfig 继续返回原 computed/ref。`calendar/i18n` 管理语言数据转换与异步请求版本：有效 locale/周起始在 await 前捕获，消息和文本目标在 await 后读取。修改后验证 locale-load-race、日期限制/选中态重置、日程 id=0 和权限/特殊时段的动态更新，保留旧深入口。

Calendar 事件片段逻辑维护在 core 的 `calendar/event`。延迟点击使用触发时捕获的监听器，长按触发时读取当前监听器；重绑监听字典不能丢失待处理计时器。保留 400ms 点击延迟、500ms 触摸标志更新、1000ms 长按、文档级释放/取消与卸载清理，修改后覆盖真实浏览器中的重绑、双击删除/覆盖及 resize。

单元格规则与创建手势维护在 `calendar/cell`、`calendar/cell-interaction`。适配器通过 getter 连接 computed、当前元素和监听字典；cellInfo 中的 events 保持 ComputedRef，不能改成普通数组。修改时验证鼠标/延迟触摸、严格大于最小距离的创建门槛、横向/RTL、日程 id=0、特殊时段截断、异步编辑批准/拒绝和卸载清理；重叠布局仍在 Vue nextTick 后刷新。

body/header/headings/time-column/index 的共享派生在 `calendar/surfaces`。body CSS 变量和 scrollable 类名的 computed 仍须留在原过渡层级，不能提升到根节点。全天栏使用原生尺寸状态，按真实 CSS 单位换算、当前轴向和 20px 最小值缩放；组件挂载/卸载连接共享控制器。修改后覆盖缩放、光标、前缀补齐与触摸菜单释放，并核对各子组件的旧 props/slots。

组件回归使用项目默认 `cypress.config.ts`（single-tab 开启、manageBrowserMemory 关闭）；本次组合回归已重新完整验证该模式。关闭 single-tab 的临时隔离配置曾在规格加载阶段空队列停滞，应保留该诊断，不能把换配置后的通过视为修复了隔离模式。

修改响应式规则时检查 core 的 `_utils/responsive-observe`、`_utils/responsive`，同时回归 Grid、Menu、Layout 和 Descriptions。保持数字 0、最大匹配断点、SSR 六断点全 true 回退、运行时断点切换及最后订阅者的监听清理。Vue 数字值分支不读取 screens，数字切换为响应式配置时重新获取浏览器快照。

Sider 规则维护在 core 的 `layout/sider`。验证首次断点通知、切换/删除断点和卸载的原生监听清理、受控请求与移除控制后保留最后接受值、rail hover 重置、临时 Drawer 反向 collapsed 及 mask 通知。不要用 Grid 的 min-width 断点替换 Sider 的 max-width 阈值。Layout 注册与 hasSider 优先级在 `layout/layout`；VNode/slot 扫描仍在 Vue hook。

BorderBeam 修改后检查流入定时/active 收尾、同实例 fade 动画过滤、reduced-motion、离屏脉冲暂停、插槽根替换与零圆角、pulse-outside 尺寸、延迟测量失效和卸载清理。保持共享 RAF 单例、旧 CSS 生成字符串与深入口身份；nextTick 仍由 Vue 注入。共享媒体偏好 hook 同时影响 VoiceGlow，需要一起回归。

VoiceGlow 修改后回归手动/函数音量、真实 Web Audio、处理/暂停、样式移除和 Sender 录音集成。麦克风流程保留支持判定、权限分类、请求世代与迟到流停止；分析器共享同一 stream 的 source，最后租约释放时断开。VoiceGlow 的一次圆角探测保留原零值回退 16，不能套用 BorderBeam 的观察器策略。Vue post watchEffect 注入驱动清理注册；音量 getter 继续由 RAF 惰性读取。

VirtualList 修改后同时回归 Select/Cascader、List、Tree/Table 和 AutoComplete。保留 parseFloat 尺寸提示与原 CSS 单位、估计值的 nullish 优先级、0/空字符串 key、轴向原生滚动、floor 触底边界和通知顺序。SDK cache 仍只由 mount prop 恢复；原 restoreCache=false 与测量空操作不扩展为新功能。OverlayScrollbars 在注入的 nextTick 后重新读取当前实例/配置，缓存和测量实现继续由框架对应的 virtua SDK 管理。

InputMask 修改后回归输入/删除、预设切换、移除 mask、完成回调和光标。Foundation 初始化要在 Adapter 的派生状态可读后调用；光标恢复保留两层渲染调度，并在最终回调重新读取当前输入元素及焦点。预设工厂的 IP 占位文案由 Adapter 注入，显示占位与提交值保持原有区别。

Tag 修改后回归受控 checked/visible 的请求与释放、关闭按钮的事件隔离、动态插槽和颜色切换。Foundation 的派生 getter 接入 Vue computed，保持 DOM 颜色解析的原缓存边界；未指定 bordered 时背景不透明，显式 false 仍使用自带或默认透明度。自定义提示保留 disabled 和不透明配置字段，非省略路径只剔除 always。

Avatar 修改后回归图片错误后更换 URL、长短文本切换、关闭/开启自动字号、组件 slot 图片识别和头像组 keyed 重排。afterRender 内重新读取当前 DOM/尺寸/图片状态，保留 8px 文字余量及未指定尺寸的原生测量；组内 0 尺寸和 false 自动字号不可被默认值覆盖。maxCount 不限制时保留原子项数组，overflow 继续由 Vue Popover 渲染。

Toolbar 修改后回归受控重置、重复深层重置、resetSkipKeys/特殊属性名、Enter 的组合输入/已阻止/交互元素守卫和展开裁切。Foundation 在初始化位置快照模型，通过 Adapter 写回模型、清除校验，再按原 truthy 参数发 reset；跳过字段保留当前引用，新增字段丢弃。搜索透传当前模型对象；schema 栅格保留显式 gridColumn，插槽名按递归首次出现顺序去重。

BloomMenu 修改后回归受控请求被忽略、关闭中重新打开、选择/关闭后的焦点、动态 offset、空项/禁用项和 reduced-motion。isOpen 与 popupVisible 分别描述菜单开关及动画期间的挂载；保留 450/150ms 关闭等待、下一次渲染后读取 DOM 和最多 30 帧焦点重试。浮层偏移的捕获由 computed 更新，shift 和 motion-v 仍由 Vue 接入。

BasicCrudTable 修改后回归并发请求/转换、工具栏重置同步、分页/排序、删除文案与失败重试、弹窗详情覆盖及关闭后的校验/提交前钩子失效。请求参数由 core 组装、Vue computed 缓存；依赖不变时保留对象身份，显式传入参数仍原样透传，空值剔除继续由 fetchExcludeEmptyValues 控制。

ModelSelector 修改后回归受控显隐拒绝/释放、搜索展开/清空、禁用项与真实 DOM 重排导航、slot 文本变化、组合输入和快捷键，以及弹窗卸载后的查询保留。VueUse 的当前按键与别名表通过端口读取；core 保留按键守卫的短路顺序。`MODEL_SELECTOR_PROVIDERS` 同时保持根入口与组件深入口的运行时导出。

Typography/Copy 修改后回归原生剪贴板、选项透传、重复复制计时、卸载时的异步结果，以及编辑事件顺序/组合输入/焦点、富文本标记/转义和展开标题。保留两种完成时机：Typography 调用 SDK 后立即反馈，Copy 等待成功后通知；延时分别为可配置 copyDelay 与 2500ms。copy-to-clipboard 由 core 持有，Vue 声明通过共享选项类型保持兼容。

ThinkingOrb 修改后回归九种状态、20/64 尺寸、明暗像素、负相位、DPR 上限 2、暂停/真实 reduced-motion、交叉可见性及卸载取消。静态帧保留相位 0.6，显式主题不读取继承主题；共享 useThemeMode 的主题 mutation 也要覆盖其 QR/Layout/Sender/Calendar/Markdown 调用方。

Sender 共享规则维护在 core 的 `sender/recorder`、`sender/recorder-engine`、`sender/speech-activity`、`sender/values`。修改后验证禁用/卸载期间迟到的 open/stop 回调、onProcess 的 this/参数/返回值、正常停止通知前的状态、完整 SDK 扩展和真实合成音频采集。语音检测保留严格大于 4% 的默认门槛及 350ms 静音延迟；词槽 formatter 执行后的配置和 skill 通过 getter 重新读取。VNode 自定义渲染及模板留在 Vue。

RichTextEditor 声明必须保留公开实例方法、props/slots，并且不含 node_modules 路径。跨包推导触发 TS2883 时，用当前 TNB/Volar 的声明诊断定位；实例接口和 Vue 事件的原生 Lexical 类型应有明确、可发布的引用。

`build:dts` 先规范化临时声明文件名，再逐一核对源码 SFC 的新声明，最后复制到 es。若报 Missing Vue declaration，先用当前 TNB/vue-tsc 定位声明诊断；不要用已有 es 文件、skipLibCheck 或更换编译器掩盖漏发。Sender 的自定义词槽值显式使用公开 ReadonlyDeep<JsonValue>，slot 名称保留 slot-${string}，避免推导引用 type-fest 私有辅助类型。

修改录音入口时保留 recorder-base → 格式扩展的依赖顺序。产物门禁会构建真实客户端 ESM 包并在新 Node 进程中执行，验证 SDK 初始化与编码扩展；源码组件测试与 Node 直接导入不能单独替代这项打包检查。

修改 Sender 模型/交互时覆盖普通值与词槽模式、显式 modelValue/model-value、受控拒绝/移除、microtask 与原生 input 去重、键盘组合/只读换行、文件粘贴通知顺序、实例插入及 RAF 选区。动态 skill 更新会按既有 RichTextEditor.setContent 合同重建内容并选择末尾；保持相同 skill/slotConfig 引用的无关渲染不应夺取其他输入的焦点。Vue nextTick 由 adapter 注入，不要放进 core。Header 的 frame id=0 也必须可取消，Switch 保留自己的显式受控布尔语义，不能套用通用 Switch 的值映射流程。

修改 picker/input 时验证显式空草稿和空/稀疏草稿数组、格式化回调、单侧禁用、受控焦点请求顺序，以及 DatePicker/TimePicker 的输入与面板组合。内部组件的 focus/blur 和旧深入口保持兼容。

修改 ThemeProvider 时覆盖局部/全局切换、透传恢复、祖先主题变化、重复属性写入抑制、弹层 z-index 与多 owner 卸载的原始变量/important 恢复；旧 global-theme 深入口必须与 core 使用同一份栈。

修改 Ellipsis 时验证 fractional 盒宽和内嵌测量副本、空内容/卸载等待结算、首次 hover/focus/click 的测量后回放、内部链接/按钮行为及 Enter/Space；懒激活仍只进行一次，两次渲染提交后等待 RAF 与测量。

修改 Descriptions 时验证 span 换行与最后一项补足、原始数据索引、响应式列数与动态插槽；不要额外规范化历史 span/column 数值。旧 DescItemData/RenderData 接口和 Vue 渲染类型保持兼容。

修改 Table 列控制时验证相等外部筛选不替换草稿、不同外部值同步、确认通知后关闭、重置先清空再通知、受控排序拒绝/接受和动态字段/方向；回调异常保持原顺序与传播。

修改兼容 useInput 时覆盖 InputLabel 自定义事件、IME、拒绝模型后的原生值恢复及 focus/blur/Enter 顺序；列宽拖动覆盖 mouseup/contextmenu/卸载监听清理、ceil/40px 下限、原型样式字段与实时 header 元素。

原生控制器入口：web-core/transition/expand、tree/expand-transition、select/view-focus、date-picker/time-value。Vue 用户继续使用原组件与日期时间 hooks，无需改动导入或事件。

Core 可独立使用 locale/foundation、locale/types、locale/lang/zh-cn、locale/lang/en-us 和 config/prefix；现有 Vue addI18nMessages/useLocale/getLocale、语言深导入及前缀工具继续使用原路径。

Core 的 pagination/legacy 和 text-input/cursor 可直接接入普通状态/原生 input 或 textarea；现有 Vue 通用/List/Table usePagination 与 useCursor 深入口保持原参数和返回结构。

Core 的 tree/checked-state、trigger/compat-state 和 trigger/teleport-container 接收实时状态端口；容器解析需要 DOM，隐藏状态同步可在服务端调用。Vue 用户继续使用原 useCheckedState/useTrigger/useTeleportContainer；测试覆盖受控勾选释放、空半选覆盖、四个别名事件顺序以及隐藏期间延迟切换容器。

Core 的 config/prop-values 通过实时 getter 保留配置优先级；state/legacy-merge 与 trigger/popup-container 对应旧 useMergeState/usePopupContainer。显式 undefined 可阻止配置继承；旧合并状态在释放控制后清空本地值，普通容器查询保留原始 selector，勿与挂载型 Teleport 容器策略混用。

共享 ResizeObserver 的订阅和回调在帧内调度，卸载或切换目标会取消待注册任务；测试订阅后的行为时应等待浏览器帧，不依赖同步 observe 副作用。虚拟列表打开回归保留未处理异常检测。

RegexVis 可独立导入 web-core/regex-vis/parser/index、regex-vis/layout 和 regex-vis/foundation；布局计算不需要 DOM。Vue 用户继续使用原 RegexVis 组件与 layout 深入口，props、双模型、事件及插槽保持。

KVList 可独立导入 web-core/kv-list/foundation 与 kv-list/utils。Foundation 接收实时 rows/json/bulk/disabled 端口，显式 initialize 后由适配器转发模型变化；Vue 组件的 props、双模型及插槽保持兼容。

独立规则入口包括 web-core/interaction/pressable、button/text、alert/foundation 和 selectable-card/foundation。Vue 的 Button、Link、Alert、SelectableCard 继续沿用原 props、事件及插槽。

独立规则入口新增 web-core/tag-group/foundation、tag-group/types、dropdown/foundation、dropdown/panel。TagGroup 的缓存与渲染仍由 Vue 负责，Dropdown Panel 接收浏览器焦点/动画帧端口；Vue 使用方式保持。

web-core/cascader/option 可独立复用选项级规则；模型使用已有 CascaderOptionInfo<P>，Tag 属性通过 P 保持框架无关。Vue Cascader/CascaderPanel 与 option 深入口保持原 API。

独立规则入口新增 web-core/list/foundation 与 input-password/foundation。密码 Core 状态 masked=true 表示掩码，与 Vue visibility 的原语义一致；Vue 用户无需更改原调用。

独立规则入口新增 web-core/tree/node、date-picker/panel-body、date-picker/cell-range。Tree 节点依赖简单状态/上下文端口，日期比较采用 value cell 以维持原 receiver；Vue API 不变。

新增独立 Core 深入口：select/dropdown、model-selector/trigger、input-search/foundation、input-label/foundation；均支持普通状态端口，不依赖 Vue。Vue 消费方仍用原有组件入口。

新增 Core 深入口 markdown/image、markdown/html、markdown/html-entities。Vue 的 MarkdownRender、image/html 节点及旧 html-entities 深入口 API 保持不变；解析器显式依赖由 Core 管理。

分页与 TreeSelect 面板可独立使用 Core 的 pagination/items、tree-select/panel；Vue 使用者继续使用现有组件入口，无需调整 props、事件或插槽。

Core 的 grid/column、space/foundation 提供普通对象即可调用的列布局和间距计算；Vue 的 Row、Col、Space 继续使用原入口与 API。

Core 的 table/cell、breadcrumb/foundation 可独立调用懒加载、选择状态、路径与折叠规则。现有 Vue Table、Breadcrumb 及子组件无需改动接入方式。

日期标题可使用 date-picker/header 的 createDatePanelHeaderLabels；返回的 getYear/getMonth 支持普通状态或 getter 和语言转换回调。现有 Vue 日期面板与键盘操作的 API 不变。

Tooltip/Popover 的共享模型可通过 compatTrigger.createPopupWrapperFoundation 使用，输入状态和两个布尔通知回调；原 Vue 组件无需调整受控、默认值、事件或插槽。

Clamp 的完整控制器位于 Core 的 `clamp/inline/foundation`、`clamp/line/foundation`、`clamp/rich-line/foundation`、`clamp/wrap/foundation`，也可从根命名空间 `clampInline`、`clampLine`、`clampRichLine`、`clampWrap` 访问。适配器提供普通 value cell、实时属性 getter 和渲染/测量调度端口；Vue 组件原有 props、插槽、事件和 expand/collapse/toggle 方法保持不变。

Table 根规则可通过 `tableInteraction`、`tableDrag` 与既有 `tableLayout` 命名空间调用；Tree 拖放使用 `treeDrag`。TreeSelect 的输入/浮层和选择投影分别使用 `treeSelectInteraction`、`treeSelectPresentation`，并继续复用 `treeSelect` 的选择提交。Upload 预览使用 `uploadFiles.getUploadPreviewUrls`、`uploadFiles.previewUploadFile`。输入为普通状态/getter 和通知端口，不要求 Vue。保留回调顺序与异常传播，不要在适配器额外发送相同事件或添加拖放 finally 清理。
