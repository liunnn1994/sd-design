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

SD Design 以共享 Foundation 与独立框架 Adapter/View 分层组织企业级组件库。`@sdata/web-core` 提供无框架规则、原生驱动和共享样式，`@sdata/web-vue` 提供兼容既有 API 的 Vue 3 实现；未来框架适配包复用同一 Core。本项目采用 pnpm workspace 管理组件源码、调试环境和文档站。

项目维护的组件、文档站、调试站、MCP、构建与发布脚本均使用 TypeScript，Vue 逻辑统一使用 `<script setup lang="ts">`。类型检查使用 TS7（typescript-native-bridge）；Node 24 原生执行 `.ts` 脚本。`pnpm run typecheck` 同时检查源码约定、脚本和各工作区包。工具配置也使用 ESM TypeScript；编译产物与第三方代码边界见 [架构说明](ARCHITECTURE.md#typescript-源码与运行边界)。

锚点型悬浮层统一使用 `@floating-ui/vue` 定位，并通过 `floatingOptions` 原样透传上游配置。旧定位API 保持兼容；冲突规则与迁移示例见文档站的“Floating UI 迁移指南”。

文本与响应式原子项裁剪共用 `@sdata/web-core` 的测量、搜索缓存和收敛控制器；Vue 层保留状态容器、渲染提交调度、VNode/插槽及 `LineClamp`、`RichLineClamp`、`InlineClamp`、`WrapClamp` 的既有 API，现有 `Ellipsis` 及各组件的 responsive 行为继续复用同一实现。

面板分割统一使用 `PanelGroup`、`Panel` 与 `PanelSeparator`，原 `Split` 已移除。组件组支持受控/非受控尺寸、实时尺寸更新、拖拽生命周期事件、禁用调整、动态方向和自定义根标签；尺寸数值表示像素，百分比使用字符串。

提交变更继续使用 `pnpm cz`，由 czg 加载 `commitlint.config.ts` 中的中文交互与提交规则。

## 🎯 导读与快速开始

- 想要快速启动项目、了解本地开发流，请直接阅读 **[QUICK-START.md](QUICK-START.md)**。
- 想要深入理解项目构建流程、模块分层及设计理念，请阅读 **[ARCHITECTURE.md](ARCHITECTURE.md)**。

## 🏗️ 基础架构摘要

根目录统一调度 Core、Vue 适配层及文档消费层。Core 不依赖 Vue；Vue 保留响应式、生命周期、VNode/插槽和框架专属库接线，不通过 Web Components 包装共享规则。

Core 与 Vue 由同一发布流程同步版本，按依赖顺序先发布 Core、再发布 Vue；Vue 包中的 `workspace:^` 在打包时转换为对应 Core 版本范围。消费者继续只安装 `@sdata/web-vue`。发布配置从仓库根目录加载，使两份包清单进入同一个发布提交。

Tour 基于 driver.js 封装，直接沿用原生配置与实例方法，并通过组件库 token 适配浮层和按钮样式；浮层内容与业务按钮支持 Vue 作用域插槽。

核心包包括：

- `packages/web-core`：共享 Foundation、原生浏览器驱动、纯类型和 SCSS/token；独立产出 ESM 与声明。
- `packages/web-vue`：Vue Adapter/View 和旧深入口兼容层。产出浏览器 UMD、ESM 模块及 IDE 元数据；依赖 Core，不提供 CJS require 入口。
- `packages/sd-vue-docs`：文档站消费层。基于 Astro 组织构建组件文档及在线演示。
- `packages/web-vue-debug`：轻量级调试环境。开发单组件时可直接基于此包快速热更和联调。
- `packages/sd-mcp`：MCP 服务层。为 AI 助手（Claude Code、Codex 等）提供 SD Design 自动提取的组件 API 元数据（含第三方组件类型及 Message / Notification 服务配置与方法）查询，详见 [packages/sd-mcp/README.md](packages/sd-mcp/README.md)。

## ⚙️ 环境要求

- 使用仓库 `mise.toml` 固定的 Node.js 24.22.0、pnpm 12.6.0。

## 💻 常用命令概览

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

以下版本号基于当前 [Browserslist 配置](https://web.dev/baseline?hl=zh-cn)自动生成：

- and_chr>=124
- and_ff>=125
- chrome>=124
- edge>=124
- firefox>=125
- ios_saf>=17.4
- safari>=17.4

<!-- browserslist:end -->

## 📜 许可与规范

本项目遵循 [AGPL-3.0-only](LICENSE) 开源协议。如需贡献代码，请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

### Markdown 渲染

`MarkdownRender`（全量注册名 `SdMarkdownRender`）基于精确锁定的 `markstream-vue@2.0.13`。保留解析、流式、虚拟化和可选图表/数学引擎，默认在组件子树内使用 SD 标题、段落、链接、图片与任务项。公共上游 API 和类型可从 SD 根入口导入；同名 Tooltip 使用 `MarkstreamTooltip`，完整原名入口为 `@sdata/web-vue/markstream`。样式沿用现有全量或按需接入方式，基础 CSS 已包含，不再单独导入 Markstream CSS。详见 [Markdown 文档](packages/sd-vue-docs/src/content/docs/components/markdown-render/index.mdx) 和 [兼容清单](packages/web-vue/components/markdown-render/COMPATIBILITY.md)。

## Foundation / Adapter 拆分

完整的分层说明、能力边界与 Infographic 架构图见[跨框架技术方案](packages/sd-vue-docs/src/content/docs/guides/architecture.mdx)（文档站路径 `/guides/architecture/`）。

`packages/web-core`（`@sdata/web-core`）承载无框架的规则与计算；`packages/web-vue` 保留 Vue 的视图、响应式、生命周期、上下文与插槽。现有 `@sdata/web-vue` 包名、导出入口与旧工具深路径继续可用，业务项目无需直接导入 core。React 等适配包尚未实现。

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

Tabs 的注册排序、激活/增删通知、键盘与滚动投影、隐藏面板挂载规则，以及 Collapse 的切换/手风琴和离场销毁规则位于 core；Vue 保留 VNode 缓存、插槽/注入、尺寸读取和过渡连接。

Modal、Drawer 和 Popconfirm 的确认/取消协议、对话框可见性生命周期和命令式关闭规则位于 core。弹层栈、焦点循环/恢复、共享滚动锁与 Modal 拖动驱动也由 core 管理；Vue 负责 Teleport、实例渲染、原生监听连接和响应式调度。

Message/Notification 的队列、ID、去重、更新/关闭、跨位置管理和计时策略位于 core 的 notice 模块；Vue 仅连接响应式条目、渲染函数、配置上下文和列表过渡，保留两种服务不同的标题去重和重计时规则。

Image 的加载/页脚和预览打开规则、ImagePreview 的缩放/旋转/键盘/提示计时，以及预览分组注册/导航和拖动驱动位于 core；Vue 连接图片 DOM、测量、插槽、响应式与过渡。

FilePreviewer 的可见性/插槽优先级、媒体请求世代、Video.js 加载和 PDF 文档/分页/渲染生命周期位于 core；Vue 保留浅引用、插槽/画布视图和默认 worker 资源打包入口。

ColorPicker 的颜色/渐变解析、格式转换、受控回滚、最近颜色及拖拽生命周期位于 core；Vue 保留响应式引用、模板、翻译与 VueUse 指针绑定，原有类型和 utils 深路径继续转发。

Carousel 的索引归一化、受控请求去重、切换方向、独立动画锁/自动播放调度、键盘与指示器规则位于 core；Vue 保留子项收集、响应式连接、计时器适配和渲染，原有复合组件及 prev/next/goTo API 不变。

Tour 的 driver.js 引擎、原生协议类型、浮层目标接入与刷新/销毁规则位于 core；Vue 保留 Teleport、插槽作用域与 observer/RAF 连接。基础样式和 MIT 授权随 core 发布，旧类型与原生实例公开方法保持兼容。

Anchor、Affix、BackTop 的滚动跟踪、位置/阈值、动画取消和监听生命周期位于 core，TimePicker 的滚动补间也使用共享驱动。Vue 保留 refs/watch、注入与模板；DOM 工具和旧滚动工具深路径继续转发。

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

Markdown 自有图片请求/fallback 与 HTML token/建树/实体规则分别由 Core markdown/image、markdown/html 和 markdown/html-entities 共享；Vue 保留上游 renderer 与生命周期、nextTick、VNode 渲染。Core 使用与当前上游相同的独立 stream-markdown-parser@1.2.19。

分页子项的激活、跳页和尺寸选项规则位于 Core pagination/items；TreeSelect 面板的选择/勾选映射与事件路由位于 tree-select/panel。Vue 保留计算缓存、初始化方向、Tree 属性透传和组件模板，原入口与 API 不变。

GridCol 的 flex 解析、断点类与 gutter 计算由 Core grid/column 共享；Space 的尺寸映射、双向间距和默认对齐由 space/foundation 共享。Vue 保留响应式断点监听、computed 缓存、VNode/插槽与 DOM 渲染，原组件用法不变。

Table 单元格懒加载与操作列选择派生/路由位于 Core table/cell；Breadcrumb 的累计路径、URL 回退和条目折叠位于 breadcrumb/foundation。Vue 保留原插槽、渲染回调、状态缓存与生命周期接线，公开组件 API 不变。

日期面板标题的模式/语言格式回退由 Core date-picker/header 共享；PageHeader、Carousel 与 Upload 图标操作复用 Core 的键盘激活工具。Vue 保留事件名映射、原载荷和组件模板。

Tooltip/Popover 的可见性回退由 Core trigger/compat-state 共享，保留重复通知及受控释放后的本地请求。Vue 继续维护初始 ref、computed 和原事件映射，公开用法不变。

Table 根组件的查询/分页通知、同级拖放提交与固定/操作列规则由 Core table/interaction、table/drag 和 table/layout 共享；Tree 的拖放判定与事件清理由 tree/drag 共享。TreeSelect 的输入/可见性事件与选择投影位于 tree-select/interaction、tree-select/presentation；Upload 的预览 URL、索引和通知顺序位于 upload/files。Vue 保留原受控状态接线、DOM 测量、组件实例、插槽与渲染，公开组件 API 不变。
