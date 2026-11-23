<div align="center">
  <img height="180" src="https://raw.githubusercontent.com/liunnn1994/sd-design/refs/heads/main/packages/sd-vue-docs/public/logo-icon.png">
</div>

<div align="center">
  <img height="40" src="https://raw.githubusercontent.com/liunnn1994/sd-design/refs/heads/main/packages/sd-vue-docs/public/logo-text.png">
</div>

<div align="center">

[![Deploy docs](https://github.com/liunnn1994/sd-design/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/liunnn1994/sd-design/actions/workflows/deploy-docs.yml) [![zread](https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/liunnn1994/sd-design)

</div>

---

SD Design 以共享 Foundation 与独立框架 Adapter/View 分层组织企业级组件库。`@sdata/web-core` 提供无框架规则、原生驱动和共享样式，`@sdata/web-vue` 提供兼容既有 API 的 Vue 3 实现；`@sdata/web-react` 提供原生 React 实现，并复用同一 Core。本项目采用 pnpm workspace 管理组件源码、调试环境和文档站。

项目维护的组件、文档站、调试站、MCP、构建与发布脚本均使用 TypeScript，Vue 逻辑统一使用 `<script setup lang="ts">`。类型检查使用 TS7（typescript-native-bridge）；Node 24 原生执行 `.ts` 脚本。`pnpm run typecheck` 同时检查源码约定、脚本和各工作区包。工具配置也使用 ESM TypeScript；编译产物与第三方代码边界见 [架构说明](ARCHITECTURE.md#typescript-源码与运行边界)。

锚点型悬浮层使用 Floating UI 定位，Vue 接入 `@floating-ui/vue`，React 接入共享的 `@floating-ui/dom`，并通过 `floatingOptions` 原样透传上游配置。旧定位API 保持兼容；冲突规则与迁移示例见文档站的“Floating UI 迁移指南”。

文本与响应式原子项裁剪共用 `@sdata/web-core` 的测量、搜索缓存和收敛控制器；Vue 层保留状态容器、渲染提交调度、VNode/插槽及 `LineClamp`、`RichLineClamp`、`InlineClamp`、`WrapClamp` 的既有 API，现有 `Ellipsis` 及各组件的 responsive 行为继续复用同一实现。

SkeletonReveal 的轮廓测量、播放与中断规则由 Core Foundation 共享，通过端口连接元素、状态、渲染调度和动画；Vue 保留 SVG 模板与 motion-v 接线。轮廓颜色和宽度使用 Core 共享主题 token，可在主题编辑器中调整。

面板分割统一使用 `PanelGroup`、`Panel` 与 `PanelSeparator`，原 `Split` 已移除。组件组支持受控/非受控尺寸、实时尺寸更新、拖拽生命周期事件、禁用调整、动态方向和自定义根标签；尺寸数值表示像素，百分比使用字符串。

提交变更继续使用 `pnpm cz`，由 czg 加载 `commitlint.config.ts` 中的中文交互与提交规则。

## 🎯 导读与快速开始

- 想要快速启动项目、了解本地开发流，请直接阅读 **[QUICK-START.md](QUICK-START.md)**。
- 想要深入理解项目构建流程、模块分层及设计理念，请阅读 **[ARCHITECTURE.md](ARCHITECTURE.md)**。

## 🏗️ 基础架构摘要

根目录统一调度 Core、Vue 适配层及文档消费层。Core 不依赖 Vue；Vue 保留响应式、生命周期、VNode/插槽和框架专属库接线，不通过 Web Components 包装共享规则。

Core、Vue、React 独立管理版本、tag 和 CHANGELOG，由同一发布流程按 Core→Vue→React 顺序判断发布。Core 变更联动两个适配包，Vue/React 变更仅发布自身；提交按实际文件路径及共享依赖变更影响过滤。Vue 的 `workspace:^` 与 React 的 `workspace:*` 在打包时转换为本次 Core 的版本范围或精确版本。

Tour 基于 driver.js 封装，直接沿用原生配置与实例方法，并通过组件库 token 适配浮层和按钮样式；浮层内容与业务按钮支持 Vue 作用域插槽。

核心包包括：

- `packages/web-core`：共享 Foundation、原生浏览器驱动、纯类型和 SCSS/token；独立产出 ESM 与声明。
- `packages/web-vue`：Vue Adapter/View 和旧深入口兼容层。产出浏览器 UMD、ESM 模块及 IDE 元数据；依赖 Core，不提供 CJS require 入口。
- `packages/sd-vue-docs`：文档站消费层。基于 Astro 组织构建组件文档及在线演示。
- `packages/web-vue-debug`：轻量级调试环境。开发单组件时可直接基于此包快速热更和联调。
- `packages/sd-mcp`：MCP 服务层。为 AI 助手（Claude Code、Codex 等）提供 SD Design 自动提取的组件 API 元数据（含第三方组件类型及 Message / Notification 服务配置与方法）查询，详见 [packages/sd-mcp/README.md](packages/sd-mcp/README.md)。

## ⚙️ 环境要求

- 使用仓库 `.mise.toml` 固定的 Node.js 26.13.1、pnpm 12.21.0。

## 💻 常用命令概览

PR 和主分支推送的浏览器 CI 按改动组件及其传递依赖者选择 Cypress spec。发布 CI 对同一个提交执行 Core Foundation、Vue 和 React 非浏览器测试，以及全部 Vue、React 和文档浏览器测试。任一项失败或取消都会阻止三个包发版。

每次推送到 `main` 都会触发发布检查，包括纯文档推送。若 `main` 在检查期间推进，旧流程会明确报告提交过期，由新提交的流程重新验证。

正式发布在安装和测试前检查三个 npm 包的 OIDC token exchange；可信发布配置不匹配时立即停止，避免检查完成后才发现认证失败并留下未发布的版本标签。

完整的命令及解释请参考 `QUICK-START.md`，这里列出日常最高频的命令：

```bash
# 安装依赖
pnpm install

# 启动完整的本地开发环境 (含组件库 Watch 与文档站服务)
pnpm run dev

# 启动组件独立调试页面 (最快体验组件修改)
pnpm run dev:web-vue

# 本地代码规范检查、类型校验及单元测试
pnpm run check

# 发版前的统一检验流程 (强制通过)
pnpm run check:ci
```

## 主题架构与在线编辑

主题 seed 的明暗色阶由 SD Design 本地 TypeScript 算法生成，组件库及在线编辑器无需加载 Arco Design 包。

文档站 `/guides/theme-editor/` 提供基础/高级、全局/组件主题编辑、明暗与紧凑、实时组件示例以及 JSON 导入、导出和复制。配置直接传给 `ConfigProvider` 的 `theme`。

页面示例是可平移、缩放的业务工作台，使用组件库展示常用组件和语义状态，预览主题与文档站明暗模式独立。

内置预设以基础色和算法派生主题，不固化浅色背景；局部主题的 seed 与最终明暗模式同步，紧凑模式不改变明暗继承。显式 token 覆盖会保留，旧配置中的浅色背景可在高级编辑中重置。

组件主题目录由 `style/token.scss` 自动生成，预览复用文档 demo。构建和开发启动会执行生成，无需向编辑器添加组件名单。维护约定见 [ARCHITECTURE.md](./ARCHITECTURE.md#主题目录与运行时覆盖)。

## 🌐 浏览器兼容性

<!-- browserslist:start -->

以下版本号基于当前 [Browserslist 配置](https://github.com/liunnn1994/sd-design/blob/main/.browserslistrc)自动生成：

- and_chr>=124
- and_ff>=125
- chrome>=109
- edge>=109
- firefox>=115
- ios_saf>=17.4
- opera>=95
- safari>=17.4

<!-- browserslist:end -->

## 📜 许可与规范

本项目遵循 [AGPL-3.0-only](LICENSE) 开源协议。如需贡献代码，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

### Markdown 渲染

`MarkdownRender`（全量注册名 `SdMarkdownRender`）基于精确锁定的 `markstream-vue@2.0.29`。保留解析、流式、虚拟化和可选图表/数学引擎，默认在组件子树内使用 SD 标题、段落、链接、图片与任务项。公共上游 API 和类型可从 SD 根入口导入；同名 Tooltip 使用 `MarkstreamTooltip`，完整原名入口为 `@sdata/web-vue/markstream`。样式沿用现有全量或按需接入方式，基础 CSS 已包含，不再单独导入 Markstream CSS。详见 [Markdown 文档](packages/sd-vue-docs/src/content/docs/components/markdown-render/index.mdx) 和 [兼容清单](packages/web-vue/components/markdown-render/upstream.ts)。

## Foundation / Adapter 拆分

完整的分层说明、能力边界与 Infographic 架构图见[跨框架技术方案](packages/sd-vue-docs/src/content/docs/guides/architecture.mdx)（文档站路径 `/guides/architecture/`）。

`packages/web-core`（`@sdata/web-core`）承载无框架的规则与计算；`packages/web-vue` 保留 Vue 的视图、响应式、生命周期、上下文与插槽。现有 `@sdata/web-vue` 包名、导出入口与旧工具深路径继续可用，业务项目无需直接导入 core。React 适配包正在逐项实现，复用相同 Foundation 与样式，当前覆盖范围见文末迁移说明。

Tour 的 Vue 样式入口直接引用 `driver.js/dist/driver.css`，再加载 core 主题覆盖；按需与完整 CSS 均包含上游样式，core 不维护第三方 CSS 副本。

主题派生、日期计算、输入掩码、十进制运算、正则解析、公共数据工具、共享拖拽驱动及共享 SCSS/token 由 Core 提供；Table 的行数据、布局、筛选/排序/选择、展开和合并规则，以及 Form 的字段/校验调度均接入 Foundation。Clamp 的文本搜索、富文本处理、原子项流布局和多行测量控制器也归 Core 管理，Vue 保留视图与生命周期。其他框架适配包尚未实现。

Tree 的数据建模、可见/过渡节点、键盘导航决策、勾选/选择/展开和懒加载流程，以及 TreeSelect 的标签、fallback、搜索与选择提交规则也归 core 管理。Vue 的图标/插槽类型、焦点/滚动、过渡组件、响应式监听与渲染时机留在适配层。

Select 与 Cascader 的选项建模、值匹配、筛选、选择转换和键盘决策也由 core 提供；Cascader 的路径导航与懒加载请求身份保护在下拉框和独立面板间复用。Vue 保留响应式缓存、原生事件、滚动、浮层与搜索计时器，旧工具深入口继续可用。

TimePicker 的格式/列数据、禁用判断、输入草稿和确认/范围排序流程由 core 提供。Vue 保留响应式监听、DOM 滚动、焦点调度和事件绑定；旧工具和类型入口继续转发。

DatePicker 的单日期/范围选择、草稿与快捷选项、周期禁用、日期/时间合并、面板导航和单元格数据也由 core 提供。Vue 管理响应式监听、预览计时器、插槽/本地化和原生交互；公开类型及旧日期工具/格式入口继续保留。

Upload 的队列、异步校验名额、请求/取消/重试、跨标签页锁和预览 URL 生命周期由 core 管理，并提供默认 XHR、文件筛选与目录遍历驱动。Vue 提供响应式条目、列表同步和卸载绑定，CustomIcon 的渲染类型留在 Vue；旧工具和类型入口继续转发。

RichTextEditor 的 Lexical 编辑流程、内联组件节点、内容/JSON/HTML/Markdown 转换、历史与受控同步位于 core。Vue 管理编辑区 ref、生命周期和 Teleport/插槽渲染；原实例方法、节点类及旧类型入口保持可用。

JsonForm 的模型所有权、字段读写、JSON Pointer、A2UI 转换和控件规则位于 core。Vue 保留响应式代理、组件注册表、Form 实例转发与插槽渲染；原泛型 schema、具体组件 props/events 和旧工具入口继续可用。

Transfer 的双面板数据、选中项迁移、全选/过滤和简洁模式动作位于 core。Vue 负责响应式值、Form 事件、上下文与插槽；原 TransferItem 和组件入口保持兼容。

Checkbox/Radio 及其 Group 的选择模型、选项规范化、提交/同步规则，以及 Switch 的异步钩子与自动加载流程位于 core。Vue 保留原生 input 回写、watch/nextTick 时机、组上下文与渲染类型，原组件和选项 API 保持兼容。

Slider 的值/范围同步、键盘/输入/轨道选择、小数步长、坐标换算、刻度/标签和拖动监听生命周期位于 core。Vue 负责轨道矩形测量、响应式状态与 Tooltip/输入渲染；旧工具深入口和 CSSProperties 返回类型继续保留。

Rate 的半选/清空、悬停、键盘、动画状态和分级颜色规则，以及 Progress 的模式、百分比、尺寸、渐变和 SVG 几何计算位于 core。Vue 保留评分图标/只读提示、响应式绑定、SVG 唯一 ID 和插槽；原组件 API 保持兼容。

InputNumber 的数值/高精度字符串、parser/formatter、输入草稿、步进/提交和长按状态位于 core；Vue 保留输入实例、原生事件/焦点、计时器驱动与 watch。number-precision 的运行依赖统一归 core，旧类型与 decimal 深入口保持兼容。

Input / Textarea 的长度限制、组合输入、提交快照与清空流程共享 core 的 text-input foundation；Vue 保留受控值修复、选区、焦点和尺寸测量。两种输入的历史截取与事件顺序差异保持不变。

Pagination 的页码描述、切页/页长调整、受控同步及跳页框提交规则位于 core；Vue 保留配置注入、响应式调度、插槽与原生事件，原分页类型和工具深入口继续可用。

ResizeObserver 的订阅切换、帧合并、过期回调隔离和卸载取消由 core Foundation 管理；core 的浏览器驱动适配原生/兼容观察器和 requestAnimationFrame，Vue 保留两个内部观察组件及 hook 的框架连接。尺寸事件延迟到下一帧发布，允许监听者修改祖先布局而不重入原生尺寸通知。

Trigger 的可见性提交、延迟、原生交互开关规则、外部关闭、滚动阈值与过渡后挂载判断迁入 core；Vue 保留原事件转发、上下文/DOM 监听、Floating UI 与插槽。旧平移类型和工具深入口继续可用。

Menu 的树形注册、展开/手风琴、选中/折叠提交、键盘索引和水平溢出边界位于 core；Vue 保留 VNode/插槽、注入与 DOM 适配。水平菜单复用 core 尺寸驱动，resize-observer-polyfill 的直接依赖统一归 core。

Menu 收集器支持显式变更通知，React 适配器据此刷新祖先并隔离嵌套根菜单；Menu/Item/ItemGroup/SubMenu 已接入共享选择、展开、键盘、溢出及滚动规则，并提供 React 文档。共享收集器在挂载后上报，避免初始弹出菜单重复注册，并同步动态子菜单替换后的父级引用。

Tabs 的注册排序、激活/增删通知、键盘与滚动投影、隐藏面板挂载规则，以及 Collapse 的切换/手风琴和离场销毁规则位于 core；Vue 保留 VNode 缓存、插槽/注入、尺寸读取和过渡连接。

Modal、Drawer 和 Popconfirm 的确认/取消协议、对话框可见性生命周期和命令式关闭规则位于 core。弹层栈、焦点循环/恢复、共享滚动锁与 Modal 拖动驱动也由 core 管理；Vue 负责 Teleport、实例渲染、原生监听连接和响应式调度。

Message/Notification 的队列、ID、去重、更新/关闭、跨位置管理和计时策略位于 core 的 notice 模块；Vue 仅连接响应式条目、渲染函数、配置上下文和列表过渡，保留两种服务不同的标题去重和重计时规则。

Image 的加载/页脚和预览打开规则、ImagePreview 的缩放/旋转/键盘/提示计时，以及预览分组注册/导航和拖动驱动位于 core；Vue 连接图片 DOM、测量、插槽、响应式与过渡。

FilePreviewer 的可见性/插槽优先级、媒体请求世代、Video.js 加载和 PDF 文档/分页/渲染生命周期位于 core；Vue 保留浅引用、插槽/画布视图和默认 worker 资源打包入口。

ColorPicker 的颜色/渐变解析、格式转换、受控回滚、最近颜色及拖拽生命周期位于 core；Vue 保留响应式引用、模板、翻译与 VueUse 指针绑定，原有类型和 utils 深路径继续转发。

Carousel 的索引归一化、受控请求去重、切换方向、独立动画锁/自动播放调度、键盘与指示器规则位于 core；Vue 保留子项收集、响应式连接、计时器适配和渲染，原有复合组件及 prev/next/goTo API 不变。

Tour 的 driver.js 引擎、原生协议类型、浮层目标接入与刷新/销毁规则位于 core；Vue 保留 Teleport、插槽作用域与 observer/RAF 连接。基础样式和 MIT 授权随 core 发布，旧类型与原生实例公开方法保持兼容。

Anchor、Affix、BackTop 的滚动跟踪、位置/阈值、动画取消和监听生命周期位于 core，TimePicker 的滚动补间也使用共享驱动。Vue 保留 refs/watch、注入与模板；DOM 工具和旧滚动工具深路径继续转发。

React Affix 复用同一 Foundation，支持顶/底偏移、目标与外层容器、内容尺寸变化、change 通知及 ref.updatePosition。两端底部固定按不含横向滚动条的视口高度计算，React 示例与 API 文档已接入。

React BackTop 复用 core 滚动阈值、补间及取消逻辑，支持默认本地化按钮、自定义内容与减少动态效果偏好；与 Trigger 共享 React 显隐过渡适配 hook，SCSS 和交互文档已接入。

React Anchor/AnchorLink 复用 core 的链接注册、章节命中、滚动补间和事件顺序，支持嵌套/动态链接、方向、轴线与 Affix 组合，文档提供真实滚动示例。

React Tabs/TabPane 复用 core 切换、导航、面板挂载和溢出规则，支持数字/字符串 key、动态包装面板、隐藏内容缓存、六种类型、四种位置、RTL 与 fullHeight Scrollbar。共享注册器的 ID 泛型默认仍为 number；React 使用稳定字符串 ID，文档与交互测试已接入。

InputTag 的数据/创建/删除/IME 规则、AutoComplete 搜索与选择、Mention 前缀测量和文本替换、共享只读提示计时位于 core；Vue 保留 TagProps 专化、响应式、输入节点/焦点及候选视图连接。

VerificationCode 的格子编辑/粘贴/回滚和焦点决策、Steps 的状态/注册/切换规则、Timeline 的位置/末项/样式计算位于 core；通用 DOM 索引驱动也由 core 共享，Vue 保留节点、观察器生命周期及渲染。

Badge 的计数/溢出、颜色与 RTL 偏移，Statistic 的初值/格式和 Countdown 的截止时间/暂停/通知状态机由 core 共享；Vue 连接响应式状态、调度和计时器生命周期。

NumberFlow 的本地化数字格式/位身份、插件增量、动态样式、动画版本/计时器和分组调度位于 core；Vue 保留插槽、注入键、响应式计算和渲染后布局读取。

Watermark 的画布绘制、字体测量、图片渲染版本、灰阶、节点恢复和原生观察器由 core 共享；Vue 保留 props、主题引用、插槽和生命周期连接。

Cropper 的懒加载实例、属性同步/恢复、选区/图片就绪、事件和销毁控制位于 core；Vue 保留渲染、watch、事件桥接和原 native expose。cropperjs 由 core 执行导入，Vue 继续声明其公开类型依赖。

Scrollbar 的 options/样式归并、自动尺寸、事件与实例代理由 core 控制；Vue 保留递归 StyleValue 和实例 ref 身份、原方法签名/注释及 ResizeObserver 生命周期。

QrCode 的编码引擎、主题配色/尺寸规则和异步渲染世代控制由 core 管理；Vue 保留 nextTick、canvas 引用、状态/图标插槽及 Spin 配置。原 props、事件及类型入口不变。

PanelGroup 的尺寸/拖拽/键盘、交叉伸缩杆、重排和折叠内容控制位于 core；Vue 注入响应式 axes/fill 与 motion-v 数值动画，保留原三个组件、CSSProperties 类型和全部引擎深入口。

Calendar 的事件索引、创建/删除、重叠布局、异步缩放及特殊时段规则位于 core；Vue 提供事件/索引状态容器、数组变更观察和卸载钩子。单元格交互也已接入共享层，原 Calendar 实例、类型和深入口保持可用。

Calendar 的拖放会话、跨日历异步审批、视图导航、日期网格/标题及分钟计时也由 core 管理。Vue 保留原会话的响应式包装、computed/ref 身份、按需读取与 nextTick 通知；单元格视图交互也已接入共享层。

Calendar 的视图回退、日期限制、日程、编辑权限等配置规则，以及语言数据转换和异步文本请求顺序已迁入 core 的 `calendar/config`、`calendar/i18n`。Vue 保留 computed 缓存、监听、ConfigProvider/语言包接入与旧 config/i18n 深入口。

Calendar 事件片段的权限、截断/位置样式、点击/双击、长按/触摸取消与计时清理位于 core 的 `calendar/event`。Vue 保留事件对象的 reactive 包装、computed、浅监听字典、模板与挂载/卸载注册；单元格交互也已接入共享层。

Calendar 的 `calendar/cell` 与 `calendar/cell-interaction` 共享单元格日期/布局、特殊时段、创建预览、光标、鼠标/触摸和异步创建流程。Vue 保留插槽中的 ComputedRef、删除过渡、监听字典和 nextTick 重叠布局刷新，原插槽/属性合同继续保留。

Calendar 的其余子视图派生位于 `calendar/surfaces`，原生光标/前缀/触摸菜单生命周期位于 `calendar/surface-interaction`，全天栏缩放位于 `calendar/all-day-resizer`。Vue 保留模板、过渡中的局部 computed 和生命周期调度；类名、时间标签、星期标题及 CSS 尺寸规则由共享层提供。

共享响应式断点位于 core 的 `_utils/responsive-observe` 与 `_utils/responsive`：原生媒体查询订阅、快照、断点选择和列配置转换由 core 管理；Vue hooks 保留 Ref/computed/watch 和挂载时序。Grid 类型及旧工具深入口继续转发。Sider 自身的折叠状态机和独立断点协议见下述分工。

Sider 的初始/受控折叠、断点监听、rail 悬停、宽度与触发条件、Drawer 开合通知位于 core 的 `layout/sider`，Layout 注册和显式 hasSider 优先级位于 `layout/layout`。Vue 保留 VNode 扫描、注入、响应式缓存、主题、图标及 Drawer/Scrollbar 视图；Sider 的最大宽度断点保留自身协议。

BorderBeam 的预设/动态 CSS、共享脉冲 RAF、实例计数及原生动画/观察器控制位于 core 的 `border-beam`。Vue 只连接状态、缓存派生、watch、挂载/卸载和 nextTick；旧 styles/pulseDriver/instance-id/types 深入口继续转发。BorderBeam 与 VoiceGlow 的原生媒体偏好监听由 core 的 `_utils/beam-preferences` 管理。

VoiceGlow 的 Web Audio 分析器租约、共享 RAF/canvas 绘制、颜色/预设/CSS、麦克风请求流程和组件状态位于 core 的 `voice-glow`。Vue 保留 CSSProperties 类型、shallowRef/computed、post watchEffect 和生命周期连接；原公开 hook 的 Ref 结果及原生工具深入口保持。

VirtualList 的尺寸提示/固定与最小尺寸、重建 key、键查找、滚动命令/触底通知和原生 OverlayScrollbars 控制位于 core 的 `virtual-list`。`virtua/vue`、VNode/slot、类名/样式投影与生命周期调度留在 Vue；core 通过最小引擎端口转交不透明 cache，没有引入 virtua 或 Vue 依赖。原内部组件深入口和缓存方法合同保持。

InputMask 的预设、值规范化、完成状态、原生事件和光标控制位于 core 的 `input-mask`。Vue 注入预设中的本地化占位文案、响应式状态与 nextTick 调度，保留 Input 渲染、插槽和公开实例方法；原预设表及引擎深入口继续可用。

Tag 的可见/选中状态、键盘事件、颜色解析/对比度/透明度及省略提示规则位于 core 的 `tag`；Vue 保留派生缓存、插槽更新、尺寸/RTL 配置和 class/样式投影。Tooltip 配置通过泛型端口保留框架字段，原 `TagProps`、颜色常量和组件入口保持兼容。

Avatar 的图片状态、延迟文字缩放、组配置优先级、尺寸/堆叠/重叠计算和触发图标样式位于 core 的 `avatar`；头像组通过泛型保留子项身份及分割规则。Vue 保留 VNode/图片组件识别、slot 更新、索引/尺寸观察、响应式和调度，旧组件组与注入键入口保持。

Toolbar 的初始快照/重置、搜索键盘规则、展开/溢出和 schema 栅格/插槽名计算位于 core 的 `toolbar`。Vue 保留 defineModel、JsonForm 实例、locale/配置、尺寸观察和渲染；复杂 schema 通过泛型端口保留身份，包含 JsonForm/按钮/Spin 的原公开 Props 留在 Vue。

BloomMenu 的开关/弹层同步、关闭计时、原生测量与焦点、网格/中心定位和 motion 配置数据位于 core 的 `bloom-menu`。Vue 保留 Trigger/Floating UI、motion-v 引擎、slots/refs/computed 和调度；菜单项图标通过泛型保留 Vue Component 类型，旧公开入口保持。

BasicCrudTable 的列表请求、分页/排序/筛选、删除流程和弹窗详情/校验/提交位于 core 的 `basic-crud-table`。Vue 保留表格/工具栏/表单/弹窗实例、模型与参数缓存、插槽、国际化及渲染同步，原公开入口与 API 保持。

ModelSelector 的项/组注册、过滤、键盘导航、快捷键匹配、选择和分组展开位于 core 的 `model-selector`，标签文本观察也由原生驱动处理。Vue 保留模型所有权、computed/watch、注入上下文、VueUse 键盘监听和别名表，以及弹窗、插槽与图标资源接入。

Typography 的编辑/复制/展开/省略控制、格式化和原生测量/编辑焦点位于 core 的 `typography`。Copy 的成功确认、反馈计时和卸载处理也由 core 管理；两者共享 `clipboard` SDK 及选项类型。Vue 保留插槽/VNode 渲染、文本提取的应用上下文、模型、提示与消息接入。

ThinkingOrb 的九种 Canvas 2D 绘制器、预设缓存和帧/可见性/reduced-motion 生命周期位于 core 的 `thinking-orb`；原引擎深入口继续转发。原生最近主题查找由共享 theme-mode 控制器处理，Vue 保留响应式订阅、属性合并、国际化和容器生命周期。

Sender 的 recorder-core 引擎和扩展入口、录音异步流程、语音活动定时规则，以及词槽 JSON/默认值/节点/配置合并/文本解析和提交按键规则位于 core 的 `src/sender`。Vue 保留 shallowRef、语言翻译、computed/watch、VNode 与富文本组件连接；原 RecorderCore 完整导出与实例身份保持。模型和原生交互由下述 Sender Foundation 管理。

声明构建会在复制到发布目录前检查本次临时产物中的全部 Vue SFC 声明，缺失时直接失败，避免旧声明掩盖漏发。

RichTextEditor 显式沿用公开实例接口；Vue 事件从自身已有的 lexical 依赖引用原生类型，避免发布声明引用 core 的内部 node_modules 路径。

录音 SDK 的基础初始化位于独立的 recorder-base 依赖模块，先于格式扩展执行；core 将这两个注册入口标记为有副作用，以保证生产打包的同步加载顺序。

Sender 的模型、动作、词槽编辑器同步、键盘/粘贴、原生 textarea 解析/焦点/插入与选区回填由 core 的 sender/foundation 管理。Header 的渲染保留与 RAF 高度动画、Switch 的受控请求/defaultValue 同步、SkillTag 的事件/关闭及 Tooltip 规范化位于 sender/controls。Vue 识别 VNode 的受控键，连接 shallowRef/computed/watch、nextTick、插槽与 DOM 暴露；SVG、类名与样式组合继续由 View 渲染。

Picker 内部单输入/范围输入的日期显示、草稿优先级、单侧禁用与原生焦点路由位于 core 的 `picker/input`；Vue 保留 Form/尺寸、只读提示、输入事件与模板适配。

ThemeProvider 的局部/全局目标、原生观察器、body 弹层容器和全局主题 owner 栈由 core/config-provider 管理；Vue 保留注入、响应式、弹层栈与渲染接入。

Ellipsis / PerformantEllipsis 的测量、等待/兜底、展开规则和首次激活回放由 core/ellipsis 共享；Vue 保留 Tooltip/插槽、Ref、渲染提交与生命周期适配。

Descriptions 的 span 行分组、末项补列和按侧对齐规则位于 core/descriptions；Vue 保留 VNode/RenderFunction、插槽选择和样式投影。

Table 列筛选草稿/同步/确认/重置和列排序状态/通知接入 core/table/column-filter、column-sorter；旧 Vue hooks 保留原 Ref/computed 与方法返回。

通用 useInput 的兼容输入协议与 Table 列宽拖动接入 core/text-input/legacy、table/column-resize；Vue 保留 Ref/响应式记录、nextTick/watch 和卸载接线。

高度过渡、SelectView 原生焦点守卫及日期/范围时间草稿规则由 web-core 提供；web-vue 保留 Transition、插槽、Ref 与生命周期适配，原深入口及公开协议继续兼容。

locale 的语言模型/数据、注册/回退/插值与纯前缀规则位于 web-core；web-vue 保留响应式 Map/Ref、ConfigProvider 注入、App 安装及旧语言深入口和可声明合并接口。

兼容分页 hooks 的初始化/受控值/事件规则和原生光标恢复由 web-core 提供，web-vue 保留原 Ref/tuple 接口；Input/Textarea 的 DOM/nextTick 接线及 Table/List 分页消费方式不变。

Tree 勾选状态、通用弹层别名状态和容器解析由 web-core 提供；web-vue 保留原 Ref/computed、watch/watchEffect、挂载及 Teleport 渲染，现有 hooks 深入口不变。

配置继承的显式值/兼容值/全局值/默认值选择、旧合并状态和普通 popup 容器查询规则位于 web-core；原始 VNode 属性存在性、注入与 Ref/tuple 适配留在 web-vue。

RegexVis 的解析、图形布局、标志同步和节点选择规则位于 web-core；Vue 保留模型/Ref/watch、SVG 和状态插槽，旧 layout 深入口继续转发共享实现。

KVList 的行集合、JSON/Bulk 双模型同步和排序规则位于 web-core；Vue 保留模型、Ref/watch、字段插槽和 Sortable 生命周期，原 utils 深入口继续转发共享实现。

Button/Link 共享 Core 点击守卫；Button 双汉字识别、Alert 关闭协议、SelectableCard 受控选择与尺寸规则均在 Core。Vue 保留注入、Ref、DOM 生命周期、插槽及动画接线。

TagGroup 的归一化与计数、Dropdown 的选择/选项通知及菜单焦点/键盘/滚动规则位于 Core。Vue 保留原插槽和模型 API、Trigger/布局组合及生命周期调度。

CascaderOption 的加载/勾选/路径标签与交互顺序位于 Core，Vue 保留选项 Ref、computed 缓存、Checkbox/Radio 和插槽。

List 的分页/网格和滚动通知、InputPassword 的掩码请求顺序进入 Core，Vue 保留既有公开 API、VNode、Ref 与 DOM/虚拟列表适配。

Tree 节点状态/事件及日期 body 的单元格守卫、范围排序进入 Core；Vue 保留原模板、computed、上下文、手势和插槽绑定。

SelectDropdown、ModelSelectorTrigger、InputSearch 与 InputLabel 的触底/触发/搜索/标签派生规则分别由 Core select/dropdown、model-selector/trigger、input-search/foundation 与 input-label/foundation 共享。Vue 继续维护节点、注入、refs 和渲染，公开 API 不变。

Markdown 自有图片请求/fallback 与 HTML token/建树/实体规则分别由 Core markdown/image、markdown/html 和 markdown/html-entities 共享；Vue 保留上游 renderer 与生命周期、nextTick、VNode 渲染。Core 与 Vue、React 上游共用 stream-markdown-parser@1.2.28 的同一实例。

分页子项的激活、跳页和尺寸选项规则位于 Core pagination/items；TreeSelect 面板的选择/勾选映射与事件路由位于 tree-select/panel。Vue 保留计算缓存、初始化方向、Tree 属性透传和组件模板，原入口与 API 不变。

GridCol 的 flex 解析、断点类与 gutter 计算由 Core grid/column 共享；Space 的尺寸映射、双向间距和默认对齐由 space/foundation 共享。Vue 保留响应式断点监听、computed 缓存、VNode/插槽与 DOM 渲染，原组件用法不变。

Table 单元格懒加载与操作列选择派生/路由位于 Core table/cell；Breadcrumb 的累计路径、URL 回退和条目折叠位于 breadcrumb/foundation。Vue 保留原插槽、渲染回调、状态缓存与生命周期接线，公开组件 API 不变。

日期面板标题的模式/语言格式回退由 Core date-picker/header 共享；PageHeader、Carousel 与 Upload 图标操作复用 Core 的键盘激活工具。Vue 保留事件名映射、原载荷和组件模板。

Tooltip/Popover 的可见性回退由 Core trigger/compat-state 共享，保留重复通知及受控释放后的本地请求。Vue 继续维护初始 ref、computed 和原事件映射，公开用法不变。

Table 根组件的查询/分页通知、同级拖放提交与固定/操作列规则由 Core table/interaction、table/drag 和 table/layout 共享；Tree 的拖放判定与事件清理由 tree/drag 共享。TreeSelect 的输入/可见性事件与选择投影位于 tree-select/interaction、tree-select/presentation；Upload 的预览 URL、索引和通知顺序位于 upload/files。Vue 保留原受控状态接线、DOM 测量、组件实例、插槽与渲染，公开组件 API 不变。

## 首页本地 AI 示例

首页 Sender 示例使用 WebLLM 0.2.86，在 Web Worker 中通过 WebGPU 运行 SmolLM2-135M-Instruct 的 4-bit 模型。首页客户端挂载后自动从 ModelScope 获取固定版本的权重和分词器，匹配的 WASM 从 jsDelivr 获取，下载总量约 85 MB；浏览器缓存后续复用。模型资源不经过本站服务器，聊天内容只用于本机推理。助手启动时读取本站 `/llms/llms.txt`，每轮按问题选取相关条目和文档链接注入上下文，演示组件用途问答。微型模型不保证中文回答质量，也不将文档索引当作完整 API 文档。

共享逻辑入口为 `packages/sd-vue-docs/src/components/home/browser-chat.ts`，Vue/React 的 `useBrowserChat` 分别订阅它；推理运行在 `local-chat.worker.ts`。不支持 WebGPU 时明确显示示例对话；下载或推理失败、停止、120 秒超时都会恢复输入，不自动回源本站或切换云端推理。公共镜像的可用性不由本站保证。

## React 适配迁移（进行中）

React 适配包要求 React、ReactDOM 及对应类型包版本满足 `^19.3.0`；无宿主 Fragment 的原生事件委托使用这一版本基线提供的 Fragment ref API。

`packages/web-react` 是 ESM React Adapter/View 包，复用 `packages/web-core` 的 Foundation 和 SCSS。当前 Vue 公开的 100 个组件组均已有对应 React 入口、样式和文档；SD 自有实现的验收结果与验证边界见 [React 对齐清单](docs/react-parity.md)。

文档站在同一个 Astro 应用中同时使用 Vue 和 React。React 示例位于 `src/components/react/`，使用独立的 React JSX tsconfig；开发编译通过 `src/integrations/scoped-react-refresh.ts` 将 Fast Refresh 限定到 React 客户端 TSX，避免污染 Vue SFC 和服务端模块，不修改第三方插件源码。

本地构建先执行 `mise exec -- pnpm run build:core`，再执行 `mise exec -- pnpm --filter @sdata/web-react build`。React 渲染检查使用 `mise exec -- pnpm --filter @sdata/web-react test`。Card 的 Vue/React 适配共享 `web-core/card/foundation` 的尺寸、滚动模式和 Meta/Grid 注册规则；迁移进度见 [React 对齐清单](docs/react-parity.md)。

Skeleton 系列复用共享 SCSS，SkeletonLine 的行宽、高度和间距由 core `skeleton/foundation` 统一计算。

Result 的状态回退和错误页插图也由 core 共享，Vue 与 React 使用相同 SVG 数据和实例隔离规则。

Grid 的 Row/Col 和 CSS Grid 适配共用 core 布局计算、响应式断点及 SCSS，支持动态子项和折叠后缀。

React Drawer 复用 core 的 dialog、confirmation、焦点陷阱、弹层栈和滚动锁，并沿用 Vue 的抽屉 SCSS。

Layout 的侧栏注册、响应式折叠、窄轨覆盖层尺寸由 core 共享；React 提供 Header/Content/Footer/Sider 复合组件，临时侧栏使用 Drawer。

React Dropdown 系列复用 core 的选项选择、面板键盘导航与可见性状态，提供分组、子菜单及分裂按钮。

Breadcrumb 两端共享路径类型、累计 URL 和折叠规则；React 支持条目组合、routes、自定义渲染及 Dropdown 路径菜单。

Steps/Step 复用 core 步骤状态、方向和错误连接线规则，React 按最近的 Steps 容器维护 DOM 顺序与条目注册。

Timeline/TimelineItem 复用 core 的位置、末项与线条样式计算，支持倒序、交替布局、标签位置和可配置的 pending 节点。

Collapse/CollapseItem 复用 core 展开与销毁规则及共享 CSS 动画，支持手风琴、受控数组和可定制标题图标。

React Statistic/Countdown 复用 core 数值格式化与倒计时 Foundation，数字视图复用 NumberFlow；支持日期、初始值动画、占位、暂停恢复、截止时间更新和完成事件。

React Progress 已接入线形、环形与步骤模式，复用 core 几何、渐变、阈值和状态规则；支持 mini、配置尺寸、独立 SVG 渐变 ID、自定义文本和原生 ref。

React TagGroup 复用 core 选项归一化与数量切分，组合 WrapClamp、Popover 和 Tag 实现响应式/固定数量折叠、键盘计数器和自定义内容。

React Watermark 复用 core 画布绘制、图片回调版本、主题变化和防篡改观察器；共享 dispose 现在同时移除自身生成的层，支持 React StrictMode 生命周期重放。

React Form/FormItem 复用 core 的字段注册、规则校验、提交快照和重置流程。React 通过 onModelChange 回写命令式模型修改，useFormItem 为自定义控件提供标签关联、禁用、尺寸与校验事件；Button/Switch 已接入。

React Input/InputPassword/InputSearch/InputGroup 复用 text-input、input-password、input-search foundation；onValueChange 承接受控值更新，onInput 与提交式 onChange 保留 Vue 时序。共享光标恢复、字数截断、组合输入和只读提示规则，React 仅管理原生节点、生命周期和渲染。

React Textarea 已复用文本输入、光标恢复、fit-width 与只读提示；自动高度的样式采样、整数行高/边距及上下限计算提取至 core/textarea/size，Vue 的旧 utils 深入口转发共享实现。React/Vue 仅保留各自镜像节点、渲染调度与尺寸观察。

React InputNumber 组合 Input/Button 并复用 core/input-number 的十进制运算、边界、格式化和长按状态机，支持字符串高精度与提交式模型更新。

React Checkbox/Radio 与 Group 复用共享选中、限额、模型事件和选项归一化规则；React 共用原生 checked/indeterminate 恢复钩子，RadioGroup 保留原生同名单选和方向键行为。

React Rate 复用 core/rate 的评分、半星、颜色阈值、分级、键盘和动画状态，组合 Tooltip 与共享只读提示适配，支持 FormItem 和 ConfigProvider.allowClear。

React Slider 复用 core/slider 的数值、坐标、刻度/标记、范围与拖拽 Foundation；组合 InputNumber 和 Tooltip，提供鼠标/触摸拖拽、键盘、输入框联动及禁用/卸载清理。

React Message/Notification 复用共享 notice 服务、队列和计时器；静态 API 支持命令式调用，useMessage/useNotification 返回 API 与 holder，通过 portal 继承 React 上下文、语言和局部主题。

React Copy 与 Secret 已提供适配和文档：复制复用 core Foundation，显隐与文案键在 Vue/React 间共享。

React InputTag 已复用标签输入 Foundation，支持受控输入、IME、响应式折叠和表单联动，并提供独立文档与样式入口。

React 的 InputLabel/SelectView 内部选择视图复用共享 Foundation，供 Select、TreeSelect、Cascader 组合；三个选择组件均已提供公开入口与文档。React 文档总览目录从文档集合自动生成。

React 内部 VirtualList 复用 core/virtual-list Foundation，并以 virtua React 引擎适配容器、条目、滚动和缓存接口；布局及滚动条 SCSS 复用 core。WrapClamp 的测量提交在微任务中同步完成，尺寸通知触发的重新测量合并到下一帧并在卸载时取消，避免同页虚拟列表同步提交导致 ResizeObserver 循环。VirtualList 尚非公共组件入口；Select 与 Pagination 公开适配均已接入。

React Select 已接入公共入口、类型、按需样式和独立文档，组合 SelectView、VirtualList、Trigger、Scrollbar 与表单上下文，复用 Core 的值更新、选项归一化和键盘导航。下拉虚拟列表的尺寸提示及高度优先级从 Vue 工具层移入 core/select/virtual-dropdown，Vue 原路径保留重导出；ConfigProvider 增加 allowSearch、virtualListProps、selectSpinProps。

React Trigger 支持 referenceElement 显式定位节点。Select 的事件包裹节点使用 display: contents，定位和宽度测量指向实际选择视图；单/多选切换时重新绑定节点，使 CSS class 宽度与 fitWidth 都能正确传递到弹层。

React Pagination 已提供分页、页长选择与跳页，复用 core/pagination Foundation 和共享样式，并支持 ConfigProvider.pagination。

React AutoComplete 现已提供输入建议、分组、过滤和虚拟列表，复用 core/auto-complete、Select 导航及共享样式。

React Modal 复用 core 对话框 Foundation，支持声明式、静态方法与 useModal 上下文 holder。

React Modal/Drawer 切换 popupContainer 时保留内容节点与草稿，并转移滚动锁；useModal 所属组件卸载后保留的 API 不再创建弹窗。

React List、ListItem、ListItemMeta 已接入分页、栅格和虚拟列表，复用 core/list 与共享分页规则。

React Carousel/CarouselItem 已提供受控切换、指示器、自动播放和实例导航，复用 core/carousel 与共享样式。

React Mention 通过 `@sdata/web-react/mention` 提供提及输入与文本域，按需样式为 `@sdata/web-react/styles/mention.scss`。搜索/替换复用 core/mention，候选项导航复用 core/select，文本域镜像尺寸复用 core/textarea；React 适配层组合 Input、Textarea、SelectDropdown 和 Trigger。交互与 API 文档位于 React Mention 页面。

React SelectableCard 从 `@sdata/web-react/selectable-card` 导入，样式入口为 `@sdata/web-react/styles/selectable-card.scss`。Vue/React 共用 core/selectable-card 的公共类型、受控选择 Foundation 与样式；React 用原生 checkbox 保持键盘及拒绝写回行为，内容区域支持 ReactNode。完整交互示例见 React SelectableCard 文档。

React QrCode 通过 `@sdata/web-react/qr-code` 导出，样式入口为 `@sdata/web-react/styles/qr-code.scss`。Vue/React 复用 core/qr-code 的编码与异步结果失效规则，两侧卸载时调用 dispose；React QrCode 与 Layout.Sider 共用 useThemeMode 适配层，主题判定仍由 core/config-provider/theme-mode 提供。ConfigProvider.qrCodeSpinProps 配置加载指示器，React 文档含 Canvas/SVG 与刷新交互。

React `typecheck` 覆盖源码及浏览器 spec/fixture；完整静态检查使用 `tests/browser/tsconfig.check.json`，与 Cypress 的 spec 编译范围分开，避免 TNB/ts-loader 多输出 source map 冲突。

React Typography 包含 Text、Title、Paragraph 及组合入口，复用 core/typography 的编辑、复制计时、展开与格式化规则。React 适配负责 DOM 文本读取、Context 子内容更新、Input 聚焦和浮层根引用；共享样式通过 styles/typography.scss 引入，文档提供编辑/复制/省略示例。

React SkeletonReveal 提供自动入场、replay/finish 引用和按需样式。Vue/React 共用 core/skeleton-reveal 的几何测量、状态/取消规则及原生动画驱动；可见性批次采用最新记录，避免快速入场丢失。React 每次连接创建独立 Foundation，并在 StrictMode 清理时隔离旧实例。

React ThinkingOrb 复用 core/thinking-orb 的 Canvas 引擎、预设和动画生命周期，提供九种状态、20/64 尺寸、自动主题、速度、暂停及 Canvas 引用。React 仅负责状态/生命周期接线；根与子路径导出、按需样式和交互文档同步提供。ThinkingOrb 与 LiquidGlassLogo 的可见性观察器采用批次最新记录，避免快速入场丢失。

React LiquidGlassLogo 提供与 Vue 共用的 WebGL 渲染、自动宽度、主题回退和静态降级，以及 replay/seek/pause/play 引用、ready/error 回调、按需样式和交互文档。连接、上下文丢失与释放逻辑移入 core/liquid-glass-logo/controller；React 每次连接创建新控制器以隔离 StrictMode 清理后的异步任务。

React BorderBeam 复用 Core 的五种效果、动态 CSS、共享脉冲驱动与 flowFrom 状态规则，提供公开引用、回调、按需样式及交互文档。派生主题/尺寸/样式直接在 Foundation 内计算，两端 Adapter 不再把同一计算结果循环回传；React 对延迟测量使用连接代次检查，清理 StrictMode 废弃任务。

React VoiceGlow 复用 Core 音频分析、绘制驱动、预设、默认参数与 Foundation，提供完整几何/音频属性、回调、原生引用和 useVoiceMicrophone。派生计算由 Core 直接完成；麦克风 Hook 在客户端连接后检测支持，跳过 StrictMode 废弃连接的自动请求，并通过共享请求代次释放晚返回的音轨。深浅主题交互文档、全部参数、Hook 状态与按需样式同步提供。

React BloomMenu 使用现有 Button/Trigger 和与 motion-v 同版本的 Framer Motion；两端共用 Core 属性、布局、定位、动画参数和焦点规则。Core 直接计算派生值，并在 dispose 时使旧焦点任务失效；React 还取消连接持有的动画帧。提供受控/非受控菜单、五类自定义内容、原生根引用、按需样式和交互文档。

KvList 的框架无关类型、HTTP Header 建议和字段属性合并规则集中到 Core，Vue 保留原类型与常量转发入口。行增删改通过新数组通知 Adapter，并保留未修改行的身份；JSON/Bulk 归一化和排序仍使用现有 Foundation。React Adapter 提供 JSON/Bulk 双模型、Header/密码编辑器、自定义字段及拖拽排序，并配套根/子路径导出、独立样式与交互文档。共享排序驱动在销毁时移除当前实例持有的镜像和克隆节点，修复拖动中卸载的残留。

PanelGroup React 适配复用 Core 面板控制器、指针与键盘处理、尺寸测量、重排及内容过渡，动画驱动使用已有 framer-motion。PanelGroup、Panel、PanelSeparator 提供根/子路径导出、独立样式和 React 交互文档；引擎字段通过 React 外部存储订阅更新，保留 Vue 的受控/非受控尺寸、折叠、填充面板、嵌套与禁用契约。

图标生成器从同一批 SVG 生成 287 个 Vue 图标、Core 图形数据和 React 图标模块，并校验两端几何一致。尺寸/旋转规则和 IconFont 脚本去重、失败重试归入 Core；React 主入口提供通用 Icon，独立 icon 入口提供完整图标集合与单图标子路径。KvList、PanelGroup、BloomMenu 复用生成图标，移除重复路径。图标生成先于 Core 编译，React 文档包含可搜索目录和 IconFont 交互示例。

React Image、ImagePreview、ImagePreviewGroup 和 ImagePreviewAction 复用 Core 图片状态、预览操作、拖拽及分组 Foundation，并共用弹层堆叠、滚动锁和 SCSS。React Adapter 管理受控回写、图片注册身份、DOM 监听及稳定的 portal 容器；提供根/子路径入口、含基础图标的独立样式、实例方法和交互文档。

React Transfer 已接入公共入口、按需样式与 React 文档，复用 Core Transfer Foundation 的选择、过滤和移动逻辑；支持受控值、自定义面板及单向模式。

Calendar 的 37 项标量默认配置集中在 Core calendar/prop-defaults，Vue 属性定义与 React 配置适配共用；数组和对象默认值仍按实例创建。React Calendar 已提供公开组件、样式和交互文档，复用共享日程、导航及拖拽规则。

React Tour 已接入公共入口、按需样式与文档。两框架共用 Core driver 引擎、原生配置类型、动态浮层区域恢复逻辑和 vendor 样式；ref 暴露原生实例，React 通过渲染函数组合内容。

React RichTextEditor 已接入根入口、`rich-text-editor` 子路径、独立样式和交互文档。它复用 Core Lexical Foundation，通过 React Portal 渲染全部 JsonForm 内置节点、Tag 和自定义节点；支持序列化状态、HTML/Markdown、历史记录与原生编辑器方法。

React Sender、SenderHeader、SenderSwitch 和 RecorderCore 已接入根入口、`sender` 子路径、独立样式与文档。React 连接共享 Sender Foundation、结构化编辑器与录音控制器；Header/Switch 也可通过 Sender.Header/Sender.Switch 使用。

React Markdown 的协调测量已接通原生段落、列表和六级标题探针，文字布局与有界缓存位于 Core 的 markdown/text-height；浏览器按需加载已安装的 Pretext 引擎，SSR 和无 Canvas 环境保留静态回退。MarkdownRender 已提供根入口与 markdown-render 子路径，自有组件的生产回归已通过，具体验证边界见 React 对齐清单。

协调模式的流式代码和 pre 代码块估高复用 Core markdown/code-height，覆盖换行、行号、diff 和高度上限；React 负责识别实际渲染器，自定义代码组件保留静态回退。估高对齐不代表完整代码块渲染 API 已验收。

React 的默认 pre 路径现有代码标题、复制反馈、行号换行和图表语言分派，样式与复制边界复用 Core markdown/pre-code。diff 预览复用同版本 markstream-core 的数据与缓存，支持分栏/单栏、未修改行折叠、patch 元数据和行高同步；SD 自有节点的生产回归已通过，上游渲染能力与 SDK API 以官方 React 版本为准。

Markdown 的 KaTeX 阈值估算和安全帧调度已归入 Core；Vue 根入口与原有工具深入口转发同一实现。React 从公共 markdown-render 入口转发官方 SDK 支持的 API，不补齐第三方框架差异。

KaTeX / Mermaid CDN Worker 的源码生成、类型和 Blob URL 生命周期也由 Core 共享，Vue 保留根与旧 workers 深入口。Mermaid module 请求会等待首次加载完成；dispose 只回收 URL，不终止 Worker，调用方仍需 terminate。React 从公共 markdown-render 入口提供这些共享工具。

Markdown 内部兼容清单现显式承接解析器运行时、AST/策略类型、上游 React 组件及已有工具，并保留 UpstreamMarkdownRender / MarkstreamTooltip 别名。解析器由 Core 统一转发，与 SD 渲染器共享同一依赖模块和全局插件注册表。CustomComponents 按 React 组件映射承接，避免误用解析器同名 AST 表；第三方框架与运行时差异不属于 SD 自有组件的验收范围。

React Markdown 公共入口的 perfMonitor 提供手动性能样本统计；先 enablePerfMonitoring()，再通过 perfMonitor.recordRender() 记录样本，可暂停、导出或调用 getPerfReport() 查看报告。该工具不会自动采集数学渲染数据。

React Markdown 虚拟滚动配置类型在启用时要求 sessionKey；导入 heightCache 时需同时给出 heightCacheWidth。scrollRoot 可使用 HTMLElement、React ref 或 resolver，ref.current 尚未赋值时按原有规则选择滚动祖先。

第三方依赖边界：markstream-react 2.0.29 与 virtua 0.54.2 使用官方原包，不维护依赖补丁、私有入口或修改版 SDK 副本。1:1 还原仅针对 SD 组件库自己的实现，第三方 React/Vue 的能力与行为差异不纳入要求。React 源码按官方包支持的 Bundler 模块解析检查类型，不改写第三方声明。

## 双框架共享文档

文档正文只维护 `packages/sd-vue-docs/src/content/shared/`。`<Demo id="component/scenario" />` 关联 `src/components/generated/` 下的 Vue 示例和 `src/components/react/generated/` 下的真实 React 示例；框架专属代码使用 `<Framework only="vue|react">`。不要手改 `src/content/docs/` 中带生成标记的页面。

Astro 启动与构建自动生成两套路由和共享场景清单；`docs:pages` 可手动生成，`docs:check` 检查缺失场景、API 映射与过期输出。Vue 和 React 在线示例统一使用 LiveCodes（Monaco），提供简体中文界面、单文件编辑、实时预览和内置外部资源配置；编辑器主题复用 SD CSS 变量，组件类型使用本地打包声明。`docs:vendor:only` 缓存并准备官方 LiveCodes v49 静态资源，首次准备需要访问 GitHub；编译器和运行沙箱需要联网。静态部署须为 `/vendor/*` 设置 `Access-Control-Allow-Origin: *`，供隔离沙箱读取组件模块；开发、预览及支持 `_headers` 的托管平台已配置。首页布局、主题编辑控件和数据共享，预览按当前框架渲染；LLMs 文本分别位于 `/llms/` 与 `/react/llms/`。
