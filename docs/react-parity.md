# React 全量对齐交付清单

基线：当前 web-vue 公共组件目录。目录存在不代表行为对齐；每项必须核对 props、事件、插槽对应的 React render props、ref 方法、受控语义和可访问性。

## 当前范围与执行状态（2026-11-09）

用户已明确：1:1 还原仅针对 SD 组件库自己的实现。第三方 React/Vue 版本的能力、接口和行为差异不计入任务，不为补齐这些差异修改第三方依赖。原 279 项上游符号对照不再是交付或完成率指标。

### 最终交付结果

本轮已完成 SD 自有 React 实现的补齐和第三方修改回滚。以下结果覆盖本文后续历史阶段的待办与旧计数：

- 100 个公共组件组的源码、根/子路径、样式和文档无缺项；174 个自有组件导出的公开 ref 属性/方法、72 个入口直接静态属性已核对。407 个插槽名称及特殊 React 映射已核对；这不表示逐一证明所有可能的回调组合。
- 最终固定产物的真实 Chrome 全量：148 个正式 spec、1426/1426 通过，无失败、pending 或跳过（.local/react-final-full-production.log，进程退出码 0）。包含所有新增回归及此前因构建目录被重写而 404 的文档文件。
- 最新 React 单元测试 344/344；完整根类型检查、React 四组类型检查、独立 tarball 冻结安装/类型/SSR/生产打包、214 页文档与 103 个浏览器页面构建通过。格式检查通过，lint 无错误、保留 8 条警告；diff 检查通过。
- 最后一次 npm 发布包逐字节复核：markstream-react 113 文件、virtua 96 文件均与官方一致（.local/react-final-official-integrity.log）。不存在第三方补丁注册、私有 SDK 桥接或 SDK 改写构建。
- Vue 完整运行中的 4732 条断言通过；首个按需样式文件因全局 support 加载异常未执行。随后关闭全局支持文件、直接挂载组件隔离执行该文件，2/2 通过（.local/react-vue-on-demand-isolated.log）。这不是一次 709 文件全绿的运行，也未修复原先的全局 support 首次加载问题。
- 验证平台为 Windows Chrome。其他浏览器未跑；已确认的官方 Vue/React 开发插件冲突仍按第三方边界保留，生产文档验收通过。

静态清单 docs/react-component-inventory.json 的 behaviorVerified=false 表示该脚本只验证存在性；运行时结论使用上述真实测试记录，不将静态扫描伪装为行为验证。

- 本轮交付覆盖所有 SD 自有组件，第三方库差异不计入未完成项；最终结果见上节。
- 已移除 markstream-react 2.0.18、virtua 0.53.4 的两份补丁与 workspace/lockfile 补丁注册，恢复官方依赖；移除私有 sd-internals 桥接和随包复制/改写 SDK 的构建逻辑。源码直接引用官方 SDK，CSS 直接导入官方样式。
- SD 自有组件、共享 Foundation、节点替换、主题样式和文档保留。只清理要求第三方补丁或强制 Vue/React 上游等价的测试；SD 自有类型边界按未修改的官方 SDK 检查。
- npm 官方 tarball 完整性与安装文件逐字节核对通过：markstream-react 113 个发布文件、virtua 96 个发布文件均一致；包管理器额外生成的 .bin/katex shim 单独记录，不计作源码变化（.local/third-party-rollback-official.json）。
- 回滚后的 React build 与四组类型检查通过，保留的单元测试 338/338 通过（.local/third-party-rollback-types.log / .local/third-party-rollback-tests-final.log）。未重新跑全量浏览器测试，也未宣称自有组件迁移完成。
- 以下各日期记录是历史过程：涉及已撤销补丁、私有 API、修改版 SDK 的结果不再代表当前实现或当前验收要求。

### 恢复后的 SD 自有交付检查

本轮新增核对（以此处的新记录覆盖后文旧计数）：

- 自有插槽名称清单覆盖 174 个组件导出的 407 个插槽名称；特殊名称已逐一映射到 React 内容属性或 render props。发现 Switch 数字 0 文本误用真假判断，修复后 SSR 与浏览器通过。名称清单不等同所有回调签名及行为均已验收。
- 补齐 Ellipsis 的 `triggerRef`、MenuItem 和 SubMenu 显式公开的 ref 属性；Menu 的 DOM ref 保持可用，属性随选择、折叠及弹出模式切换更新。源码三文件 Chrome 共 97/97 通过（.local/react-own-ref-switch-browser.log）；随后补加的 Menu ref `onClick` 调用与 Drawer 命令式用例在最新生产产物上 2/2 通过（.local/react-own-api-focused-production.log，临时 spec 直接提取正式测试中的对应两项）。
- 检查 Vue 根入口显式导出的 626 个 SD 类型，补齐实际 React ref 的具名实例、事件处理器、主题、滚动条、树组件和内容类型；同时补齐已在子路径存在而根入口遗漏的类型。根/子路径消费样例与四组类型检查通过，未使用 `never` 或虚构空实例补计数。
- Vue 专有组件实例类型（无自有 expose、只含 Vue 组件实例成员）、Dropdown 的 Vue VNode/Slots 遍历中间类型、委托上游的 MarkdownRenderSlots 不制造 React 等价物；对应 React 公共属性、内容及回调以实际实现为准。该符号清单用于发现遗漏，不是完成率。
- 公开组件入口的 72 个直接静态属性核对发现 Drawer.open、Avatar.Group、Button.Group 遗漏；均已补齐实现与类型，复查无缺项。Group 别名 SSR 身份和行为测试通过；Drawer 命令式创建、更新、确认/取消/立即关闭、清理及 ConfigProvider 配置的生产浏览器用例通过。
- 最新 React 单元测试 343/343 通过（.local/react-own-api-full-unit.log）；103 个浏览器页面与 214 页生产文档重新构建通过（.local/react-own-api-browser-build.log / .local/react-own-api-docs-build.log）。这不替代最新产物的全量浏览器验收。
- Vue 完整 Chrome 覆盖 709 个文件，4732 条通过、无 pending，唯一失败是启动期间依赖优化导致 support/component.ts 加载失败（.local/react-official-vue-full-component.log）。首个 on-demand-style 文件复跑卡在 tests are loading，未进入断言；支持模块 HTTP 200，浏览器状态与资源诊断保存在 .local/react-vue-boot-stall-*.log，已结束卡住的复跑。未将这轮记录为无失败。
- 再次下载官方 npm tarball 并逐字节验证 markstream-react / virtua，所有发布文件仍与官方一致（.local/react-official-integrity-rechecked.log）。
- 最新 Core/React tarball 的独立消费项目 D:/Temp/sd-react-official-consumer-1794199966377 冻结安装、根/子路径 SSR 身份及 SD 节点、TNB 类型、全量样式 Vite 生产构建均通过（.local/react-own-api-consumer-*.log）；未在该消费项目另跑浏览器。最新全量 React 148 个正式 spec 正在执行（.local/react-official-current-full-production.log）。

### 最终验收中的补充修复与产物隔离

- ConfigProvider 局部主题容器遗漏原生属性转发，旧产物 SSR 已复现丢失 className/style/id/data/aria。现在将 33 项组件配置与容器属性分离，完整转发容器原生属性和事件，且不将容器属性继承给内层 Provider；配置键清单由类型约束检查完整性。回归 SSR 2/2、包含主题切换与事件的生产重点用例 3/3 通过（.local/react-config-attrs-before.log / .local/react-config-attrs-after.log / .local/react-config-attrs-focused-browser.log）。
- 174 个 SD 自有组件导出的公开 ref 属性与方法复查无遗漏，72 个入口直接静态属性无遗漏；ConfigProvider 原生属性类型、Menu 原生 DOM ref 与扩展实例 ref 均通过类型消费检查（.local/react-final-public-fields.log / .local/react-final-static-api.log）。不统计上游 SDK 的缺项。
- 一次并行验证中，文档构建重写 Core 图标产物时，Tag 单元测试读到缺少默认导出的中间文件；这轮 342 通过、1 个文件加载失败，记录保留（.local/react-config-attrs-full-unit.log）。停止并行构建后，最新 React 单元测试完整 344/344 通过（.local/react-config-attrs-full-unit-certified.log）。该结果不表示并行重写产物的问题已被产品代码修复。
- 上一轮 React 148 spec / 1425 项为 1412 通过、5 失败、8 跳过。5 项均为 Tree、TreeSelect、Typography、Upload、VoiceGlow 文档页面 404：验证期间重建了正在服务的文档目录；原记录保留（.local/react-official-current-full-production.log）。没有将其记作全量通过。
- 214 页文档重新构建完成后已复制至独立不可变快照 `.local/react-own-docs-certified-1794201322240`，5195 服务该快照；浏览器 103 页生产产物在所有构建结束后生成。最终正式 148 spec 使用固定产物执行，不再与构建并行（.local/react-final-full-production.log）。
- 最新完整根类型检查、React 四组类型检查、格式检查和 lint 通过；lint 保留 8 条警告，无错误。最新 tarball 的独立消费项目 D:/Temp/sd-react-official-consumer-1794201445823 冻结安装、SSR（包含 ConfigProvider 属性转发与 Group/Drawer 入口）、TNB 类型及 Vite 生产打包通过（.local/react-final-consumer-*.log）。消费项目未另跑浏览器。

- Vue 公共入口的 100 个组件组均已有 React 源码、对应导出、子路径、样式与文档；入口清单检查无缺项。这是存在性检查，不代表全部行为验收通过（.local/react-current-inventory.log）。
- MarkdownRender 已提供根入口、默认/具名子路径入口和按需/全量样式，补充真实文档示例与公共入口 SSR 测试。SD 图片段落适配避免把 Image 的块元素放入原生 p；覆盖独立图片、文中图片和链接内图片，不修改官方 SDK。
- 当前 React 单元测试 342/342、四组类型检查通过（.local/react-current-image-all-tests.log / .local/react-current-image-types.log）；文档 Vue/React 类型检查通过（.local/react-current-docs-types.log）。
- 发布包检查包含 Markdown 公共声明/脚本和官方样式导入，不含 SDK 副本、私有入口或 SDK 改写脚本（.local/react-current-pack-final.log）。
- 文档生产构建 214 页通过；Markdown 生产文档 Chrome 5/5 通过，覆盖 hydration、SD 节点点击、图片加载、主题、流式/ref、自定义节点和 Vue 对应页面跳转（.local/react-current-docs-image-build.log / .local/react-current-docs-final-browser.log）。早期 hydration 失败和开发服务器模块加载超时保留为历史记录，生产通过不证明开发服务器超时已修复。
- 全量组件浏览器验收尚未重新完成，目标仍未标记完成。

### 官方依赖下的完整回归与修复

- 首轮完整生产 Chrome：148 个 spec / 1423 项，1414 通过、9 失败、无跳过（.local/react-official-full-production.log）。没有将该轮计为全量通过。
- 修复 BasicCrudTable 根节点缺少 className/style：旧产物 SSR 复现失败，新产物 SSR 2/2 与源码浏览器 8/8 通过，文档同步。外部消费项目使用本次 Core/React tarball，冻结安装、TNB 类型、SSR 与全量样式生产打包通过；本地 Core tarball 覆盖用于安装尚未发布的工作区版本，不修改第三方依赖（.local/react-official-consumer-*.log）。
- Markdown 的 5 项高度失败来自 SD 默认图片段落适配被误判为调用方自定义段落。默认适配身份恢复后，静态高度 1/1、字体探针 7/7 通过（.local/react-official-delta-source-final.log）。
- ReferenceNode 的两项属性/键盘断言依赖已撤销 SDK 补丁，已移除相关用例及夹具分支；不重新实现第三方节点行为。SD 根属性、原生事件、取消及卸载等 22 项通过。
- Table 虚拟化报错已在只有官方 Virtua、React 和原生 div 的最小页面复现，不含 SD 组件或样式（.local/react-official-virtua-native-diagnostic.log；源码归档于 .local/virtua-native-repro）。只在虚拟化 Table 用例排除这条原生 ResizeObserver 警告，其余异常仍失败；保留所有滚动定位、展开、空态与表头功能断言，4/4 通过（.local/react-official-table-third-party-boundary.log）。未保留未解决问题的 Table 观察器实验修改，也没有恢复 Virtua 补丁。
- 当前声明审计可解析 174 个 SD 组件导出项，未发现同名 ref 方法缺失；107 个 Props 名称中的两个缺失是第三方 MarkstreamVirtual 类型，不纳入 SD 对齐。该检查只核对名称/字段，不能代替签名与运行时验收（.local/react-official-public-audit-current.log）。
- 仓库总类型检查、共享测试 1684/1684、React 单元 342/342、Vue 包导出/类型测试 76/76、Vue Node/SSR 测试 12/12、框架路由测试 2/2 通过。Lint 无 error，仍有 warning。452 个本次迁移已改动文件已格式化；47 个历史诊断 JSON 移至 .local/react-diagnostics 保留，根格式检查通过。
- 清理无调用且仅服务已撤销第三方补丁测试的 serve-markdown-worker-test.ts 与 verify-virtua-resize.ts，以及回滚遗留的未使用导入。
- 开发文档最新 React 交互 4/4 通过，但切回 Vue 的内容检查复现 $RefreshSig$ 错误。安装的 plugin-vue 将全局 config.oxc 直接传给 transformWithOxc，绕过 React 文件过滤；与上游 [vite-plugin-vue #798](https://github.com/vitejs/vite-plugin-vue/issues/798) 的开发模式缺陷一致。exclude 尝试未解决，已撤销，不补丁第三方插件。此项不计入 SD 自有组件的 1:1 缺口，保留为开发工具限制。首屏编译约 50 秒，开发测试使用 120 秒加载超时，生产验收保持原配置（.local/react-official-dev-framework-isolation.log）。
- 修复后完整 React 生产回归和 Vue 完整组件回归仍待完成，目标保持进行中。
- 当前源码重新完成 Vue 全量构建（包含 102 个样式入口及 76 项包验证）、214 页文档构建、103 个 React 浏览器夹具构建；Markdown/BasicCrudTable 定向编译产物测试 35/35 通过（.local/react-official-vue-full-build.log / .local/react-official-docs-certification-build.log / .local/react-official-final-browser-build.log / .local/react-official-post-fix-markdown-unit.log）。
- Vue 全量 Chrome 已按 709 个 spec 启动，retries=0，日志 .local/react-official-vue-full-component.log。启动阶段的 Vite 优化重载造成一次 support/component.ts 动态加载失败，后续 spec 正常继续；原始失败保留，未计为全量通过。运行结束前不修改其配置或重启测试。

### 插槽映射核对与零值修复

- 从当前 Vue/React 声明核对 174 个 SD 组件导出项的 407 个具名/默认插槽。名称启发式留下的 6 组共 13 项已人工读源码确认：Calendar 的 title.view/event.all-day 对应 renderViewTitle[viewId]/renderAllDayEvent；RangePicker.panelRender 对应 renderPanel；InputSearch.button-default 对应 buttonText；Link.tooltip 对应 tooltipContent；Switch.checked/unchecked 对应 checkedText/uncheckedText；Upload.upload-item 对应 renderItem(file,index)。这些映射和相关源文件记录于 .local/react-sd-slots-reviewed.json；名称检查不等于行为签名完全等价。
- 核对时发现 Switch 对 ReactNode 数字 0 使用真值判断，导致内容落在按钮根部而不进入文字槽。新增 SSR 测试在旧产物复现，修复后验证 0/0n、两种开关状态及空字符串；Switch 与 Input 复用 Input 原有的内容判定，Input 行为不变。相关 SSR 7/7、React 四组类型检查、定向 lint 通过（.local/react-switch-zero-before.log / .local/react-switch-zero-input-tests.log / .local/react-switch-zero-types.log）。
- 已同步 Switch 文档和浏览器零值切换断言；该新增断言等待当前 Vue 全量浏览器运行结束后执行，不计为已通过。

## 全局验收

- [x] ESM React 包、类型、子路径与样式入口、构建及独立 tarball 消费检查
- [x] 共享规则与浏览器驱动归入 web-core；Vue 和 React 保留框架适配与视图
- [x] React 全量文档和真实可交互示例
- [x] 菜单顶部 Vue / React 切换，保留对应文档位置
- [x] 共用导航、元数据、样式与可复用文档设施
- [x] README.md、QUICK-START.md、ARCHITECTURE.md 同步
- [x] React 完整组件与文档 E2E 148 spec / 1426 项通过，记录命令和结果
- [ ] 原计划的 Vue/React 多轮完整运行均无失败：Vue 全局 support 首次加载异常未修复，完整运行和隔离验证分别记录；不将其写作全绿。此项作为测试基础设施限制保留，不计作 React 自有组件缺失

## 逐目录核对

| 目录 | 已有 core 目录 | React 实现 / API / 测试 / 文档验收 |
| --- | --- | --- |
| affix | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| alert | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| anchor | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| auto-complete | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| avatar | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| back-top | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| badge | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| basic-crud-table | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| bloom-menu | 共享属性、派生规则、定位、动画参数与焦点代次 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| border-beam | 共享派生规则、动态 CSS、脉冲与 flow 生命周期 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| breadcrumb | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| button | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| calendar | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| card | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| carousel | core/carousel 切换、计时器、动画状态与指示器 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| cascader | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| checkbox | 复用单项/组 Foundation 与选项归一化 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| clamp | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| collapse | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| color-picker | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| comment | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| config-provider | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| copy | 复用复制 Foundation、异步失效与反馈计时 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| cropper | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| date-picker | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| descriptions | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| divider | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| drawer | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| dropdown | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| ellipsis | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| empty | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| file-previewer | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| form | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| grid | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| icon | 共享 287 个 SVG 图形数据、样式规则及生成器 | 已有适配与文档，待完整 API 与全量测试验收 |
| icon-component | 共享 Icon 样式与按 document 缓存的脚本加载器 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| image | 共享图片状态、预览动作、拖拽、分组和弹层驱动 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| input | 复用 text-input、input-password、input-search | 已实现；接口与文档已核对；纳入通过的全量回归 |
| input-mask | 复用掩码引擎、预设与输入 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| input-number | 复用数值 data/foundation 与十进制运算 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| input-tag | 复用输入标签 Foundation、数据映射、WrapClamp 与表单端口 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| json-form | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| kv-list | 共享模型同步、字段规则、类型、常量与排序驱动 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| layout | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| link | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| liquid-glass-logo | 共享 WebGL、宽度测量、主题回退及连接/释放控制器 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| list | core/list 与 legacy pagination，组合共享虚拟列表 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| locale | 有，需核对规则覆盖 | 已有适配，待完整 API 与全量测试验收 |
| markdown-render | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| mention | core/mention 搜索替换、core/select 过滤与导航 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| menu | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| message | 复用 notice 服务、队列与计时 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| modal | core/dialog Foundation、确认/遮罩/拖动/布局、命令式注册表 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| model-selector | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| notification | 复用 notice 服务、队列与计时 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| number-flow | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| page-header | 视图组件，复用 core keyboard | 已实现；接口与文档已核对；纳入通过的全量回归 |
| pagination | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| panel-group | 共享面板控制器、拖拽/键盘、尺寸、重排、过渡与样式 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| popconfirm | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| popover | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| progress | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| qr-code | core/qr-code 编码、竞态与卸载失效；共享主题判定 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| radio | 复用单项/组 Foundation 与选项归一化 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| rate | 复用评分 Foundation 与只读提示 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| regex-vis | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| result | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| rich-text-editor | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| scrollbar | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| secret | 共享显隐 Foundation，组合 Copy 与 PerformantEllipsis | 已实现；接口与文档已核对；纳入通过的全量回归 |
| select | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| selectable-card | core/selectable-card 类型、选择规则与共享样式 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| sender | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| skeleton | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| skeleton-reveal | 共享几何、生命周期/取消规则及原生动画驱动 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| slider | 复用数值、坐标与拖拽 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| space | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| spin | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| statistic | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| steps | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| switch | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| table | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tabs | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tag | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tag-group | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| textarea | 复用 text-input 与 textarea/size | 已实现；接口与文档已核对；纳入通过的全量回归 |
| theme-provider | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| thinking-orb | 共享 Canvas 引擎、预设、主题及动画生命周期 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| time-picker | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| timeline | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| toolbar | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tooltip | 无同名 Core 目录，按共享实现复用 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tour | 复用原生 driver 配置、实例及 Core 浮层 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| transfer | 复用分栏、勾选、移动、筛选及子项 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tree | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| tree-select | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| trigger | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| typography | 复用编辑、复制计时、展开、格式化与文本测量 Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| upload | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| verification-code | 复用验证码与 Input Foundation | 已实现；接口与文档已核对；纳入通过的全量回归 |
| voice-glow | 共享派生规则、Canvas/音频驱动和麦克风控制器 | 已实现；接口与文档已核对；纳入通过的全量回归 |
| watermark | 有独立 Core 目录 | 已实现；接口与文档已核对；纳入通过的全量回归 |

## 当前验证记录

- Watermark 已接入 React 根/子路径导出、原生 ref、WatermarkFont 类型、基础样式入口和文档。复用 core 画布/灰阶/错位透明度、主题和防篡改驱动；共享 dispose 原先遗留已生成节点，新增定向测试复现后修正为清理自身水印层，避免 StrictMode 重放重复。保留 `watermark-dispose-before.log`、`watermark-dispose-after.log`。
- Watermark 定向共享与 SSR 11/11、React SSR 全套 92/92，core/React 编译、双框架文档类型检查、定向 lint、完整 React 测试页构建及 156 页文档构建通过。Vue 首次最后 spec 停在加载阶段；CDP 确认测试模块已加载而全局 support 导入仍 pending，记录后停止该进程。顺序复验全部 4 个 spec 30/30（`vue-watermark-rerun.log`）；不把重跑成功视为原加载问题根因已修复。
- Watermark 首次 React 全套 180/181；唯一失败为 computed background-size 返回 `200px auto`，测试误期望 `200px`。按浏览器规范化值修正两个尺寸断言，真实画布图片/灰阶/错位 alpha、篡改恢复和文档交互已通过；`react-watermark-e2e.log` 保留。
- Watermark 最终增量验收：React Chrome 当前全套连续两轮 181/181（`react-watermark-acceptance.log`、`react-watermark-acceptance-repeat.log`），Vue Watermark 顺序完整复验 30/30、React SSR 92/92、定向共享/SSR 11/11，类型检查、构建与 diff 检查通过。首次 Vue support 模块加载停滞根因仍未确认；全组件 API 对齐、全仓库 E2E、跨浏览器与发布验收仍未完成。

- TagGroup 已接入 React 根/子路径导出、实例和选项/插槽类型、共享 SCSS 与文档，复用 core 选项归一化、字段映射、数量切分，并组合现有 WrapClamp、Popover、Tag。支持响应式/固定上限、焦点计数器、自定义 item/label/counter、空内容、itemProps 事件和受控可见标签。
- TagGroup 定向共享与 SSR 56/56、React SSR 全套 91/91、Vue TagGroup 完整 3-spec 批次 23/23；React 编译、双框架文档类型检查、定向 lint、完整 React 测试页构建和 155 页文档重建通过。定向回归先复现隐藏 renderItem 提前执行和 itemProps.className 丢失，再修正为弹层挂载后调用并合并类名；保留 `react-tag-group-lazy-before.log`、`react-tag-group-class-before.log`。
- TagGroup 最终增量验收：React Chrome 当前全套连续两轮 177/177（`react-tag-group-e2e.log`、`react-tag-group-repeat-e2e.log`），覆盖响应式缩放/选项更新、键盘计数器弹层、itemProps 关闭回调与类名、字段映射/自定义内容、原生 ref 和文档 hydration；diff 检查通过。全组件 API 对齐、全仓库 E2E、跨浏览器与发布验收仍未完成。

- Progress 已接入 React 根/子路径导出、实例类型、共享 SCSS 和文档，复用 core 线形/环形/步骤几何、渐变、状态与阈值规则；保留 steps 优先、mini 线形的环形视图、原始比例与 bufferColor 当前无视觉作用的 Vue 契约。React useId 隔离渐变引用，text 对应 Vue 插槽，ref 指向原生根 div。
- Progress 定向共享与 SSR 16/16、React SSR 全套 87/87、Vue Progress 完整 4-spec 批次 19/19，React 编译、双框架文档类型检查、定向 lint、完整 React 测试页构建和 154 页文档构建通过。新增隐藏 text 渲染函数回归先复现错误调用，改为仅在文本可见分支执行后通过，失败日志 `react-progress-hidden-before.log` 保留。
- Progress 最终增量验收：React Chrome 当前全套连续两轮 173/173（`react-progress-e2e.log`、`react-progress-repeat-e2e.log`），包含尺寸/渐变/状态图标、mini 与 steps 优先级、隐藏文本不执行和文档 hydration；diff 检查通过。全组件 API 对齐、全仓库 E2E、跨浏览器与发布验收仍未完成。

- Statistic/Countdown 已接入 React 独立/复合导出、实例类型、共享 SCSS 和文档。复用 core 数值初始值/日期格式、倒计时分段/完成去重/暂停恢复规则，数字视图复用 NumberFlow，React 仅连接状态与生命周期。浏览器覆盖占位/格式/初始值、过期恢复、截止时间替换、暂停冻结与卸载清理。
- Statistic 初步验收：定向共享与 SSR 14/14、Vue 完整 4-spec 批次 22/22、React SSR 83/83，React 编译、双框架文档类型检查、定向 lint、完整 React 测试页构建及 153 页文档构建通过。首次全量 SSR 与重建 core 的文档构建重叠，两个 spec 报 createTagFoundation 导出缺失；构建结束后顺序运行全部通过，保留 `react-statistic-ssr.log` 与 `react-statistic-ssr-final.log`。
- Statistic 首轮 React 全套 169/169，第二轮 168/169：已有 WrapClamp 扩宽测试保持 5 项，期望 12 项。新增共享定向测试稳定复现最后一次候选回退的 afterRender 提交期间容器变宽，旧结果却被记录为新尺寸已测量。Foundation 比较测量前后根宽度并排队重测，回归由失败转为通过；保留 `react-statistic-repeat-e2e.log`、`wrap-resize-before.log`、`wrap-resize-after.log`。
- Statistic 与 WrapClamp 修复后的最终增量验收：React Chrome 当前全套连续两轮 169/169（`react-statistic-acceptance.log`、`react-statistic-acceptance-repeat.log`），共享定向与 React SSR 合计 102/102，Vue Clamp 全部 4 个 spec 25/25，Vue Statistic 全部 4 个 spec 22/22。core/React 编译、双框架文档类型检查、定向 lint、diff 检查、完整 React 测试页构建及 153 页文档重建通过。全组件 API 对齐、全仓库 E2E、跨浏览器与发布验收仍未完成。

- Tabs/TabPane 已接入 React 独立/复合导出、实例类型、共享 SCSS 与文档，复用 core 切换、键盘、面板挂载、溢出及指示条规则。注册 ID 泛型默认 number 保持 Vue 兼容，React 使用字符串 ID；支持数字/字符串 key、包装/嵌套注册、受控事件顺序、增删、六种类型/四种位置、RTL、缓存/懒加载/销毁和 fullHeight Scrollbar。
- Tabs 初始定向 9/9，Vue 70/70、React 完整套件连续两轮 164/164 后继续核对缓存边界：Vue 对照用例确认替换 Scrollbar 包装会重建内容缓存，React 同场景失败（仍显示旧值 0，期望新值 1）。缓存移入实际 PaneContent 实例后，该用例由失败转为 1/1；十项正式断言定向运行 10/10，Vue 完整 8-spec 批次 71/71。临时诊断 JS spec 已删除，失败日志 `react-tabs-cache-before.log` 保留。
- Tabs 最终增量验收：缓存修复后的 React Chrome 当前全套连续两轮均为 165/165（`react-tabs-acceptance.log`、`react-tabs-acceptance-repeat.log`），React SSR 全套 80/80、定向共享与 SSR 13/13、Vue Tabs 8 个 spec 共 71/71。core/React 编译、Vue 源码类型检查、双框架文档类型检查、定向 lint、diff 检查、完整 React 测试页构建及 152 页文档构建通过。全组件 API 对齐、全仓库 E2E、跨浏览器与发布验收仍未完成。

- Anchor 最终增量验收：React Chrome 完整套件连续两轮各 154/154（`react-anchor-final-e2e.log`、`react-anchor-repeat-e2e.log`），Vue Anchor 完整 6-spec 批次 37/37，React SSR 全套 77/77，共享滚动与 Anchor SSR 定向测试 19/19。React 编译、双框架文档类型检查、定向 lint、diff 检查、React 全样式构建及 151 页文档构建通过。全组件 API、完整仓库 E2E、跨浏览器与发布打包仍待验收。

- Anchor/AnchorLink 已接入 React 默认/命名/复合导出、共享样式和文档，复用 core 注册、定位、hash、事件顺序及取消逻辑。支持嵌套 sublist、动态 href、水平/无轴线、Affix 组合及原生属性/ref。定向浏览器首轮 4/5：容器切换夹具命中既有全局章节回退规则，按 Vue 对应用例先滚动旧容器后，正式五项断言 5/5；临时 JS spec 已删除。完整套件首轮 153/154，文档章节受 Starlight 的 1rem 块间距影响，实际定位 216px，原测试写死 200px；改为目标章节与容器顶部几何对齐断言，未修改产品滚动规则。

- BackTop 最终增量验收：React Chrome 完整套件连续两轮各 148/148（`react-back-top-acceptance.log`、`react-back-top-acceptance-repeat.log`），含共享过渡相关 Trigger/Tooltip/Popover 回归；Vue BackTop 完整 3-spec 批次 16/16，React SSR 全套 75/75，共享滚动与 BackTop SSR 定向测试 18/18。React 编译、双框架文档类型检查、定向 lint、diff 检查、React 全样式构建及 150 页文档构建通过。全组件 API、完整仓库 E2E、跨浏览器与发布打包仍待验收。

- BackTop 已接入 React 公开入口、子路径、共享 SCSS、默认本地化按钮、自定义内容和文档。复用 core 阈值、容器绑定、补间/取消及减少动态效果逻辑；Trigger 的显隐 hook 提取为 React `_shared/use-transition-presence`，旧源码和无引用生成文件已删除。
- BackTop 测试过程：首轮 145/147，Cypress 合成 Enter 未触发原生按钮激活，简化 matchMedia mock 缺少 NumberFlow 使用的监听接口；改为 CDP 原生 Enter 与完整 MediaQueryList 后为 147/148。剩余阈值用例把动画返回后立刻再次滚动混在一起，整数 scrollTop=0 不能证明补间已经完成；该用例使用 duration=0 隔离键盘/阈值行为，默认动画保留文档与动画中卸载覆盖。正式四项断言的临时 JS 定向运行 4/4，临时文件已删除；未据此声称修复 BackTop 产品缺陷。

- Affix 已接入 React 公开/子路径导出、共享 SCSS、ref.updatePosition 和交互文档。复用 core 定位与监听控制器，覆盖顶/底偏移、内容/容器尺寸变化、外层滚动、目标切换及清理。首轮 React 142/143，实际测得 innerHeight=660、clientHeight=645，底部位置偏移 15px；共享层改用不含横向滚动条的视口高度，两端增加几何回归。临时诊断 JS spec 已删除，正式断言保留。
- Affix 增量验收：修正后 React Chrome 完整套件连续两轮各 143/143（`react-affix-final-e2e.log`、`react-affix-repeat-e2e.log`），Vue Affix 完整 5-spec 批次 19/19，共享滚动与 Affix SSR 定向测试 18/18，React SSR 全套 74/74。Core/React 编译、双框架文档类型检查、定向 lint、diff 检查、React 全样式构建与 149 页文档构建通过；完整仓库 E2E、跨浏览器、发布打包与全组件 API 最终审计仍未完成。

- Menu 最终增量验收：当前代码与正式断言下，React Chrome 完整套件连续两轮各 139/139（`react-menu-acceptance-e2e.log`、`react-menu-acceptance-repeat-e2e.log`）；Vue Menu 完整 6-spec 批次 50/50，共享 Menu 12/12 与 React SSR 73/73，Core/React 编译、双框架文档类型检查、定向 lint 和 diff 检查通过。React 全样式 Vite 构建及最新 148 页文档构建通过。完整仓库 E2E、跨浏览器、发布打包与全组件 API 最终审计仍未完成。

- Menu/MenuItem/MenuItemGroup/SubMenu 已接入 React 公开入口、复合导出、SCSS 和文档。共享选择/展开、注册、溢出、响应式及键盘规则；选中滚动配置提取至 core，Vue 同步使用。支持受控拒绝写回、四种模式、分组缩进、Sider 主题/窄轨、弹出父级关闭、横向溢出恢复、滚动及自定义标题/图标。修复 StrictMode 重挂载时初始自动展开被同步覆盖，并限制菜单键盘导航处理自身 DOM 内的事件，避免 Portal 冒泡移走焦点。
- Menu 焦点可见性：定向复现了宽屏水平菜单 Home 键仍停留在第二项的问题。隐藏的溢出镜像仍有 offsetParent，原筛选未排除 visibility:hidden；已把可见焦点列表提取到 core，两端共用，并增加 Vue 隐藏溢出项及 React Home/End 回归。定向用例修复后 1/1，通过后删除临时 JS spec，合入正式套件。
- 焦点修复后 React 首轮 139/139，复验 138/139：既有 WrapClamp 测试捕获 6 项中间候选值后断言变宽项数失败。`clamped=true` 在测量候选阶段就可发布，不能作为测量结束信号；正式断言改为先验证两行几何与 5 项稳定布局，再检查宽度变为 460px、12 项可见及替换列表为 2 项。定向连续 10/10 通过，未修改 WrapClamp 实现，也未将此当作已确认的产品计算缺陷；临时 JS spec 已删除。
- Menu 首轮 React 134/137：修复自动展开覆盖，并纠正横向选中项和实际滚动容器断言；新增模式切换后为 137/138，既有嵌套 Popover 点击因 Cypress 自动滚动/定位移动而超时。将触发器居中、可见浮层点击保留滚动位置并断言 scrollY 不变后，连续两轮 138/138；保留原超时记录，不能据此认定根因完全确诊。进一步补测复现首次自动展开后滚动丢失，已拆分挂载延迟滚动与选中变化滚动，定向用例从失败转为 1/1，通过后并入正式套件。
- 单独新增第二个 React `.cy.ts` 时，Cypress 默认 webpack/ts-loader 与当前 TNB 报 `Unexpected multiple source map outputs`，未执行测试。使用临时 JS spec 定向复现滚动行为后删除该文件，把用例并入已有正式 TypeScript spec；未更换 TNB。后续拆分 React spec 时仍需处理此工具兼容问题。

- Menu 内部收集适配：新增 React `useMenuCollector`，复用 core 注册/上报规则和显式变更通知；共享层修复挂载前 popup 上报造成重复分支，以及动态新增子菜单替换数组后祖先引用未同步的问题。新增共享与 Vue/React 浏览器回归，覆盖 StrictMode、增删/改 key、弹出菜单和嵌套根隔离。React Menu 公开视图/API/样式入口与文档仍未实现，不能计为组件完成。
- Menu 收集器验收：修复前 React 127/129（新增两项暴露重复注册），新增共享复现测试也失败；修复后共享 12/12、React SSR 70/70、React Chrome 全套 130/130、Vue Menu 完整 6-spec 批次 49/49 通过，Core/React 编译、Vue 类型检查和定向 lint 通过。本轮未重建文档、运行完整仓库 E2E 或跨浏览器测试；既有文档浏览器交互包含在 React 套件内。

- React 包已提供 Divider、Comment、Space、Switch、Button/ButtonGroup、Empty、Spin、Tag、Avatar/AvatarGroup 和基础 ConfigProvider/ThemeProvider；已实现项尚未完成全量 API 与样式验收。
- NumberFlow / NumberFlowGroup 和 Badge 已接入共享格式化、动画状态机、数字轨道、分组同步与计数规则，并提供真实交互文档。
- Core / React 编译通过；React 服务端渲染测试 26 项通过。双框架文档类型检查通过，React 包类型与渲染测试已接入仓库级检查命令。
- 双框架文档构建 125 页通过。
- Chrome 浏览器定向测试 22 项通过，包含 NumberFlow 分组、连续更新计时器取消、Badge 状态与数字并存，以及对应文档 hydration。运行中曾有一次 Switch 元素脱离 DOM 失败，当时源码格式化触发了 Vite 热更新；停止修改源码并重新查询点击后的元素后本轮通过，未将其判定为组件缺陷修复。
- 使用缓存 Cypress 16.2.1，项目 16.1.1 下载校验失败，仍需同版本复验。
- Trigger 的偏移、翻转、边界避让和可用尺寸计算已抽取到 core，Vue 改用同一实现；Core/Vue/React 类型检查和 2 项 middleware 测试通过。React 内部定位适配的浏览器测试覆盖锚点尺寸变化与视口边界翻转，局部浏览器套件当前 24/24。
- Vue Trigger/Tooltip 组合回归前 10 个 spec 共 84 项通过；最后的 wrapper-foundation spec 停留在模块加载状态。浏览器诊断确认测试未开始后，独立运行该 spec 得到 4/4 通过，原卡住进程已停止并保留日志；此状态不计为原组合回归完整通过。
- React Trigger 已提供点击/悬浮/聚焦/右键触发、受控写回、嵌套 Portal、指针定位、外部/Escape/滚动关闭与共享 CSS 过渡。局部浏览器测试 30/30、渲染测试 28/28、双框架文档类型检查通过，文档构建 126 页。动画与文档交互已有真实浏览器覆盖。
- Scrollbar 与 Tooltip 已接入共享引擎，Scrollbar 保留 React 内容 viewport，Tooltip 溢出后允许滚动交互，Button 已补 Tooltip 配置与自定义内容。Core Scrollbar 13/13、Vue Scrollbar 17/17、React 渲染 30/30、局部浏览器 34/34 通过；双框架文档类型检查通过，文档已扩展至 128 页。
- RichLineClamp、Ellipsis 和 PerformantEllipsis 已实现共享测量、富文本截断、受控展开、延迟激活和焦点转交，提供 2 个 React 文档页面。激活期间首次点击丢失已增加 core/Vue/React 回归并修复；富文本测量完成前不再发出初始 clamp 通知。Core Ellipsis 23/23、Vue 延迟点击与键盘 4/4、React SSR 33/33、局部浏览器 42/42 通过；文档类型检查通过，构建 130 页。
- Vue Ellipsis 批量运行在第二个 spec 的模块加载阶段停滞，已停止该进程；专项回归通过不代表原批量运行完整通过。
- 新增 Ellipsis / RichLineClamp 文档 hydration、键盘展开与富文本展开收起检查后，React 局部浏览器套件 43/43 通过。
- Button 与 Tag 已接入 Ellipsis，包含原生按钮焦点转交、显式 Tooltip 优先级、Tag 自定义提示与 nowrap 兼容。Link 已提供状态、禁用/加载、图标提示、默认省略、原生属性和 ref，并新增文档。共享文字读取排除测量副本，修复重渲染后中文间距丢失；Vue Button 专项 22/22、Core 按压与 Tag 48/48、React SSR 36/36 通过。双框架文档类型检查通过，文档构建 131 页。
- 本轮 React 浏览器套件 48/48 通过，覆盖新增文本控件与 Link 文档交互。曾修正测试中的重复文案选择、属性断言后的错误 subject，以及向 body 中心投递事件导致的可见性失败；中文间距失败则通过共享代码与双框架回归修复。
- LineClamp 已提供原生行数限制、首部/中部/尾部截断、最大高度、受控与 ref 展开、附加内容和完整原文可访问性。InlineClamp 已提供 split 前后缀保留、字素/词边界和尺寸变化重算；其终止式 Foundation 在 React effect 重放时重建。两者与 RichLineClamp 共用 React 状态单元、附加内容及多行生命周期适配。Core Clamp 13/13、React SSR 38/38、局部浏览器 52/52 通过，双框架文档类型检查通过，文档构建 131 页。
- 更新 Clamp 文档后再次运行 React 浏览器套件，52/52 通过，包含文档纯文本展开收起与文件前后缀保留。
- WrapClamp 已复用 core 整项测量与可见数量算法，提供泛型 items/renderItem、itemKey、隐藏项 render props、受控与 ref 展开、字体/尺寸监听和动态列表更新。React SSR 40/40、初轮浏览器 55/55、共享 Clamp 13/13 通过；双框架文档类型检查与 131 页构建通过。Clamp 四个组件均有 React 实现，尚未完成全量 API、样式和跨浏览器验收。
- WrapClamp 列表重排身份与文档展开收起检查加入后，React 浏览器套件再次通过 56/56。
- Popover 已实现共享可见性规则、标题/内容、滚动开关与配置、嵌套弹层和 Escape 关闭。Tooltip 共用其 React 可见性适配；AvatarGroup 已复用分组规则与 Popover，提供组级尺寸/形状/字体缩放、maxCount、maxStyle、层级和 RTL 溢出间距。Space 与 AvatarGroup 共用保留 key 的 Fragment 展开。共享 Avatar/Popup 测试 35/35、React SSR 42/42 通过。
- Popover / AvatarGroup 文档与交互加入后，React 浏览器套件 63/63 通过；双框架文档类型检查通过，文档构建 132 页。字体缩放用例最初将 CSS 的居中 transform 误判为缩放，已改为验证内联缩放的添加和清除。
- Popconfirm 已复用共享 confirmation Foundation，提供确认/取消拦截、Promise 与 done 回调、加载状态、重复点击抑制、受控可见性、语言及状态图标，关闭和卸载使迟到结果失效。共享确认/弹层测试 11/11、React SSR 43/43 通过。
- Popconfirm 浏览器回归覆盖异步成功/拒绝、取消/卸载后的迟到结果、同步拦截、回调式确认及受控英文内容；连同文档 hydration，React 套件 70/70 通过。双框架文档类型检查通过，构建 133 页。初次失败的英文确认断言已按共享词条改为 Ok，嵌套 Popover 测试为避免布局变化后遮挡父触发器显式设置子弹层向右定位。
- Trigger/Tooltip 的多子节点及不转发 ref 的自定义触发组件仍待对齐，尚不能判定公开弹层 API 全部对齐。
- 上述结果不代表完整组件或文档 E2E 通过。
- Grid/Row/Col/GridItem 已实现 React 适配、复合导出和文档。公共类型、Row 间距、CSS Grid 样式、折叠可见性与后缀占位计算提取到 core，Vue utils 保留重导出；删除 Vue 中重复的间距/样式计算。React 的 DOM 顺序与媒体查询订阅复用 core 规则。
- Drawer 已实现 React 适配、ConfigProvider 默认配置、按需样式与文档，复用 core dialog/confirmation/layout、焦点陷阱、滚动锁及弹层栈。Layout 临时侧栏将继续接入此组件。
- Layout/Header/Content/Footer/Sider 已接入 React，包含最近布局注册、SSR 侧栏识别、受控与响应式折叠、零宽触发器、主题检测、窄轨覆盖层及临时 Drawer。外层占位和覆盖层宽度计算提取到 core，删除 Vue 重复实现；SiderContext 保留后续 Menu 适配所需信息。
- Dropdown/Doption/Dgroup/Dsubmenu/DropdownButton 已接入 React 与文档，复用选择、可见性、键盘/焦点及滚动 Foundation。覆盖禁用选项、零值/对象/文本回退、子菜单、可编辑输入、空态与分裂按钮；分裂按钮原生属性落在外层 ButtonGroup。Breadcrumb 将继续复用这组组件。
- Breadcrumb/BreadcrumbItem 已接入 React 与文档，复用 core 路径生成、折叠规则和 Dropdown。BreadcrumbRoute 类型移动到 core，Vue 保留原入口的重导出；支持 Fragment 动态条目、routes/customUrl/itemRender、分隔符、更多标记和动态下拉内容。
- Steps/Step 已接入 React 与文档，复用 core 状态、方向、连接线及键盘规则。Foundation 注册键支持 Vue 数字 UID 与 React 字符串 ID；共享 DOM 序号适配增加最近父容器参数，覆盖嵌套、重排和删除，Grid 默认行为保持不变。
- Timeline/TimelineItem 已接入 React 与文档，复用 core 节点位置、末项、线条及圆点样式规则，ID 泛型兼容两端。React 复用 DOM 序号适配登记普通节点，支持交替/倒序、标签位置、动态 pending、自定义图标及 ConfigProvider.timelineSpinProps 合并。
- Collapse/CollapseItem 已接入 React 与文档，复用 core 展开、销毁、键盘状态机和共享 CSS transition。itemKey 保留数字类型，直接子项字符串 key 提供回退；覆盖受控/手风琴、图标优先级、交互标题、离场后销毁及取消离场保留内容。
- Collapse 验收：React Chrome 全套 127/127、SSR 全套 70/70、共享 Tabs/Collapse 测试 10/10；React 编译、定向 lint、双框架文档类型检查、完整 React 测试页 Vite 构建及 147 页文档构建通过。本次未修改 Vue Collapse 或共享状态机；全仓库 E2E、跨浏览器和全组件 API 验收仍待完成。
- Timeline 验收：React Chrome 全套 123/123、SSR 全套 68/68、Vue Timeline 全部 5 个 spec 33/33、共享 flow 测试 16/16；core/React 编译、定向 lint、双框架文档类型检查、完整 React 测试页 Vite 构建及 146 页文档构建通过。全仓库 E2E、跨浏览器及全组件 API 验收仍待完成。
- Steps 验收：React Chrome 全套最终 119/119、React SSR 66/66、Vue Steps 3-spec 批次 29/29、共享 flow/pager-panel 测试 61/61，core/React 编译、lint、双框架文档类型检查及 145 页构建通过。首次浏览器运行因 Steps SCSS 错误引用不存在的 base.scss 而停止，移除引用后完整 React 测试页经 Vite 构建通过；之后 118/119 的唯一失败是 Cypress 缺失属性断言将点击目标变为 undefined，重新查询元素后最终全套通过。全仓库 E2E、跨浏览器及全组件 API 验收仍待完成。
- Breadcrumb 验收：React Chrome 全套 115/115、React SSR 全套 64/64、Vue Breadcrumb 全部 5 个 spec 25/25、共享 Table/Breadcrumb 测试 36/36；React/core 编译、定向 lint、双框架文档类型检查及 144 页构建通过。完整仓库 E2E、跨浏览器和全组件 API 验收仍未完成。
- Dropdown 验收：React Chrome 全套两轮均为 111/111（第二轮包含分裂按钮属性修正后的断言）、React SSR 全套 62/62、共享 Tag/Dropdown 测试 52/52，React 编译、定向 lint、双框架文档类型检查及 143 页构建通过。本次未修改 Vue Dropdown 和共享 Foundation；尚未完成全组件 API、全仓库 E2E、跨浏览器和发布验收。
- Layout 验收：共享测试 13/13、React SSR 全套 59/59、Vue Layout 全部 6 个 spec 74/74；新增窄轨几何断言后 dynamic-modes 2/2。React Chrome 全套最终 106/106，双框架文档类型检查及 142 页构建通过。首轮 104/106，第二轮 105/106，分别纠正 React 悬停事件模拟和新增主题夹具后的容器数量断言；未将单次重跑当作不稳定问题已修复的证据。完整仓库 E2E、跨浏览器与全组件 API 验收仍待完成。
- Drawer 验收：共享 dialog 测试 11/11、React SSR 全套 57/57、React Chrome 全套 101/101、React 编译和双框架文档类型检查通过；文档构建 141 页。首轮 98/100，两项为测试断言问题（加载按钮退出 loading 后仍存在、Trigger 查询误选隐藏 Drawer），调整断言后全套通过。尚未完成全组件 API 审计、仓库全量 E2E 或跨浏览器验收。
- Grid 验收：定向共享/SSR 测试 55/55、React SSR 全套 56/56、Vue Grid 完整 8-spec 批次 44/44、Cypress 16.1.1 React Chrome 套件 97/97 通过，覆盖动态 div 模式、零 flex/零 span、响应式间距、偏移、删除/重排/重挂载及折叠几何。双框架文档类型检查通过，构建 140 页；完整仓库 E2E、发布和全组件对齐验收仍待完成。
- Descriptions/DescriptionsItem 已实现 React 数据与子项渲染、四种布局、span 补齐、样式/对齐和响应式列数，并提供文档。分组、对齐、断点规则和媒体查询订阅复用 core；React 使用 useSyncExternalStore 处理 SSR 初始快照与订阅生命周期。
- Descriptions 验收：共享分组/对齐测试 10/10、React SSR 54/54、Cypress 16.1.1 Chrome 套件 93/93 通过，覆盖窄屏文档 hydration、断点变化、数字列数切回响应式配置、Fragment 子项及数据渲染函数。双框架文档类型检查通过，构建 139 页。本轮没有修改 Vue 或 core 实现，未重复运行 Vue Descriptions；全量对齐与全仓最终验收仍未完成。
- PageHeader 已实现 React 适配、样式入口与文档，复用 core `onActivate`，支持返回原生事件、键盘操作、本地化名称和各内容区域。它仅含视图与共享键盘适配，没有新增无业务规则的 Foundation 包装层。
- PageHeader 验收：React SSR 52/52、Cypress package/binary 均为 16.1.1 的 Chrome 套件 89/89、双框架文档类型检查通过，文档构建 138 页。Vue PageHeader 和共享键盘实现未修改，本轮未重复运行其组件测试；全仓最终验收仍未完成。
- Result 已补齐 React 状态图标、403/404/500 插图、自定义内容区域和文档。静态 SVG 数据与非法状态回退共享至 core，Vue 三个插图包装器删除重复图形模板并接入同一数据；两端通过实例 ID 隔离 SVG 内部引用。
- Result 验收：共享/React 渲染测试 52/52、Vue Result 完整组件批次 20/20、React Chrome 套件 86/86、双框架文档类型检查通过，文档构建 137 页。仍不是全仓/全组件最终验收。
- Skeleton/SkeletonLine/SkeletonShape 已补齐 React 适配、独立/复合导出和文档；行宽、高度、间距计算提取为 core `skeleton/foundation`，Vue 行组件同步复用，删除原重复计算逻辑。加载分支、aria-busy、动画、动态行数和零间距均有浏览器覆盖。
- Skeleton 增量验收：共享/React 渲染测试 49/49、React Chrome 套件 83/83、双框架文档类型检查通过，文档构建 136 页。Vue 首次组合运行 demo/index 共 10 项通过，line-spacing 停在加载阶段；独立运行 line-spacing 3/3 通过，独立通过不视为原批次完整通过或加载问题已修复。
- Skeleton 完整批次再次运行的日志为 `vue-skeleton-rerun.log`；同样未完成最后一个 spec。通过浏览器 CDP 检查，spec 模块可完成导入，但全局 support 模块的 Promise 未完成；依赖链收窄到 thinking-orb/engine/registry.js，其 HTTP 请求返回 200，子模块单独导入成功，但 registry 导入仍 pending。已停止该诊断进程；此证据尚不能证明 ThinkingOrb 代码存在缺陷。
- Cypress 16.1.1 通过分段下载取得完整 270778207 字节 ZIP，SHA512 与官方 CDN 响应一致（7357d99d…27c9f0377），已安装到独立版本缓存，CLI version 命令确认 package/binary 均为 16.1.1。此前直接整包下载停滞，失败分段已补齐后才合并校验。
- 同版本复验结果：React 当前套件 86/86 通过（`react-e2e-16.1.1.log`）；Vue Card/Skeleton/Result 的 10 个 spec 连续两轮各 82/82 通过（`vue-card-skeleton-result-16.1.1.log`、`vue-card-skeleton-result-16.1.1-repeat.log`），包含此前未完成的 Card 按需样式和 Skeleton 间距 spec。原先的加载停滞证据保留；两次成功不能证明其根因已确诊，也不代表全部 Vue/React 组件和文档最终验收。
- Card/CardMeta/CardGrid 已实现 React 适配、独立及 Card.Meta/Card.Grid 导出、共享样式与文档；尺寸归一化、滚动模式、Meta/Grid 注册计数抽取到 core，Vue 同步接入。涵盖动态操作区、嵌套详情、加载替换及 fullHeight 原生/自定义滚动。
- Card 验收：core/React 渲染测试共 49/49、React Chrome 套件 80/80 通过，双框架文档类型检查及 135 页构建通过。Vue Card 前 4 个 spec（demo、dynamic-actions、index、lifecycle）共 48 项通过；on-demand-style 在组合和独立运行中均停在模块加载，浏览器显示 Your tests are loading，未执行断言，已停止对应测试进程并保留日志。因此 Vue Card 完整批次及按需样式验证仍未完成。
- Alert 已接入共享关闭 Foundation、状态图标、SCSS 与离场动画执行器；React 支持标题、操作区、自定义图标/关闭元素、横幅和居中，以及键盘关闭和本地化按钮名称。卸载会取消未完成的动画回调。
- Alert 增量验收：共享交互测试 37/37、React SSR 45/45、当前 React Chrome 浏览器套件 75/75（含 Alert 事件顺序、键盘、卸载和文档 hydration）通过；双框架文档类型检查通过，构建 134 页。仍使用 Cypress 16.2.1 缓存二进制，尚未完成全部组件迁移、全仓 E2E 或跨浏览器验证。

- Form/FormItem 已接入 React 根/子路径导出、Form.Item、公开类型、useFormItem、样式和独立交互文档；复用 core 字段注册、规则、校验世代、提交快照和重置。增加 core/form/model 不可变安全路径写入，React 通过 onModelChange 合并批量回写；Button/Switch 接入字段禁用、尺寸和事件。
- Form 首轮 React 全套 184/185（react-form-e2e.log）。唯一失败是异步测试夹具仅保存回调却未返回等待 Promise；按 Vue 相同夹具模式修正，并保留原失败记录。消息动画使用共享 CSS transition 驱动，结束/卸载清理临时类。
- Form 定向共享测试与 React 全套 SSR 合计 104/104；Vue Form 14 个 spec 共 60/60（vue-form-e2e.log）。157 页文档构建、双框架文档类型检查、core/React 编译、定向 lint、完整测试页构建和 diff 检查通过。全组件对齐与全仓库验收仍未完成。
- Form 最终增量：React Chrome 当前全套连续两轮 186/186（react-form-acceptance.log、react-form-acceptance-repeat.log），包括文档校验/提交/重置和框架切换。之后独立样式编译发现 Form 子路径缺少基础图标/主题样式；先复现缺少 .sd-icon，再补基础入口并验证。全量测试页 CSS SHA256 修复前后均为 398238905E5F156B99B509464126993A1E74FC3B34D5137E20ED8AA14CEEE62A，已有两轮浏览器测试对应的全量 CSS 不变。
- 加入独立样式检查后，共享 Form + React SSR/样式测试共 105/105（react-form-unit-final.log），独立样式检查通过（react-form-style-after.log），测试页重新构建及 diff 检查通过。未宣称全组件迁移、全仓库 E2E、跨浏览器或发布验收完成。

- Input/InputPassword/InputSearch/InputGroup 已接入 React 根/子路径、复合导出、公开 ref 类型、按需样式和交互文档。React useTextInput/useFitWidth 复用 core 的输入时序、grapheme 截断、组合草稿、光标恢复和文字测量；Form 与 ConfigProvider.allowClear 接入。
- Input 首轮 React 188/190（react-input-e2e.log）：清除按钮仅 hover 可见导致键盘操作失败，修复共享样式为 hover 或 focus-within，并同时新增 Vue/React 键盘回归；只读测试被 Cypress type 可操作性检查阻止，改为与 Vue 一致的修改按键事件检查。Vue Input 原 69/69，修正后全部 11 spec 70/70（vue-input-acceptance.log）。
- Password 关闭显隐按钮后原先保留空 suffix；SSR 用例先失败再修正（react-input-ssr-before.log、react-input-ssr-after.log）。独立 Input 样式缺少 Search 的 Button 依赖也先复现再补齐（react-input-style-before.log）；完整测试页 CSS SHA256 前后均为 4E784236C0608C0601EE9E96B0107D1A609A448EDB081F3CC86F64E6447A5B57。
- Input 文档首轮完整 React 190/191（react-input-acceptance.log）；唯一失败是测试误点站内搜索按钮，截图显示 Pagefind 弹窗，改为定位 .sd-input-search-btn。React SSR/独立样式 99/99、相关共享测试 76/76、样式合同 9/9；158 页文档构建、文档类型检查、React/core 编译及完整测试页构建通过。
- Input 补充验收：Vue Textarea 使用同一个输入样式 mixin，全部 6 spec 26/26（vue-input-textarea-regression.log），含既有键盘清除测试。Input 两轮 191/191 已通过（react-input-final.log、react-input-final-repeat.log），但随后 API 边界复核发现数值 0 的附加内容被真值判断隐藏；新增 SSR 用例先复现再修复（react-input-zero-before.log、react-input-zero-after.log），浏览器用例同时覆盖四种数字附加内容和原生 keyup 的 currentTarget。
- Input 最终版本验收：包含数值 0 与原生 keyup 目标检查的 React Chrome 当前全套连续两轮 191/191（react-input-zero-acceptance.log、react-input-zero-acceptance-repeat.log）。React SSR/独立样式 100/100（react-input-unit-final.log）；共享相关测试 76/76、样式合同 9/9、Vue Input 70/70、受共享样式影响的 Vue Textarea 26/26。最新 158 页文档构建、文档类型检查、完整测试页生产构建、定向 lint 与 diff 检查通过。React Textarea 与其余未完成组件、全仓库 E2E、跨浏览器和发布验收仍待完成。
- Textarea 已接入 React 根/子路径、公开 ref 类型、按需样式和交互文档，支持受控输入、组合输入、字素限制、清除、只读提示、fitWidth 与动态 autoSize。高度限制、镜像样式采样和溢出计算提取到 core，Vue 删除重复计算并保留 utils 重导出；React Input/Textarea 共用只读提示适配。
- Textarea 定向浏览器 3/3（react-textarea-focused.log）；共享 Textarea/TextInput 与 React SSR/独立样式合计 117/117（react-textarea-unit.log）。159 页文档构建、双框架文档类型检查、core/React/Vue 类型检查、测试页生产构建和定向 lint 通过。
- Vue Textarea 首轮日志显示 27/27，但命令返回 1（vue-textarea-acceptance.log），未在日志或退出钩子找到原因。显式记录原生退出码后复验 6 个 spec 全部 27/27、NativeExit=0（vue-textarea-rerun.log）；保留首次异常，不将复验成功视作根因已解决。
- Textarea 最终增量验收：React Chrome 当前完整套件连续两轮各 195/195（react-textarea-acceptance.log、react-textarea-acceptance-repeat.log），包含 Textarea 行数/宽度变化、IME、受控回写、键盘清除与文档切换。graphify update 已执行，仍有既有 104 条 source_file 缺失警告且拓扑未变；diff 检查通过。全组件 API 对齐、全仓库 E2E、跨浏览器及发布验收仍未完成。
- InputNumber 已接入 React 根/子路径、公开类型与 ref、按需样式和交互文档。直接复用 core/input-number data/foundation、十进制字符串运算，组合 Input/Button/Form，覆盖两种按钮模式、动态格式化/边界、stringMode、modelEvent 与长按卸载清理。
- InputNumber 初轮定向浏览器 3/4（react-input-number-focused.log）；唯一失败是键盘清除断言漏算共享 Foundation 对已截断草稿的归一化回写。补充 Vue 相同场景验证事件值为 5、5、undefined，React 按现有契约调整后 4/4（react-input-number-focused-repeat.log），未修改共享数值规则。
- InputNumber Vue 全部 11 spec 75/75（vue-input-number-acceptance.log）；共享数值测试与 React SSR/独立样式合计 118/118（react-input-number-unit.log）。160 页文档构建、文档类型检查、React 编译、完整测试页生产构建和定向 lint 通过。graphify update 已执行，仍有既有 source_file 警告且拓扑未变。
- InputNumber 最终增量验收：React Chrome 当前完整套件连续两轮各 200/200（react-input-number-acceptance.log、react-input-number-acceptance-repeat.log），包含 InputNumber 文档 hydration、高精度步进、模式切换与框架导航。Vue 75/75、共享数值与 React SSR/样式 118/118，最终 diff 检查通过。其余未迁移组件、全量 API 对齐、全仓 E2E、跨浏览器及发布验收仍待完成。
- Checkbox/CheckboxGroup 与 Radio/RadioGroup 已接入 React 根/子路径、复合导出、样式和独立文档。复用 core 单项/组 Foundation 与选项归一化，React useChoiceInput 共用原生 checked/indeterminate 恢复；支持组限额、动态选项、boolean/0 值、自定义内容与 FormItem 事件。
- Choice 定向浏览器初轮 3/5。原生事件诊断记录 Checkbox 点击后 checked=true、indeterminate=true；半选改用原生属性断言，键盘操作从 type 模拟改为 press 真实按键后 5/5（react-choice-focused-real-keys.log）。Radio 拒绝回写的整组恢复、组限额、动态类型/选项和表单校验均通过；未将模拟器差异改写为组件修复。
- Choice SSR 初轮夹具遗漏 FormItem，修正后 3/3。共享选项逻辑与 React SSR/样式初轮 121/123，两个独立样式断言错误地要求不存在的 target 类规则；核对共享 SCSS 后改为校验图标规则，最终 123/123（react-choice-unit-final.log）。Vue Checkbox/Radio 全部 7 spec 65/65（vue-choice-acceptance.log），162 页文档构建、类型检查、测试页生产构建、定向 lint 和 diff 检查通过。
- Choice 最终增量验收：React Chrome 当前完整套件连续两轮各 207/207（react-choice-acceptance.log、react-choice-acceptance-repeat.log）。随后补齐 CheckboxInstance/CheckboxGroupInstance、RadioInstance/RadioGroupInstance 和 RadioGroupChangeHandler 类型导出；编译后的根入口、Checkbox、Radio JavaScript SHA256 均保持不变（react-choice-runtime-before.json），162 页文档重新构建及类型检查通过。全组件迁移、全量 API 对齐、全仓 E2E、跨浏览器和发布验收仍未完成。
- Rate 已接入 React 根/子路径、RateProps/RateInstance、按需样式与交互文档。复用 core/rate Foundation 的半星取整、颜色阈值、分级表情、键盘边界、清除、悬停和动画状态，组合共享只读提示、Tooltip、FormItem 与 ConfigProvider.allowClear；默认图标沿用 Vue 相同路径数据。
- Rate 定向浏览器 4/4（react-rate-focused.log），SSR 与独立样式 9/9（react-rate-ssr.log）；共享评分/进度与 React SSR/样式合计 126/126（react-rate-unit.log）。Vue Rate 全部 4 spec 31/31（vue-rate-acceptance.log），163 页文档构建、文档类型检查、React 编译、测试页生产构建、定向 lint 和 diff 检查通过。graphify update 已执行，仍有既有 source_file 警告且拓扑未变。
- Rate 最终增量验收：React Chrome 当前完整套件连续两轮各 212/212（react-rate-acceptance.log、react-rate-acceptance-repeat.log），包含 Rate 文档的半星评分、只读锁定/解锁和框架切换。Vue 31/31、共享评分/进度与 React SSR/样式 126/126；最终 diff 检查通过。其余组件迁移、全量 API 对齐、全仓 E2E、跨浏览器及发布验收仍未完成。
- Slider 已接入 React 根/子路径、公开类型、按需样式和交互文档，复用 core/slider 的数值、范围、坐标、刻度/标记及拖拽 Foundation，组合 InputNumber/Tooltip/FormItem。触摸开始使用非被动原生监听；动态禁用、取消与卸载清理拖拽监听。
- Slider 定向浏览器初轮 4/5（react-slider-focused.log）。诊断确认竖向轨道被 Cypress 自动滚动从 top=1050 移到 top=0，使预采样坐标失效（react-slider-coordinate-diagnostic.log）；先滚动再测量后 5/5（react-slider-focused-repeat.log），未修改运行时。SSR/独立样式 10/10，共享 Slider 与 React SSR/样式合计 127/127（react-slider-unit.log）；164 页文档构建、类型检查、测试页生产构建和定向 lint 通过。
- Vue Slider 首轮完成前三个 spec 后停在 robustness.cy.ts 加载阶段（vue-slider-acceptance.log）。CDP 确认 Your tests are loading，support 与 spec 导入 Promise 均 pending、尚无断言运行（vue-slider-loading-diagnostic.log）；已停止对应测试进程，保留原批次未完成记录。
- Slider 最终增量验收：React Chrome 当前完整套件连续两轮各 218/218（react-slider-acceptance.log、react-slider-acceptance-repeat.log）。React 完成后独立复验 Vue Slider，6 个 spec 全部 46/46、NativeExit=0（vue-slider-rerun.log）；不将这次通过视作先前模块加载停滞的根因已解决。共享 Slider 与 React SSR/样式 127/127，最终 diff 检查通过。其余组件迁移、全量 API 对齐、全仓 E2E、跨浏览器和真机触摸验收仍未完成。

- VerificationCode 已接入 React 根/子路径、公开类型、按需样式和交互文档，复用 core/verification-code Foundation 与 Input。覆盖格式化、粘贴、受控拒绝、动态长度、导航、ref、密码、只读和 FormItem 禁用。定向 Chrome 4/4（react-verification-focused.log），共享 flow 与 React SSR/样式 136/136（react-verification-unit.log）；165 页文档构建、文档类型检查、测试页生产构建及定向 lint 通过。Vue 验证码 5 个 spec 全部 34/34、NativeExit=0（vue-verification-acceptance.log）。
- VerificationCode 最终增量验收：React Chrome 当前完整套件连续两轮各 223/223，退出码均为 0（react-verification-acceptance.log、react-verification-acceptance-repeat.log）。graphify update 已执行，仍为已知 104 个 source_file 缺失警告且拓扑无变化；其余组件迁移、完整 API 对齐、全仓 E2E 与跨浏览器验收仍未完成。

- InputMask 已接入 React 根/子路径、类型与掩码工具导出、按需样式和交互文档。复用 core/input-mask 与 Input，覆盖外部规范化/重置、动态掩码/预设、选区、完成事件、字素占位符、回调拒绝、StrictMode 重放和原生输入模式覆盖。
- InputMask 初轮定向 Chrome 3/4（react-mask-focused.log）：连续日期输入出现字符错序；逐字符与连续输入的选区诊断分别保存在 packages/web-react/mask-cursor-diagnostic.json 与 mask-continuous-diagnostic.json。根因为上一输入的延迟恢复覆盖新选区；共享 Foundation 增加版本检查，并增加可控队列单测及 Vue 快速日期输入回归。修复后第二轮在断言链丢失 DOM 对象处失败（react-mask-focused-repeat.log），拆开断言后最终 4/4（react-mask-focused-final.log）。
- InputMask 共享 Foundation 与 React SSR/样式 135/135（react-mask-unit.log）；Vue 8 个 spec 全部 61/61、NativeExit=0（vue-mask-acceptance.log）；166 页文档构建、文档类型检查、测试页生产构建及定向 lint 通过。graphify update 已执行，保留既有 104 个 source_file 警告。
- InputMask 完整 React 首轮 228/228（react-mask-acceptance.log），第二轮 227/228（react-mask-acceptance-repeat.log）：Anchor 卸载测试把脱离文档后的 scrollTop=0 与卸载前的 3 比较。独立浏览器诊断证实节点移除会原生归零（packages/web-react/anchor-detach-diagnostic.json）；测试改为先确认动画写入、再断言卸载后不再写入，定向 2/2（react-mask-anchor-final.log），未改 Anchor 运行时。失败截图保留为 react-mask-anchor-failure.png，修正后重新执行完整套件。
- InputMask 最终完整 React Chrome 复验 228/228、退出码 0（react-mask-acceptance-final.log）。本增量三轮完整测试分别为 228/228、227/228、228/228，未把中间失败隐藏为连续通过。额外修复浏览器测试中新 InputMask 与既有 Tabs 的类型标注，浏览器测试类型检查通过；TNB transpileModule 证明标注修改前后 JavaScript 完全相同（react-mask-test-type-proof.log），无需重复验证未改变的执行逻辑。其余组件迁移、完整 API 对齐、全仓 E2E 和跨浏览器验收仍未完成。

- Message/Notification 已接入 React 静态 API、类型与子路径、useMessage/useNotification holder、按需样式和两页交互文档。共享 queue 增加可选 changed 通知；React 使用订阅快照、共享计时/层级/CSS 过渡，支持上下文与局部主题、ID 更新/去重、键盘关闭、回调重入、断连恢复和卸载释放。README、QUICK-START、ARCHITECTURE 与 ConfigProvider 文档同步更新。
- 通知定向验证先暴露样式命名空间冲突（react-notice-focused.log），修复为现有 @forward 入口约定。后续修正了测试中的 React 悬停事件、CSS 变量名、断连 DOM 断言以及模拟时钟必须等待退场提交的问题（react-notice-focused-repeat.log、react-notice-focused-third.log、react-notice-focused-fourth.log）；基础 9/9（react-notice-focused-final.log）。
- 复核新增 holder 内层 Provider 场景，修复前去重失败 2 条而非 1 条（react-notice-holder-before.log），改由 holder 读取上下文并支持部分显式覆盖后 9/9（react-notice-holder-after.log）。退场顺序用例排除 Cypress 查询别名重复创建后，证实首条关闭项被移到末尾（react-notice-order-before-repeat.log）；保留旧位置至退场完成后全部 10/10（react-notice-order-after.log），包含 StrictMode effect 重放及无 console.error 检查。
- 通知共享 Foundation 与 React SSR/样式 136/136（react-notice-unit.log）；Vue Message/Notification 共 10 个 spec 全部 87/87、NativeExit=0（vue-notice-acceptance.log）。168 页文档构建、React/文档/浏览器测试类型检查、测试页生产构建和定向 lint 通过。graphify update 已执行，保留既有 104 个 source_file 警告。
- 通知完整 React 首轮 239/240（react-notice-acceptance.log），唯一失败是旧主题测试硬编码全页 3 个浮层容器；新增通知示例合法增加一个主题容器。测试改为按独有主题变量定位并校验唯一性、原地更新、卸载断连及总数减少 1，定向通过（react-notice-theme-focused.log），浏览器测试类型检查通过；未改主题运行时。
- Message/Notification 最终增量验收：修正共享主题测试后，React Chrome 当前完整套件连续两轮各 240/240，退出码均为 0（react-notice-acceptance-final.log、react-notice-acceptance-repeat.log）。保留首轮 239/240 及其原因；Vue 87/87、共享与 SSR/样式 136/136、文档 168 页、类型及生产构建结果保持有效。其余组件迁移、完整 API 对齐、全仓 E2E、跨浏览器验收仍未完成。

### 2026-11-07 Copy / Secret 增量验证

- Copy 复用 core 复制 Foundation，React 布局生命周期重建实例以兼容 StrictMode；成功提示使用继承上下文的 useMessage。补齐公共组件/类型入口、按需样式及 React 文档。
- Secret 显隐切换和标签键提取到 core/secret/foundation，Vue/React 共用。React Secret 和 InputPassword 共用 EyeIcon，删除原先 InputPassword 内联的重复 SVG。
- React Chrome 完整套件连续两轮 247/247：`react-copy-acceptance.log`、`react-copy-acceptance-repeat.log`，均退出 0。覆盖复制反馈重置、失败路径、卸载异步完成、受控显隐、原生空格及两页文档交互/框架切换。
- Vue Copy/Secret 11 个 spec 共 50/50：`vue-copy-acceptance.log`，包含浏览器真实剪贴板读写，NativeExit=0。React 新复制用例使用 stub，未单独验证 React 原生系统剪贴板权限差异。
- core 复制/Secret 与 React 单元、SSR、独立样式测试 151/151；core/React/Vue/浏览器测试/文档类型检查、定向 lint、浏览器测试构建通过。文档 170 页构建成功。graphify update 完成，保留既有 104 条 source_file 缺失警告。
- 本轮不是全仓库 Vue 测试或跨浏览器验收；整体 React API 对齐及剩余组件仍待完成。

### 2026-11-07 InputTag 增量验证

- Pagination 的每页条数选择器依赖 Select；本轮先完成其共用前置 InputTag，未用原生下拉框替代 Select。SelectView、VirtualList、Select 与 Pagination 仍待后续适配。
- React InputTag 复用 core 标签输入 Foundation，覆盖默认/受控值、IME、去重、保留输入、字段映射、格式化/自定义标签、数量/响应式折叠、焦点与 ref、只读提示、表单上下文、原生输入属性及回调。默认字段映射从 Vue 视图提取到 core，两端共用，删除 Vue 的重复常量。
- TagList 保留退场项、取消重新插入项的退场，执行顺序变更动画；InputTag 复用 Tag、WrapClamp、宽度测量和提交后回退。公开入口、类型、按需样式、React 文档和示例齐全。
- 首轮定向 4/5 的失败来自将 Ellipsis 隐藏测量副本计入文本；断言改为可见内容节点后 5/5。补齐重排/重新插入及原生事件测试后 6/6。
- 静态核对发现 inputAttrs 类名/样式被覆盖、初始标签彻底离场后恢复没有入场动画；新增测试稳定复现两处失败（`react-input-tag-gaps-before.log`：6/8），修复合并属性及初始标记清理后 8/8（`react-input-tag-gaps-after.log`）。tagProps.onClose 与内部删除回调组合也有浏览器断言。
- 第一轮未结束的完整 React 回归因补齐上述缺口主动终止，`react-input-tag-acceptance.log` 不计通过。最终同一代码连续两轮完整 Chrome 测试均 256/256、退出 0：`react-input-tag-acceptance-final.log`、`react-input-tag-acceptance-repeat.log`。其中包含 InputTag 文档编辑/重置/折叠/框架切换。BackTop reduced-motion 个别运行较慢但通过，未将此当作已定位或修复的问题。
- Vue InputTag 11 个 spec 共 54/54，`vue-input-tag-acceptance.log`、NativeExit=0。core 标签相关与 React 单元/SSR/独立样式测试 149/149（`react-input-tag-unit-final.log`）。类型检查、定向 lint、浏览器构建与 171 页文档构建通过；graphify update 完成，仍有既有 104 条 source_file 缺失警告。
- 本轮未运行全仓 Vue 套件及其他浏览器；仍不能据此宣称整体 Vue/React API 和全组件迁移验收完成。

### 2026-11-07 SelectView / InputLabel 增量验证

- 完成 React 内部 SelectView 与 InputLabel 适配，复用 core 输入、标签和焦点 Foundation；单选/多选、搜索/创建、图标优先级、表单反馈、受控 IME、原生输入属性与 ref 均有覆盖。可输入、清除可见性和视图/图标模式提取到 core/select/view，Vue 同步使用并删除重复判断。它们是 Select 的内部前置，公开 Select、VirtualList 和 Pagination 尚未完成。
- Vue 全局 allowClear=true 时，内部 InputTag 原先绕过外层 allowClear=false，允许清除时又出现两个按钮。新增用例先复现两处失败（vue-select-view-before.log：1/3），显式关闭内层清除后，Select/Cascader/TreeSelect 全部 39 个 spec 共 282/282、NativeExit=0（vue-select-view-acceptance.log）。共享清除样式支持 focus-within，便于键盘访问。
- React 清除回调调用原生 stopPropagation 后仍触发 React 父层点击，鼠标用例稳定复现（react-select-view-click-before.log：3/4）；将原生 cancelBubble 同步到 React 事件后，定向 5/5（react-select-view-after.log）。Cypress press/type 的 Enter 没有生成按钮点击，诊断日志保留；最终通过 CDP 原生 Enter 验证按钮激活，未将模拟工具差异描述为组件键盘逻辑修复。
- React 文档首页组件目录改为从内容集合生成，完整浏览器测试逐项比较首页目录与侧栏链接。README、QUICK-START、ARCHITECTURE 同步更新。
- React Chrome 当前完整套件连续两轮各 262/262，均退出 0（react-select-view-acceptance.log、react-select-view-acceptance-repeat.log）。共享与 React 单元、SSR、独立样式共 178/178（react-select-view-unit-final.log）；最后的 SSR 测试格式化后独立复验 3/3（react-select-view-ssr-final.log）。
- core/React/Vue/浏览器测试及文档类型检查、定向 lint、测试页生产构建、171 页文档构建通过。graphify update 保留既有 104 条 source_file 缺失警告，未改动无关图谱数据。
- 本轮未执行全仓 Vue 套件或其他浏览器；剩余组件迁移、完整 API 对齐和最终全仓验收仍未完成。

### 2026-11-07 VirtualList 增量验证

- React 内部 VirtualList 直接复用 core/virtual-list Foundation 与仓库已有的 virtua 0.53.4 React 引擎；React 包声明依赖并更新锁文件。容器/条目使用稳定的组件类型和 Context 投影属性，复用共享布局与滚动条样式。覆盖原生属性、空态/前后内容、SSR 预渲染、固定/动态尺寸、方向与模式重建、函数/字段 key、滚动命令、查询及缓存契约；尚未作为公开根入口导出。
- 初始定向测试在完整测试页 0/3，均报 ResizeObserver loop；同一组件独立页面 3/3。观察器诊断捕获 Virtua 同步提交期间 WrapClamp 节点从 120px 变为 72px、再变为 48px（packages/web-react/virtual-list-observer-diagnostic.json），确认同页待提交测量被带入观察器交付。未屏蔽正式测试异常；临时诊断/隔离页面已删除，日志和诊断结果保留。
- 仅延迟观察器重测不能修复初始待提交测量（react-virtual-list-observer-after.log：0/3）；WrapClamp 在微任务中同步提交测量后定向 4/4。但首轮完整回归仍为 264/266（react-virtual-list-acceptance.log），TagGroup 和 WrapClamp 宽度变化路径继续触发 ResizeObserver 循环。随后将尺寸通知引发的重新测量合并到下一帧，并在卸载或观察目标改变时取消，定向复验 6/6（react-virtual-list-resize-after.log）。
- 新增动态行高、函数 key 与尺寸模式切换后，定向 7/7（react-virtual-list-dynamic.log）；包含整页共存、无 console.error、滚动边界、数据反转、空态和卸载清理。最终共享 VirtualList/Clamp 与 React 单元、SSR、独立样式 164/164（react-virtual-list-unit-final.log）。Vue VirtualList 2 个 spec 共 5/5、NativeExit=0（vue-virtual-list-acceptance.log）。
- 最终 171 页文档构建、文档及浏览器测试类型检查、定向 lint 和测试页生产构建通过；README、QUICK-START、ARCHITECTURE 已更新。graphify update 完成，保留既有 104 条 source_file 缺失警告。
- 修正后的 React Chrome 当前完整套件连续两轮各 267/267，退出码均为 0（react-virtual-list-acceptance-final.log、react-virtual-list-acceptance-repeat.log）。保留最初 264/266 的失败结果及原因；未将隔离页面成功或初次定向通过作为整页问题已解决的证据。
- 本轮未运行全仓 Vue 套件或其他浏览器。公开 Select、Pagination、其余组件迁移与完整 API 对齐仍待完成，不能据此宣称整体迁移完成。

### 2026-11-07 Select 增量验证

- React 公开 Select 已接入根/子路径、类型、按需样式和交互文档，复用 core/select 的选项、值、选择和键盘导航 Foundation，并组合 SelectView、VirtualList、Checkbox、Form 与 ConfigProvider。支持单/多选、创建、搜索、防抖、对象值和字段映射、受控拒绝、禁用项保留、只读提示、虚拟列表及自定义触发器。
- 下拉虚拟列表默认尺寸规则提取到 core/select/virtual-dropdown，Vue 原工具文件改为共享导出，覆盖 Select、AutoComplete、Cascader、TreeSelect 四类调用者。Vue 四类组件 44 个 spec 共 325/325、NativeExit=0（vue-select-acceptance.log）。
- 定向测试发现并修复显式 renderLabel 返回 null 时被默认文本替换，以及 CSS 类设置宽度 180px 时弹层错误测量为 985px。Trigger 增加 referenceElement；Select 的事件包装使用 display: contents，直接定位实际视图节点，且单/多选切换后重新绑定。失败证据保留在 react-select-props-before.log、react-select-anchor-before.log；最终定向 Chrome 13/13（react-select-final-focused.log）。
- 初轮其他失败来自测试对隐藏输入框直接点击、Form 默认只在 change 校验，以及 have.attr 改变断言链 subject；修正测试场景后通过，没有将这些测试问题描述为运行时缺陷。
- 共享 Select 与 React 单元、SSR、独立样式共 203/203（react-select-unit-final.log）；最终文档构建 172 页（react-select-docs-acceptance.log）。React/core/Vue 与浏览器测试类型检查、定向 lint、diff 检查通过。graphify update 已执行，保留既有 104 条 source_file 缺失警告，拓扑未变。
- 首轮完整 React Chrome 278/281（react-select-acceptance.log）。两项无 console.error 断言捕获到 Select 分组的 li 直接嵌套 li 警告；诊断定向 0/2（react-select-regression-diagnostic.log）确认同一根因。普通分组改为 li 包含 ul，虚拟分组使用 div，并复用现有列表样式；新增实际列表层级断言，修正后 2/2（react-select-regression-after.log）。另外一项 Trigger 文档失败源于向被遮挡的 body 发送键盘事件，改为向可见触发按钮发送 Escape，未修改 Trigger 运行时。
- 修正后重新构建文档 172 页（react-select-docs-group-final.log），共享 Select 与 React 单元、SSR、样式复验 203/203（react-select-unit-group-final.log）；浏览器测试类型与定向 lint 通过。原始失败证据保留，完整套件重新验收中。
- 修正后的 React Chrome 当前完整套件连续两轮各 281/281、NativeExit=0（react-select-acceptance-final.log、react-select-acceptance-repeat.log）。其中包含 Select 文档、分组结构，以及原先失败的 Clamp 共存、StrictMode 通知和 Trigger 文档回归。保留首轮 278/281 与根因记录；不把后续通过改写为从未失败。
- 本增量已完成上述有界验证；未运行全仓 Vue 套件、其他浏览器或发布验收。Pagination、其余组件迁移及全部组件的完整 API 对齐仍待完成，整体迁移目标保持进行中。

### 2026-11-07 Pagination 增量验证

- React Pagination 已接入根/子路径、公开类型、按需样式、交互文档及 ConfigProvider.pagination。主分页、数字/步进/省略页码、页长选项与跳页复用 core/pagination Foundation；React 只维护状态、受控回写、配置和视图。普通列表使用 li，简洁模式使用 span；图标路径沿用 Vue。
- 定向 Chrome 初轮 5/5（react-pagination-focused.log），补充受控页长接受后仅修正一次和 autoAdjust=false 后 6/6（react-pagination-focused-final.log）。覆盖事件顺序、Enter/Space、禁用、保留首条记录、总数收缩、受控拒绝/外部更新、普通跳页清空、简洁模式同步、零页、配置继承/局部关闭及自定义内容。
- Vue Pagination 全部 5 个 spec 共 43/43、NativeExit=0（vue-pagination-acceptance.log）；共享分页与 React 单元、SSR、独立样式共 175/175（react-pagination-unit.log）。React 和浏览器测试类型、定向 lint、测试页生产构建通过。
- 文档初次构建因 API 表格中的花括号未使用代码格式而失败（react-pagination-docs-build.log）；修正 MDX 后构建 173 页（react-pagination-docs-final.log），文档类型检查通过。README、QUICK-START、ARCHITECTURE 和 ConfigProvider 文档同步；graphify update 已执行，仍为既有 104 条 source_file 缺失警告。
- 最终 React Chrome 当前完整套件连续两轮各 288/288、NativeExit=0（react-pagination-acceptance.log、react-pagination-acceptance-repeat.log），包括 Pagination 文档的受控页长、总数收缩和禁用交互。最终 diff 检查通过。
- 本轮未运行全仓 Vue 套件、其他浏览器或发布验收。其余组件迁移与完整 API 对齐仍待完成，整体目标保持进行中。

### 2026-11-07 AutoComplete 增量验证

- React AutoComplete 已接入公共根/子路径、类型、按需样式、文档和实例 focus/blur/inputRef。复用 core/auto-complete 的输入/选择/事件流程、core/select 的归一化/过滤/键盘导航和共享虚拟列表尺寸规则，组合 Input、SelectDropdown、VirtualList；SelectDropdown 新增 className 投影以应用自动补全共享 token。分组使用合法的列表嵌套，定位指向实际输入视图。
- 初轮 Chrome 定向 5/6（react-auto-complete-focused.log）：虚拟列表实际已滚到 Item 400，精确文本匹配混入 Ellipsis 隐藏测量内容；改为断言可见文本节点后 6/6（react-auto-complete-focused-repeat.log）。未修改虚拟列表滚动实现。
- 扩展定向 7/9（react-auto-complete-extended.log）：外部按钮模拟远程更新触发了既有外部点击关闭，触底操作则早于初始选中项滚动完成。测试改为独立事件更新远程数据/只读/禁用，并等待初始项定位后再滚到底部；最终 9/9（react-auto-complete-extended-repeat.log）。覆盖焦点保持、数据清空/恢复、受控拒绝和释放、数字零/空值、分组、IME、严格/自定义过滤、动态只读/禁用、普通/虚拟触底、挂载容器、表单和 ref 卸载。
- Vue AutoComplete 全部 5 个 spec 共 43/43、NativeExit=0（vue-auto-complete-acceptance.log）；共享 AutoComplete/Select 与 React 单元、SSR、独立样式 190/190（react-auto-complete-unit.log）。React、浏览器测试和文档类型检查、定向 lint、测试页生产构建通过。
- 最终文档构建 174 页（react-auto-complete-docs-build.log），README、QUICK-START、ARCHITECTURE 同步更新。graphify update 完成，保留既有 104 条 source_file 缺失警告；diff 检查通过。
- 最终 React Chrome 当前完整套件连续两轮各 298/298、NativeExit=0（react-auto-complete-acceptance.log、react-auto-complete-acceptance-repeat.log），包含 AutoComplete 文档的输入选择、外部回写和只读提示。完整测试期间未改动运行时代码；最终 diff 检查通过。
- 本轮未运行全仓 Vue 套件、其他浏览器或发布验收。其余组件迁移与完整 API 对齐仍待完成，整体目标保持进行中；BackTop reduced-motion 慢用例的既有耗时问题未宣称解决。

### 2026-11-07 Modal 增量验证

- React Modal 已接入公共根/子路径、类型、按需样式、交互文档、ConfigProvider.modal 和静态/useModal API。与 Drawer 共用内部 useDialog，复用 core/dialog 的确认、弹层栈、滚动锁、焦点、遮罩、拖动、布局及命令式注册表。
- 初次定向测试暴露全屏切换重复发送 onOpen；移除动画名对开关生命周期 effect 的触发后定向 8/8。其余初始失败来自事件顺序、MouseEvent 坐标、主题变量名和卸载提交时机的测试假设，原始日志保留。补充受控拒绝、默认打开和静态显式上下文后 9/9（react-modal-focused-context.log）。
- 独立样式测试发现基础图标样式缺失，补齐后 React 单元/SSR/样式及共享对话框测试 165/165（react-modal-unit-final.log；文档重建后 react-modal-unit-built.log 再验 165/165）。React/浏览器/文档类型、定向 lint、测试页生产构建通过；文档构建 175 页（react-modal-docs-build.log）。
- Vue 组合运行完成 Modal 10 个 spec 共 64/64 后停在 Drawer 第一个 spec 加载阶段，持续无输出后人工中止；原日志 vue-modal-drawer-acceptance.log 保留。Drawer 分开复验 10 个 spec 共 46/46、NativeExit=0（vue-modal-drawer-recheck.log）。分开运行覆盖全部相关用例，但不把重跑通过当作加载停顿已修复。
- 当前完整 React 套件与文档交互验收见下文。动态更换挂载容器的内容状态保持、持有 useModal API 在所属组件卸载后再调用等边界仍待完整 API 审计；本轮不宣称整个迁移或 Modal 全部边界已完成。
- 首轮完整 React 307/308（react-modal-acceptance.log）：新增 Modal 文档用例的模糊“确认”选择器匹配到了弹窗外“命令式确认”按钮，被遮罩阻挡；限定弹窗并精确匹配按钮后定向 1/1（react-modal-doc-focused.log），浏览器测试类型通过。运行时代码未改动，随后完成两轮完整复验。
- 修正后 React Chrome 当前完整套件连续两轮各 308/308、NativeExit=0（react-modal-acceptance-final.log、react-modal-acceptance-repeat.log），包含全部 Modal 用例、Drawer 共享生命周期和 Modal 文档交互。最终 diff 检查通过；graphify update 完成，既有 104 条 source_file 警告仍在。
- 本增量验证完成，但整体迁移仍进行中；未运行全仓 Vue 套件、其他浏览器或发布验收。动态容器与卸载后 API 等边界审计仍待完成。

### 2026-11-07 对话框容器迁移与 Hook 卸载边界

- 新增回归先复现 3/3 失败（react-modal-boundary-red.log）：Modal/Drawer 切换 popupContainer 丢失非受控草稿，卸载后保留的 useModal API 创建空 overlay。useDialog 改为稳定 Portal 宿主并移动 DOM，同步焦点/滚动锁，容器变化不再重启开关生命周期；Hook 所属组件卸载时失活，StrictMode 重挂时恢复。
- 修复后草稿和卸载清理通过，节点身份测试先因 Cypress 包装对象与原生节点比较失败 1/3，改为保存原生引用后 3/3（react-modal-boundary-final.log）。补充宿主卸载清理并包含原有 Modal 调用方式后 12/12（react-dialog-boundary-all.log）。
- Vue 对照首次停在加载阶段：运行器显示 Your tests are loading，编译 spec 响应 200，浏览器有 Cypress polyfills/favicon 404；人工中止，根因未确定。重跑进入测试后修正默认 Transition stub 和非受控输入光标位置假设，真实 Transition 的两个对照用例最终 2/2、NativeExit=0（vue-dialog-boundary-verified.log）。原始失败和加载停顿日志保留，不宣称运行器问题已解决。
- 文档重建 175 页、React/浏览器/文档类型、定向 lint、测试页生产构建通过；重建产物上的单元/SSR/独立样式及共享对话框测试 165/165（react-dialog-boundary-unit.log）。graphify update 完成，仍有既有 104 条 source_file 警告。
- 当前 React Chrome 完整套件 311/311、NativeExit=0（react-dialog-boundary-acceptance.log），包含 Modal/Drawer 共享生命周期及文档交互。此修复版本完成一轮完整回归；上一增量的 308/308 两轮记录不替代本版本证据。最终 diff 检查通过。
- 容器迁移与卸载后 Hook API 两个已列缺口本轮已解决；全仓 Vue、其他浏览器、发布验收和剩余组件/完整 API 对齐仍未完成。

### 2026-11-07 List 增量验证

- 新增 React List、ListItem、ListItemMeta 和静态 Item/Meta 别名、公共类型/子路径、独立样式、ConfigProvider.listSpinProps 与交互文档。复用 core/list 和 legacy pagination 的分页切片、栅格分行、触底与状态规则，组合既有 Pagination、Grid、Spin、Scrollbar、VirtualList 和 PerformantEllipsis。
- 第一轮定向 0/7：样式入口误指向 virtual-list.scss，Vite 页面没有加载；改为已有 _shared/virtual-list.scss 后 6/7。解除受控同时改变页长时共享 autoAdjust 会再调整页码，修正遗漏该步骤的断言后 7/7（react-list-focused-final.log）；Vue 新增对照测试证实相同最终页码。
- 补加载配置优先级、ReactElement 虚拟数据与文档交互后定向 9/9、NativeExit=0（react-list-focused-extended.log）。覆盖分页回调顺序/受控拒绝/外部更新、短页、children 优先与更新、非整除栅格索引、响应式列、grid 优先虚拟、item/meta/actions、空状态/触底加载、虚拟 ref 滚动与初始触底判定。
- Vue List 全部 5 个 spec 43/43、NativeExit=0（vue-list-acceptance.log）；React 单元/SSR/样式与共享 List/分页测试 212/212（react-list-unit.log）。React/浏览器/文档类型、定向 lint、测试页生产构建通过；最终文档构建 176 页（react-list-docs-final.log）。README、QUICK-START、ARCHITECTURE 与 ConfigProvider 文档同步。
- 当前完整 React Chrome 套件 320/320、NativeExit=0（react-list-acceptance.log），包含 List 文档分页/栅格/加载交互。此增量完成一轮当前完整套件；此前不同范围的多轮通过不替代本次证据。graphify update 完成，既有 104 条 source_file 警告仍在；最终 diff 检查通过。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成。BackTop reduced-motion 用例本轮约 48 秒，未宣称其既有耗时问题已修复。

### 2026-11-07 Carousel 增量验证

- React Carousel/CarouselItem 已接入根/子路径、公开类型、按需样式、Item 别名、实例 prev/next/goTo 及交互文档。复用 core/carousel 的切换、计时器、索引、动画状态与指示器，React 子项登记复用 useItemIndex；根按默认前缀隔离嵌套登记。指示器 click 参数收窄为实际使用的事件字段，使 React 能传入正确的 delegated currentTarget，Vue MouseEvent 调用兼容。
- 初轮定向 5/8：一例未等待动画锁结束，两例测试事件早于 fixture 监听器就绪。补提交就绪断言后 7/8；悬停状态提交前推进假时钟导致通知先排队、画面断言读到旧状态。分阶段断言与计时日志证明卸载时计时器已清理；等待悬停状态提交后 8/8（react-carousel-focused-final.log），未为测试假象修改运行时代码。原始日志与 timer audit 保留。
- 定向加文档回归 9/9、NativeExit=0（react-carousel-focused-docs.log）。覆盖 1 起始事件顺序、输入框键盘保护、受控拒绝/负索引、动态增删/重排与包装子项、方向/动画/指示器、slider 轨道节点、自动播放独立动画锁、悬停策略改变/卸载清理和嵌套根。
- Vue Carousel 全部 3 个 spec 44/44、NativeExit=0（vue-carousel-acceptance.log）；React 单元/SSR/独立样式与共享 Carousel 测试 172/172（react-carousel-unit.log）。React/浏览器/文档类型、定向 lint、测试页生产构建通过；文档构建 177 页（react-carousel-docs.log）。README、QUICK-START、ARCHITECTURE 同步，graphify update 完成，既有 104 条 source_file 警告仍在。
- 当前完整 React Chrome 套件 329/329、NativeExit=0（react-carousel-acceptance.log），失败、待定和跳过均为 0，用时 10 分 40 秒，包含 Carousel 文档交互。此增量完成一轮当前完整套件；此前不同版本的多轮通过不替代本次证据。最终 diff 检查通过。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；不同前缀 Provider 下的嵌套 Carousel 后续验证见下文。

### 2026-11-07 Carousel 跨前缀嵌套隔离

- 新增回归复现外层第二张被标为“第 4 张,共 3 张”（react-carousel-prefix-red.log，0/1）：内层不同 prefixCls 的子项混入外层 DOM 索引查询。React Carousel 给子项添加所属实例的稳定标识，继续复用共享 useItemIndex，只查询本实例子项；没有修改共享索引算法或 Vue 运行时代码。
- 修复后定向 1/1（react-carousel-prefix-fixed.log），全部 React Carousel 用例 9/9（react-carousel-prefix-all.log），覆盖动态内层前缀变化、外层导航和重排。Vue 添加不同前缀嵌套对照，全部 Carousel 3 个 spec 45/45、NativeExit=0（vue-carousel-prefix.log）。
- 文档重建 177 页（react-carousel-prefix-docs.log），构建产物上的 React 单元/SSR/独立样式与共享 Carousel 测试 172/172（react-carousel-prefix-unit.log）；React/浏览器/文档类型与定向 lint 通过。graphify update 完成，既有缺失 source_file 与工具版本警告保留。
- 修复版本完整 React Chrome 套件 330/330、NativeExit=0（react-carousel-prefix-acceptance.log），失败、待定和跳过均为 0，用时 10 分 7 秒，包含全部文档交互；此版本完成一轮完整回归。最终 diff 检查通过。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；此前版本的多轮通过不能替代最终完整迁移版本的多轮验收。BackTop reduced-motion 用例约 49 秒，未宣称其既有耗时已修复。

### 2026-11-07 Mention 增量验证

- React Mention 已接入根/子路径、公开类型、按需样式与交互文档，支持 Input/Textarea、prefixContent/option 渲染、实例 focus/blur/inputRef。复用 core/mention 的前缀搜索、文本替换与通知顺序、core/select 的数据归一化/过滤/键盘导航、core/textarea 的镜像尺寸属性；适配层组合既有输入与浮层组件，未重复实现业务规则。
- 首轮定向 4/7（react-mention-focused.log）：测试使用全局 Select 选择器，计入其他 fixture 的候选项。限定 Mention 弹层后 7/7（react-mention-focused-scoped.log）。扩展到 IME、空字符串与文本域状态后组件 9/9，文档临时测试因继承 5187 的 beforeEach 导致跨源失败；独立文档分组重跑后 10/10、NativeExit=0（react-mention-focused-final.log）。原始失败日志保留。
- 覆盖分组/禁用/零值、搜索和选择事件顺序、过滤与多字符前缀/分隔符、受控尾文本更新与释放、远程选项变化、只读/禁用、文本域类型切换/宽度重测、ref/清除配置/表单、IME Enter/空值/原生事件与文档双输入模式。
- 单元/SSR/独立样式与共享 tag-inputs 初轮 180/181：SSR 只读属性断言大小写与 React 输出 readOnly 不一致；修正断言后 181/181（react-mention-unit-final.log）。React/浏览器/文档类型、定向 lint 和测试页生产构建通过；文档构建 178 页（react-mention-docs.log）。README、QUICK-START、ARCHITECTURE 同步，graphify update 完成，既有 source_file 和工具版本警告保留。
- Vue Mention 全部 5 个 spec 32/32、NativeExit=0（vue-mention-acceptance.log）。当前完整 React Chrome 套件 340/340、NativeExit=0（react-mention-acceptance.log），失败、待定和跳过均为 0，用时 10 分 51 秒，包含 Mention 文档交互；此增量完成一轮当前完整回归。最终 diff 检查通过。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；最终迁移版本仍需多轮完整验收。BackTop reduced-motion 用例本轮约 55 秒，不宣称其既有耗时问题已修复。

### 2026-11-07 SelectableCard 增量验证

- React SelectableCard 已接入根/子路径、按需样式、ReactNode 内容区域、DOM ref 与交互文档。Vue 原有框架无关类型移至 core/selectable-card/types，Vue 改为类型重导出，React 扩展内容投影；交互直接复用既有 createSelectableCardFoundation 和 toCssSize，保持必填受控 isSelected 与显式 isDisabled，不引入非受控状态。
- 初轮定向 3/5（react-selectable-card-focused.log）：Cypress type 空格修改原生 checkbox，但没有触发 React 的点击驱动 change。按仓库既有 Checkbox 测试使用真实 cy.press(SPACE) 后 5/5（react-selectable-card-keyboard.log），未为事件模拟差异修改组件运行时代码。
- 补原生 checkbox 点击拒绝、禁用卡片内独立操作及文档交互后 6/6、NativeExit=0（react-selectable-card-focused-final.log）。覆盖重复拒绝/外部状态更新、接受键盘写回、嵌套 button/link/label/input/select/textarea/role-button、零值与自定义内容、尺寸换算/视觉变体/布局、前缀和 ref。
- React 单元/SSR/独立样式与共享 pressable 测试 204/204（react-selectable-card-unit.log）；React/浏览器/文档类型、定向 lint、测试页生产构建通过。文档构建 179 页（react-selectable-card-docs.log），README、QUICK-START、ARCHITECTURE 同步；graphify update 完成，既有 source_file 和工具版本警告保留。
- Vue SelectableCard 全部 4 个 spec 15/15、NativeExit=0（vue-selectable-card-acceptance.log）。当前完整 React Chrome 套件 346/346、NativeExit=0（react-selectable-card-acceptance.log），失败、待定和跳过均为 0，用时 10 分 49 秒，包含 SelectableCard 文档交互；此增量完成一轮当前完整回归。最终 diff 检查通过。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；最终完整迁移版本仍需多轮验收。既有 BackTop reduced-motion 耗时未在本轮修复。

### 2026-11-07 QrCode 增量验证

- React QrCode 已接入根/子路径、公开类型、独立样式、ConfigProvider.qrCodeSpinProps 与交互文档。复用共享 QR 编码、尺寸/颜色、SVG/Canvas 渲染和异步竞态规则；新增 Foundation.dispose 使未完成的成功/失败回调失效，Vue onBeforeUnmount 与 React effect 清理共同接入。共享单元测试覆盖 SVG/Canvas 成功、失败、等待下一次渲染时卸载及重新挂载。
- React Sider 的 DOM 主题检测提为 useThemeMode，QrCode 与 Sider 共用同一适配 hook 和 core 主题判定；根节点由空值变为可见时重新解析主题。React 主题、Canvas 真正像素、SVG 多行值更新、显式选项/图标/状态/语言/Spin 配置、ref、乱序编码和卸载后结果均已覆盖。
- 初轮定向 4/5（react-qr-focused.log）：SVG 路径 alias 默认会重新查询，比较时读取了更新后的路径。改为 static alias 后，QrCode 5 项、Sider 4 项与文档 1 项合计 10/10、NativeExit=0（react-qr-focused-final.log）。
- 类型覆盖审计发现旧浏览器 tsconfig 仅检查 .cy.ts，未包含 .tsx fixture；使用包含全部 spec/fixture 和 vite/client 样式声明的类型检查配置，全部浏览器 spec 与 fixture 类型通过（react-browser-types-expanded.log）。修正此前 SelectableCard fixture 误传 ConfigProvider.disabled 及 Mention/SelectableCard 文档中的两处错误配置描述。此前浏览器类型通过记录不代表当时已检查 fixture。
- 初次文档构建因 MDX 将未加代码标记的 {width, height} 解析为表达式失败（react-qr-docs.log）；修正后 180 页构建成功（react-qr-docs-final.log）。React 单元/SSR/独立样式与共享二维码测试 182/182（react-qr-unit.log）；React/浏览器/文档类型、定向 lint、测试页生产构建通过。README、QUICK-START、ARCHITECTURE 及 ConfigProvider 文档同步，graphify update 完成，既有警告保留。
- Vue QrCode 全部 4 个 spec 27/27、NativeExit=0（vue-qr-acceptance.log），包含新增的旧实例异步结果不影响重挂实例对照。

- 首轮完整套件在 Cypress Webpack 编译阶段终止，0 项执行（react-qr-acceptance.log）：fixture 加入运行器 tsconfig 触发 TNB/ts-loader 的 multiple source map outputs。已将完整静态检查放入 tsconfig.check.json，Cypress 配置仍仅包含 spec；包 typecheck 串联源码与完整浏览器类型检查，保留覆盖，不更换编译器。

- 配置分离后包级 typecheck（组件源码 + 全部浏览器 spec/fixture）通过（react-qr-types-final.log）；当前完整 React Chrome 套件 352/352、NativeExit=0（react-qr-acceptance-final.log），失败、待定和跳过均为 0，用时 11 分 15 秒，包含共享 Sider 主题、修正后的 SelectableCard fixture 和 QrCode 文档交互。此版本完成一轮完整验收；最终 diff 检查通过。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；最终完整迁移版本仍需多轮验收。未宣称解决 TNB/ts-loader 多输出实现问题，仅通过分开编译与检查范围规避；既有 BackTop reduced-motion 耗时仍保留。

### 2026-11-07 Typography 前置：RichLineClamp 根元素引用

- 核对 Typography 的共享 Foundation、格式化、复制/编辑、操作按钮、文本测量以及 Vue 回归契约；Typography React 组件族尚未实现。本轮只补齐其浮层适配所需的 RichLineClamp 根元素引用。
- RichLineClamp 新增独立 rootRef，保留原有 ref 的 expand/collapse/toggle 与状态契约。浏览器用例验证两种引用同时可用、根标签替换后 DOM 引用更新、通过原有 ref 展开以及卸载时两种引用清空；测试页使用 StrictMode。Clamp 文档已同步。
- 定向 Chrome 1/1（react-clamp-ref-focus.log），当前完整 React Chrome 353/353、NativeExit=0（react-clamp-ref-acceptance.log），失败/待定/跳过均为 0，用时 11 分 13 秒。临时定向 spec 已删除，永久用例保留。
- React 单元/SSR/独立样式 170/170（react-clamp-ref-unit.log）；包级源码与全部浏览器 spec/fixture 类型、文档类型、定向 lint 均通过。文档构建 180 页（react-clamp-ref-docs.log），构建声明包含 rootRef；graphify update 完成，保留既有 source_file/版本警告。
- 本轮未修改 Vue 或共享 Foundation，未重跑 Vue 全仓测试；整体迁移、完整 API 审计、其他浏览器与发布验收仍未完成。BackTop reduced-motion 用例耗时约 52 秒，本轮未修复。

### 2026-11-07 Typography 增量验证

- React Typography / Text / Title / Paragraph 已接入组合及独立导出、子路径、公开类型、DOM ref、按需样式与交互文档。编辑/复制/展开状态和操作键盘行为复用 core/typography；格式化与 HTML 转义、Input 编辑聚焦、RichLineClamp 及 Tooltip/Popover 组合保持 Vue 契约。成功图标复用 StatusIcon，编辑/复制图标使用 Vue 同款路径。
- 普通内容从实际 DOM 读取文本，复制前刷新；省略/编辑模式以保持 Context 的隐藏子内容读取完整文本，MutationObserver 跟踪子组件更新。普通子节点保留身份与焦点；自定义图标/提示/展开内容返回 null 时保持为空。默认编辑先测量文本再聚焦至末尾，SSR 保留编辑框。
- 首轮定向 3/6（react-typography-focus.log）：选择器匹配隐藏测量副本，导致重复文本和多元素点击；一次脚本语法错误使未修改的测试重复运行并仍为 3/6（react-typography-focus-final.log）。限制真实显示区域后 5/6（react-typography-selectors.log），剩余为缺失 title 断言改变后续断言对象；重新查询后扩展用例 9/9（react-typography-expanded.log），含文档与编辑期空 ref 检查的定向 10/10、NativeExit=0（react-typography-focused-final.log）。未将这些测试修正描述为运行时竞态修复。
- 永久组件用例 9 项与文档用例 1 项已加入完整套件；覆盖格式/转义、Context 更新、复制值/计时器/键盘、自定义反馈、编辑事件顺序/受控拒绝/IME/默认聚焦/失焦、展开及关闭省略、Tooltip/Popover、编辑期 ref 与普通子节点焦点保持。临时定向 spec 已移除。
- Vue Typography 全部 5 个 spec 39/39、NativeExit=0（vue-typography-acceptance.log）。React 单元/SSR/独立样式及共享 Typography/Copy 测试 195/195、NativeExit=0（react-typography-unit-final.log）。组件源码与全部浏览器 spec/fixture 类型、文档类型、定向 lint、测试页生产构建通过；最终文档构建 181 页（react-typography-docs-final.log）。README、QUICK-START、ARCHITECTURE 已同步；graphify update 完成，保留既有警告。
- 当前完整 React Chrome 套件 363/363、NativeExit=0（react-typography-acceptance.log），失败、待定和跳过均为 0，用时 11 分 49 秒；最终 diff 检查通过。此增量完成一轮当前完整验收。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成，最终完整迁移版本仍需多轮验收。BackTop reduced-motion 本轮约 55 秒，未宣称修复。

### 2026-11-07 SkeletonReveal 增量与批量可见性修复

- React SkeletonReveal 已接入根/子路径、公开 props/ref 类型、共享样式、ConfigProvider 主题与交互文档。复用 core/skeleton-reveal 的几何测量、最多 24 条轮廓、状态/取消和交互规则；React 每次连接创建独立 Foundation，清理时隔离旧实例，保留 StrictMode 初始 idle/自动播放语义。系统偏好使用共享 observeBeamPreferences 的 React hook。
- 将动画驱动放入 core/skeleton-reveal/animation，Vue 与 React 共用原生 Element.animate；秒转毫秒、fill:both、ease-out 与贝塞尔参数对照本地 Motion 14 实现。Vue 保留框架响应式与 reduced-motion 适配。未新增依赖。
- 初轮 React 定向 6/7（react-reveal-focus.log），瞬时滚动后自动播放一直停在 idle。复跑和原生瞬时滚动均能复现；持续滚动曾 7/7，但未作为修复证据。诊断与共享单元复现定位到一次 IntersectionObserver 回调可能同时包含旧的不可见和新的可见记录，旧代码只读取第一条。共享 Foundation 改为读取最后一条，保留退出视口和取消规则。
- 新增共享单元先红（reveal-batch-red.log，idle 与 drawing 不符）、后绿（reveal-batch-green.log，10/10，含原生驱动检查），覆盖 false→true 与 true→false 批次。Vue 增加基于原生观察器的批量记录回归。所有临时诊断代码与 debug spec 已移除；原始瞬时滚动用例恢复后 7/7、NativeExit=0（react-reveal-fixed.log）。
- 扩展 React 定向 10/10、NativeExit=0（react-reveal-focused-final.log），含真实描边插值、初始轮廓/自动播放一次、原生瞬时滚动、焦点/指针首轮输入、重播竞态、尺寸/离开视口、禁用/零时长/动态及初始 reduced-motion、主题、独立 mask、卸载动画清理、轮廓上限、页面隐藏和文档。9 项组件与 1 项文档用例已加入永久完整套件，临时 focus spec 已移除。
- Vue SkeletonReveal 全部 3 个 spec 17/17、NativeExit=0（vue-reveal-acceptance.log）；先前诊断轮虽打印 10 项通过，但进程退出码为 3，不作为最终验收。React 单元/SSR/独立样式与共享 SkeletonReveal 测试 187/187、NativeExit=0（react-reveal-unit.log）。源码及全部浏览器 spec/fixture 类型、文档类型、定向 lint、测试页生产构建通过；文档构建 182 页（react-reveal-docs.log）。README、QUICK-START、ARCHITECTURE 同步；graphify update 完成，既有警告保留。
- 当前完整 React Chrome 套件 373/373、NativeExit=0（react-reveal-acceptance.log），失败、待定和跳过均为 0，用时 12 分 06 秒；最终 diff 检查通过。此增量完成一轮当前完整验收。
- 下一步优先修复：core/thinking-orb/foundation.ts 与 core/liquid-glass-logo/renderer.ts 的 IntersectionObserver 也仅取首条记录，需要补批量记录回归并改为最新记录。BorderBeam 已遍历整批记录，本轮只完成实现核对，React 迁移仍待完成。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；最终完整迁移版本仍需多轮验收。既有 BackTop reduced-motion 耗时未在本轮修复。

### 2026-11-07 ThinkingOrb 增量与可见性批次修复

- React ThinkingOrb 直接复用 Core Canvas 引擎、预设与 Foundation，覆盖九种状态、20/64 尺寸、无效尺寸回退、auto/light/dark、速度、暂停、动态 reduced-motion、本地化标签及原生 Canvas 引用。补齐根/子路径与类型导出、按需样式、交互文档及三份架构/上手说明，未新增依赖。
- ThinkingOrb 与 LiquidGlassLogo 的单目标 IntersectionObserver 原先读取批次第一条，现读取最后一条并保留各自空批次默认值。ThinkingOrb 单元测试先失败（orb-visibility-red.log）；两个基于原生观察器的 Vue 回归先失败 0/2（visual-visibility-red.log，NativeExit=2），修复后 2/2（visual-visibility-green.log，NativeExit=0）。LiquidGlassLogo 回归检查真实 WebGL uTime 推进和停止。
- 两个 Vue 组件全部用例 41/41（visual-visibility-acceptance.log，NativeExit=0）。相关 Core 单元 24/24（visual-visibility-unit.log）；全部 React 单元/SSR/独立样式加相关 Core 测试 204/204（react-orb-unit.log，NativeExit=0）。
- React 首轮定向 4/6（react-orb-focus.log）：两个播放断言在未进入视口时检查 Canvas，组件按设计停止动画。测试增加进入视口操作，并补离开/原生瞬时返回用例；最终 7/7（react-orb-focus-final.log，NativeExit=0），包括九种状态真实像素、DPR、尺寸、引用、语言、暂停/恢复/负速、继承/显式主题、初始/动态 reduced-motion、页面隐藏、卸载及文档切换。全部 7 项加入永久套件，临时 focus spec 移除；未将首次测试前置条件问题宣称为运行时代码修复。
- 组件与全部浏览器测试类型检查、文档类型检查、定向 lint、测试页生产构建通过。文档首次 MDX 类型表尖括号解析失败，改为代码格式后成功构建 183 页（react-orb-docs.log，NativeExit=0）。graphify update 完成，既有警告保留。
- 当前完整 React Chrome 套件 380/380（react-orb-acceptance.log，NativeExit=0），失败、待定、跳过均为 0，用时 12 分 34 秒。此增量完成一轮完整验收；既有 BackTop reduced-motion 用例约 49 秒，未在本轮修复。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器及发布验收仍未完成；最终完整迁移版本仍需多轮验收。下一步继续 BorderBeam / LiquidGlassLogo React 适配，后者仍需接入自动宽度、主题回退、WebGL 失败回退及播放引用。

### 2026-11-07 LiquidGlassLogo 增量

- React LiquidGlassLogo 补齐全部绘制/布局参数、根/子路径与公开类型、按需样式、Canvas 首帧/错误回调、自定义静态 fallback、replay/seek/pause/play 引用以及交互文档。
- Vue 的连接、错误、上下文丢失和释放逻辑提取为 core/liquid-glass-logo/controller；主题回退提取为 core/liquid-glass-logo/theme；Vue Props/Exposed 移至 Core 并保留旧入口转发。两端共用既有 WebGL 引擎、预设、参数归一化和自动宽度测量。React 每次挂载连接创建独立控制器，同步初始化错误延迟到微任务并检查连接有效性，避免 StrictMode 丢弃连接重复发送错误。
- React useThemeMode 增加与 Vue 相同的可选回退与 data-theme 监听。useBeamPreferences 初始系统主题使用 light，与无浏览器偏好的 SSR 保持一致；已核对原有唯一调用方 SkeletonReveal 只使用 reducedMotion。共享控制器/主题新增单元覆盖不可用 WebGL、上下文事件默认行为、清理以及主题优先级。
- Vue LiquidGlassLogo 全部 3 个 spec 27/27（vue-glass-shared.log，NativeExit=0）。相关 Core 单元 8/8（react-glass-core-unit.log）；全部 React 单元/SSR/独立样式加相关 Core 测试 209/209（react-glass-unit.log，NativeExit=0）。
- React 首轮定向 10/11（react-glass-focus.log）：测试错误地预期图片加载失败触发 fallback。核对共享 renderer 的 loadImage 后确认 Vue 原行为是空图层继续绘制；按实际行为修正文档与测试，没有改变运行时语义。扩展后 13/13（react-glass-focus-final.log，NativeExit=0），覆盖真实 GPU 像素/时钟、播放引用/paused、宽度/字号/高度、主题优先级/系统偏好/CSS scheme、背景钳制、无 WebGL、着色器失败、上下文丢失、资源清理、坏图片空图层、视口停止与瞬时返回、初始/动态 reduced-motion 和文档。全部用例加入永久套件，临时 focus spec 删除。
- 组件/全部浏览器测试类型、文档类型、定向 lint、测试页生产构建通过。文档最终构建 184 页（react-glass-docs-final.log，NativeExit=0）；README、QUICK-START、ARCHITECTURE 更新，graphify update 完成。
- 当前完整 React Chrome 套件 393/393（react-glass-acceptance.log，NativeExit=0），失败、待定、跳过均为 0，用时 13 分 16 秒；最终 diff 检查通过。此增量完成一轮完整验收。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；最终完整迁移版本仍需多轮验收。下一步继续 BorderBeam React 适配。

### 2026-11-07 BorderBeam 增量

- React BorderBeam 补齐五种尺寸/效果、四种颜色变体、系统主题、静态色相、速度/圆角/强度等全部 Props、activate/deactivate 回调、flowFrom 引用、children/原生属性、根/子路径类型导出、按需样式及交互文档。
- 派生主题、尺寸、最终参数、CSS 和驱动配置直接由 Core Foundation 计算，移除 Adapter 将同一计算结果回传 Core 的循环接线；Vue 仍负责响应式状态/生命周期和 SVG。BorderBeamProps 从 Vue 内联定义移至 Core，Vue 使用共享类型。已核对 Foundation 全部调用方，移除无引用的派生端口与 Vue computed 变量。
- React 使用独立实例 ID 和原生 SVG，连接代次隔离 StrictMode 已丢弃的延迟测量。复用共享脉冲驱动与系统偏好；active、流动完成后的受控恢复、退场、视口暂停、圆角/尺寸检测及卸载规则保持共享。
- 共享单元修改前 9/9（react-beam-core-baseline.log）、修改后 9/9（react-beam-core-unit.log）。Vue BorderBeam 全部 3 个 spec 55/55（vue-beam-shared.log，NativeExit=0）。全部 React 单元/SSR/独立样式与 BorderBeam Core 单元 195/195（react-beam-unit.log，NativeExit=0）。
- React 定向 12/12（react-beam-focus.log，NativeExit=0），覆盖 StrictMode 唯一样式/ID、真实淡入淡出、过滤伪元素与外部动画、退场反转、SVG 实际几何/坐标/遮罩隔离、受控状态恢复、圆角/子元素替换、五种效果/色相规则/强度限制、脉冲缩放、系统主题、视口暂停、卸载资源/引用清理、减少动态效果及文档交互。全部用例加入永久完整套件，临时 focus spec 删除。
- 组件与全部浏览器测试类型、文档类型、定向 lint、测试页生产构建通过；文档构建 185 页（react-beam-docs.log，NativeExit=0）。README、QUICK-START、ARCHITECTURE 同步，graphify update 与 diff 检查通过。
- 当前完整 React Chrome 套件 405/405（react-beam-acceptance.log，NativeExit=0），失败、待定、跳过均为 0，用时 16 分 11 秒；最终 diff 检查通过。此增量完成一轮当前完整验收。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器与发布验收仍未完成；最终完整迁移版本仍需多轮验收。下一步继续 VoiceGlow/BloomMenu 等未完成组件，保留完整公共 API 与行为范围。

### 2026-11-07 VoiceGlow 增量

- React VoiceGlow 对齐 74 个 Props，复用共享 Canvas/音频驱动、预设、CSS、淡入淡出与圆角检测；补齐原生 ref/属性、根与子路径导出、独立样式、深浅主题示例和麦克风 Hook 文档。
- Core Foundation 直接计算派生值并实时读取 props，移除 Adapter 回传同一结果的派生端口；默认参数提取到共享 voiceGlowPropDefaults，Vue 同步使用。删除对应无引用的 Vue computed 和测试变量。
- useVoiceMicrophone 复用 Core 控制器，SSR 初始不访问浏览器；每次连接隔离状态与清理，自动请求延迟到微任务并核对连接，避免 StrictMode 丢弃连接产生权限请求。
- Core 单元修改前后均 12/12；Vue 全部 4 个 spec 19/19（vue-voice-shared.log，NativeExit=0）；React 全部单元/SSR/样式与 Core VoiceGlow 单元 202/202（react-voice-unit.log，NativeExit=0）。
- React 首轮定向 12/15（react-voice-focus.log）：两处模拟异常使用了测试窗口的构造器，另一处检查音轨早于异步释放完成。改用应用窗口异常和可重试音轨断言后 15/15（react-voice-focus-final.log，NativeExit=0），未修改运行时来迎合测试，也未将此宣称为运行时缺陷修复。
- 定向用例覆盖真实 Canvas 像素、平滑采样、暂停/处理、预设/几何/失真、主题/reduced-motion、真实合成 MediaStream、无 Canvas filter、退场过滤、资源释放、麦克风权限/取消/初始化失败和文档切换。已加入永久完整套件并移除临时 spec；物理麦克风尚未验证。
- React/浏览器类型、文档类型、定向 lint、测试页生产构建通过；文档构建 186 页（react-voice-docs.log）。README、QUICK-START、ARCHITECTURE 同步。完整 React Chrome 回归 420/420（react-voice-acceptance.log，NativeExit=0），用时 18 分 08 秒，失败、待定、跳过均为 0。
- 整体迁移、完整 API 审计、全仓 Vue、其他浏览器及发布验收仍未完成；最终完整迁移版本仍需多轮验收。下一步继续 BloomMenu 等未完成组件。

### 2026-11-07 BloomMenu 增量

- React BloomMenu 提供全部 9 项共享属性、四类事件、五类自定义内容、原生根引用、按需样式和根/子路径类型导出。使用现有 Button/Trigger，与 Vue motion-v 已锁定依赖相同的 framer-motion 14.0.0 进行形变动画；未新增独立动画算法。
- 共享 Props 从 Vue 内联定义移至 Core。Core 自行计算列数、行数、开关与面板派生值，删除 Vue/React/测试对这些值的重复回传；居中定位和 shift 视口避让合并为共享 getFloatingOptions。
- 发现 Core dispose 后已排队焦点仍会执行。新增测试先失败（react-bloom-lifecycle-red.log），加入代次检查后源码单元 16/16（react-bloom-lifecycle-green.log）；覆盖排队焦点、等待帧、关闭还焦点以及新连接恢复。React 额外取消连接持有的帧，Vue 增加打开中卸载回归。
- Core 基线 15/15（react-bloom-core-baseline.log），派生重构后源码测试 15/15（react-bloom-core-source.log）；最终全部 React 单元/SSR/独立样式与 BloomMenu Core 单元 210/210（react-bloom-unit.log，NativeExit=0）。Vue 全部 6 个 spec 36/36（vue-bloom-shared.log，NativeExit=0）。
- React 首次跨文件测试辅助模块触发 Cypress/TNB sourcemap emit 失败（react-bloom-focus.log）；用例内联回永久单一 spec，保留仓库 TNB。运行后测试前置条件暴露外部控制点击触发关闭、自动滚动使定位受视口约束、点击坐标不可见/被面板覆盖等问题；改为专用属性更新事件、固定测试滚动策略与可见外部按钮，原生 Enter 使用 Vue 同款 CDP 按键。未把测试前置条件修正当作运行时缺陷修复。
- 最终 React 定向 12/12（react-bloom-focus-acceptance.log，NativeExit=0）：原生 Enter 事件顺序、受控拒绝与重开、关闭形变保留、动态索引/禁用、动态偏移、列数与插槽、Button 属性/指针事件、图标优先级与零值、空列表焦点/外部关闭、视口避让、reduced-motion/卸载引用及文档切换。临时 focus spec 已删除。
- 正式 React/浏览器类型、文档类型、定向 lint 通过。修正 Vue 泛型可选 icon 带入 undefined 的类型错误，未放宽接口。独立样式验证包含图标、Button、Trigger 与菜单样式。交互文档覆盖基本/受控/自定义/空状态，三份架构说明已同步。最终文档构建 187 页（react-bloom-docs-final.log，NativeExit=0）、测试页生产构建、graphify update 和 diff 检查通过；包含新增用例的完整 React Chrome 回归 432/432（react-bloom-acceptance.log，NativeExit=0），用时 19 分 20 秒，失败、待定、跳过均为 0。
- 整体迁移、完整公共 API 审计、全仓 Vue、其他浏览器与发布验收仍未完成；最终迁移版本仍需多轮完整验收。

### 2026-11-07 KvList 共享层准备

- 核对 Vue 两个组件、公开类型、HTTP Header 常量、双模型 Foundation、拖拽驱动及动态/排序测试。类型与常量移至 Core，保留 Vue 原入口转发；两端可共用字段 placeholder/data/disabled 合并规则。
- Foundation 增删改改为替换 rows 数组，保留未变行对象及工作 id，使 Adapter 不必依赖 Vue 的深层可变数组响应。新增数组通知/身份与字段覆盖规则测试。
- 修改前 Core 构建产物测试 12/12（react-kv-core-baseline.log）；修改后直接针对源码的测试 15/15（react-kv-core-source.log）。临时源码入口仅改写模块路径，执行后删除；尚未运行修改后的正式构建和 Vue 浏览器回归。
- 为不影响正在运行的 BloomMenu 完整回归，未重建 Core 或改动测试入口。React Adapter、导出、文档示例及组件测试仍待实现，本阶段不计为 KvList 交付。

### 2026-11-07 KvList React 初稿

- React Adapter 初稿复用 Foundation、字段规则和 createListSort，提供双模型/默认值、文本/Header/密码编辑、Bulk 开关、增删清空、自定义字段/工具栏/行操作及原生根引用。模型初始化通知延迟到提交阶段，避免 SSR 和 StrictMode 渲染阶段调用外部回调；嵌套 JSON 在父组件重渲染时按值同步。
- 已写入 SSR 用例、交互测试页、独立样式、文档及可交互示例初稿。React 输入组件实际使用 value/onValueChange，初次类型预检暴露错误接线后已改正；源码与测试页隔离类型预检均通过（react-kv-types-preflight.log、react-kv-browser-preflight.log）。定向 lint 通过。
- 当前完整 BloomMenu 回归仍在执行。KvList 尚未接入根/子路径导出、总样式或测试入口；未构建运行这些新文件，SSR/浏览器用例尚未执行，不能视为交付。

### 2026-11-07 KvList 增量验收

- 完成 React 公共适配与根/子路径类型导出、独立样式、JSON/Bulk 受控与默认值、文本/Header/密码输入、Bulk 切换、增删清空、四类自定义内容及原生根引用；没有另写解析器或排序实现。文档覆盖双模型、原始 Bulk 格式、空工作行、字段覆盖和各编辑模式。
- 正式 React/浏览器类型、文档类型、Core/React 构建、定向 lint、独立样式与测试页生产构建通过。文档最终构建 188 页（react-kv-docs-final.log，NativeExit=0）。模型/字段 Core 单元与全部 React 单元/SSR/独立样式 214/214（react-kv-unit.log，NativeExit=0）。
- React 首轮定向 11/12（react-kv-focus.log，NativeExit=1）发现拖动中卸载留下 fallback 镜像。核对共享驱动全部调用方只有 Vue/React KvList；检查已安装 SortableJS，destroy 调用无事件参数的 _onDrop 后清空镜像引用，但该路径不移除 DOM。
- Vue 新增真实拖拽卸载用例也先失败（vue-kv-drag-red.log，NativeExit=4）：根级新增用例的残留又影响三个既有拖拽用例。共享驱动在 destroy 前保存属于当前 active 实例的公开 ghost/clone 引用，销毁后移除这两个节点；不使用全局选择器清理其他实例。
- 修复后 React 定向 12/12（react-kv-focus-final.log，NativeExit=0），Vue 全部 6 个 spec 40/40（vue-kv-shared-final.log，NativeExit=0，无重试记录）。覆盖 StrictMode 初始化回调、空键草稿/稳定行身份、重复键/首冒号/raw Bulk、外部深层模型更新、拒绝回写、动态编辑模式、HTTP 建议、属性/禁用覆盖、自定义编辑器、非受控值/引用、真实拖拽、拖动中禁用和卸载，以及文档切换。
- 永久套件已纳入全部 12 项，临时 focus spec 删除。README、QUICK-START、ARCHITECTURE 同步；完整 React Chrome 回归 444/444 通过，耗时 20:04（react-kv-acceptance.log，NativeExit=0）。
- 整体迁移、完整公共 API 审计、全仓 Vue、其他浏览器与发布验收仍未完成；最终迁移版本仍需多轮完整验收。

### 2026-11-07 PanelGroup React 增量验收

- 新增 PanelGroup、Panel、PanelSeparator，复用现有 Core 面板控制器、尺寸测量、键盘/指针处理、重排和内容过渡。React 外部存储镜像 axes/fill 字段，字段变化只通知视图，不递归触发控制器同步；动画使用已有 framer-motion。
- 保留挂载时确定的 sized/fill 角色、受控与非受控尺寸、动态 defaultSize 的双击恢复、百分比容器重测、折叠回调、keepMounted/姿态离场、pin、RTL、动态方向、独立/自动分隔条、嵌套、禁用及原生引用。方向切换的内容订阅清理保留 React 已写入的新交叉轴样式。
- 根/子路径导出、独立样式、SSR/订阅/样式用例、浏览器 fixture、完整属性文档及交互示例已接入；README、QUICK-START、ARCHITECTURE 同步。正式 React/浏览器与文档类型、构建、定向 lint、测试页生产构建通过。最终文档构建 189 页（react-panel-docs-final.log，NativeExit=0）。
- 全部 React 单元/SSR/独立样式及 Core 面板测试 225/225（react-panel-unit-final.log，NativeExit=0）。Vue 4 个面板 spec 52/52（vue-panel-shared.log，NativeExit=0）。
- 首轮 React 定向 16/19（react-panel-focus.log，NativeExit=3）：三个用例在键盘尺寸动画尚未完成时开始拖拽，得到 227/228 而非假定的 230。共享引擎明确以 size.get() 为拖拽起点；用例改为先断言已达到 210px，再验证 RTL、方向切换和重排后的拖拽，不据此声称修复运行时缺陷。
- 最终 React 定向 19/19（react-panel-focus-final.log，NativeExit=0），覆盖真实指针最终位置、实时回写/事件、Escape 和禁用/卸载/方向变化清理、键盘边界、RTL、重排、折叠保留/离场/首次挂载、百分比重测、引用、嵌套及文档交互与框架切换。永久套件已纳入 19 项，临时 focus 和外部暂存文件均删除。
- 上一轮包含 KvList 的完整 Chrome 回归 444/444 通过（react-kv-acceptance.log，20:04，NativeExit=0）。包含 PanelGroup 的完整回归 463/463 通过，耗时 21:08（react-panel-acceptance.log，NativeExit=0）。
- 整体迁移、完整公共 API 审计、全仓 Vue、其他浏览器和发布验收仍未完成；最终迁移版本仍需多轮完整验收。

### 2026-11-07 Icon / IconFont React 增量验收

- 现有 SVG 生成器同时产出 287 个 React 图标模块、Core 图形数据、具名/默认导出和分类目录；逐一验证 Core 图形与 Vue SVG 的标签、属性及几何完全一致。输出按项目配置格式化，仅移除带生成标记的过期图标文件；Vue 清理路径增加工作目录校验。
- Core 提取尺寸/旋转样式、公共属性类型及 IconFont 脚本加载器。脚本按 document 去重，失败移除并释放缓存，SSR 不访问 DOM；Vue 保留原属性及可扩展接口。React 保留生成图标 spin 与通用 Icon loading 两套类名、原生 SVG 属性/事件/ref、symbol 与 children 切换、extraProps 优先级，以及合并的样式、类和事件。
- 主入口和 icon-component 子路径提供通用 Icon；独立 icon 入口提供完整图标集合、catalog 和单图标子路径。KvList、PanelGroup、BloomMenu 移除重复 SVG 路径，改用生成图标。图标生成先于 Core 编译，文档构建也执行该流程。
- 新增完整搜索目录和 IconFont 交互文档；README、QUICK-START、ARCHITECTURE 同步。正式 React/浏览器、文档及脚本类型检查通过；Core/React 构建、定向 lint、测试页生产构建通过。最终文档 191 页（react-icon-docs-final.log，NativeExit=0）。
- 全部 React 单元/SSR/独立样式、Core 图标及生成一致性测试 217/217（react-icon-unit-final.log，NativeExit=0）；额外公共入口/单图标子路径及全图标 SSR 复核所在 8 项全部通过（react-icon-public-final.log）。Vue 图标相关 35/35（vue-icon-shared.log，NativeExit=0）。首次 SSR 用例错误假定所有图标 viewBox 为 48，实际有 1024 的彩色图标；已按各自源数据核对，没有修改正确的图形数据。
- 首轮浏览器 8/10（react-icon-focus.log，NativeExit=2）：远程 symbol 按 24px 容器缩放，断言误期待 20；文档搜索标签误放到 Input 包装层，已用 inputAttrs 传给原生 input。最终定向 10/10（react-icon-focus-final.log，NativeExit=0），包括全部 287 个图标的真实可测几何、尺寸恢复、动画与旋转、动态 symbol、配置合并、前缀/引用、脚本失败重试与成功去重，以及两页文档交互。
- 永久套件纳入全部 10 项，临时 focus 及外部暂存文件已删除。上一轮 PanelGroup 完整回归 463/463（react-panel-acceptance.log，21:08，NativeExit=0）；本轮包含图标及既有组件图标复用的完整回归 473/473 通过（react-icon-acceptance.log，25:54，NativeExit=0）。
- 整体迁移、所有组件的公共 API 审计、全仓 Vue、其他浏览器和完整发布流程仍未完成；最终迁移版本仍需多轮完整验收。

### 2026-11-07 Image React 增量验收

- 新增 Image、ImagePreview、ImagePreviewGroup、ImagePreviewAction 与复合入口，提供公开类型、实例方法、根/子路径、独立及全量样式、完整交互文档。底部内容、错误/加载内容、工具栏及分组动作使用 ReactNode/渲染函数；共用 Core 图片状态、预览动作、拖拽边界、分组导航、弹层堆叠和滚动锁。
- React Adapter 保留受控显隐/索引回写、事件顺序、源列表优先级、注册顺序与更新身份、键盘可编辑目标保护、缩放/旋转/拖拽状态重置，以及源变化/关闭/卸载时的监听器清理。稳定 portal 宿主在 body、指定容器和内联位置间移动，保留自定义输入状态。
- 独立预检 14/14（react-image-focus-preflight-6.log）；早期预检纠正了被 footer/测试控件遮挡的点击、初始 load 事件、缩放档位和 window 事件派发方式。一次预检期间格式化引起 HMR，保留失败日志，不据重跑声称修复运行时竞态。按需样式测试发现基础图标和主题样式缺失，补齐后通过（react-image-style-preflight-final.log）。
- 整合文档首次定向 15/16（react-image-focus-final.log，NativeExit=1），真实暴露 SSR 图片在水合前已加载完成但状态停在 loading。Core syncSource 接收已完成图片状态，Vue/React 均传入当前图片；新增 Core 成功/失败/等待/空源检查和 Vue 真实 SSR 解码后水合测试。Vue 原有 Image 79/79（vue-image-shared.log），修复及新用例后的 80/80（vue-image-shared-final.log，NativeExit=0）。
- 最终 React 主测试页及文档定向 16/16（react-image-focus-final-2.log，NativeExit=0），覆盖图片状态、底部内容、引用、受控事件、操作项、快捷键、拖拽、换图、分组身份/列表/边界/循环、弹层堆叠、容器迁移、SSR 文档水合及 Vue/React 页面切换。全部 16 项已纳入永久套件，临时 focus 与隔离编译/浏览器目录均删除，独立预检服务器已停止。
- 最终全部 React 单元/SSR/独立样式与 Core Image 测试 232/232（react-image-unit-final-2.log，NativeExit=0）。正式 React/浏览器、文档类型检查、定向 lint、主测试页生产构建均通过。新增 Vue 水合测试的定向类型检查通过（vue-image-test-types-final.log）；首次临时配置遗漏 Cypress mount/Vite 声明并误纳入无关 E2E，修正检查范围及既有环境声明后通过，未改变编译器。
- 最终文档构建 192 页（react-image-docs-final.log，NativeExit=0）。README、QUICK-START、ARCHITECTURE 同步。包含图标的上一轮完整 Chrome 473/473（react-icon-acceptance.log，25:54，NativeExit=0）；包含 Image 的 489 项完整回归正在执行（react-image-acceptance.log）。
- 整体迁移、所有组件公共 API 审计、全仓 Vue、其他浏览器和完整发布流程尚未完成；最终迁移版本仍需多轮完整验收。

### 2026-11-08 Transfer 独立预检进度

- React Transfer 复用 Core 根、面板及子项 Foundation，覆盖受控/非受控目标与勾选集合、双向/单向/简单模式、禁用和表单状态、搜索提交、自定义项目/标题/面板/操作图标，以及原生根引用；不新增依赖。内置 Checkbox 显式隔离外层 CheckboxGroup。
- 新增按需样式、5 项 SSR 测试和 8 项浏览器用例。类型检查及 lint 通过；隔离编译后的 SSR 5/5（react-transfer-ssr-preflight.log），按需样式 1/1（react-transfer-style-preflight.log），独立 Chrome 8/8（react-transfer-focus-preflight-2.log，NativeExit=0）。首轮 3/8 因 cy.check 操作组件内部 0x0 隐藏原生输入失败，改为点击可见 checkbox 标签后通过，没有修改组件逻辑。
- React 文档页面与交互示例已写入，但正式导出、主测试入口、永久用例整合和文档构建尚未接入，以免改动正在运行的 Image 489 项完整回归。隔离编译/浏览器目录及服务器已清理；transfer-focus.cy.js 保留用于后续整合。
- 追加边界验证：去重全选、只按有效勾选计算状态、简单单向模式原生 Space 只移除一次，以及原生 Enter 移动和独立面板搜索。最终独立 Chrome 11/11（react-transfer-focus-preflight-4.log，NativeExit=0）；Vue Transfer 31/31（vue-transfer-shared.log，NativeExit=0）。初次原生 Enter 用例用 cy.press 未触发浏览器默认按钮动作，改用既有 CDP keyDown/text + keyUp 方式后通过，未修改 Button。两项文档交互用例暂存于 D:/Temp/sd-react-transfer-doc-cases.js，待正式入口与文档构建完成后验证和纳入永久套件。

### 2026-11-08 Tour 独立适配进度

- React Tour 直接复用 Core 导出的 driver 引擎、Config/Driver 类型、配置归一化及浮层 Foundation，不新增依赖和导航协议。ref 暴露完整原生实例；title/description/footer/progress 使用 React 渲染函数，默认 children 保留原位置。
- 自定义区域使用稳定的 portal 宿主，跨原生浮层替换保留 React 子组件、上下文和输入状态；每次连接创建新的 Foundation，支持 StrictMode 清理重连，并观察浮层尺寸刷新定位。原生步骤/global render hooks、导航接管与 destroy reason 保持原语义。
- 新增 Core tour/style/vendor.scss 以从 Core 的依赖位置加载现有 driver CSS，React 按需入口组合基础与 Tour 样式；Vue 样式入口尚待切换到这一共享入口。未改动正在完整回归的现有运行入口。
- React/浏览器类型检查、lint、隔离 SSR 1/1（react-tour-ssr-preflight.log）、按需样式 1/1（react-tour-style-preflight.log）通过。独立 Chrome 最终 5/5（react-tour-focus-preflight-2.log，NativeExit=0），验证原生实例/导航/回调/销毁、跨步骤状态与上下文、配置 false/接管导航、原生 dialog 内 portal、动态尺寸重新定位。首轮 4/5 因 span 选择器也选中 Button 内部文字/测量节点，改为直接子 span 后通过，没有因此修改组件逻辑。
- 正式公开入口、文档、其余驱动边界与全量整合仍未完成；tour-focus.cy.js 保留用于后续整合。隔离编译及浏览器目录已清理，独立服务器已停止。当前 Image 489 项完整回归仍运行，Transfer 也等待正式入口及文档整合。

### 2026-11-08 Image 全量确认与 Tour 实例配置修复

- Image 完整 React Chrome 回归 489/489，零失败/跳过，27 分 20 秒；react-image-acceptance.log，NativeExit=0。运行进程已经结束，正式入口和构建输出可以继续整合。
- Tour 新增稳定 props 下通过 ref.setSteps 配置两步骤的回归，原实现内部 popover state 渲染无条件 setConfig 导致下一步消失；修复前 5/6（react-tour-imperative-before.log），修复后 6/6（react-tour-imperative-after.log），均已核对 NativeExit。改为比较归一化配置的顶层值，仅实际 prop 变化时 setConfig，保留内部渲染期间的实例配置。
- React 源码及浏览器测试类型检查、定向 lint 通过（react-tour-imperative-types.log、react-tour-imperative-lint.log）。独立服务器与临时页面目录已清理。Tour 动态切换渲染区域、完整原生边界、公开入口/文档与全量整合仍待验证；Transfer 正式接入也尚未完成。

### 2026-11-08 Transfer 正式接入

- 接入 React 根导出、/transfer 按需入口、全量样式、主浏览器 fixture 和永久 Cypress 用例，React Transfer 文档与交互演示进入正式站点。根入口和子路径导入同一实现的 SSR 断言已补齐。
- React 源码/浏览器类型检查、文档类型检查、定向 lint、测试页生产构建、git diff --check 通过。React 单元/SSR/样式 228/228（react-transfer-unit-final.log）；文档 193 页构建成功（react-transfer-docs-final.log）。此前 Vue Transfer 31/31 的验证仍适用，本次未修改共享 Foundation 或 Vue 代码。
- 正式测试页和静态文档的 Transfer Chrome 测试 13/13，40 秒，零跳过（react-transfer-focus-final.log，NativeExit=0）；涵盖受控拒绝/接受、选择/移动事件顺序、过滤与提交、简单/单向模式、禁用与 Form、渲染函数、原生键盘及文档框架切换。临时 focus 文件及文档用例草稿已移除，13 项用例保存在 switch.cy.ts。
- 扩充后的 502 项完整 Chrome 回归待结果，不能以定向结果替代全量或跨浏览器结论。Tour 和其余组件仍需继续迁移和验证。

### 2026-11-08 Tour 文档与交互演示预检

- 新增 React Tour 文档及 TourDemo，逐项对照安装的 driver.js 1.10.2 类型核对全部 36 个 Config 字段，并列出完整实例方法、React 渲染函数、配置更新及销毁原因；同步修正文档中 Vue Tour 旧版本号及 HookOptions 缺少 reason 的说明。
- 演示包含确认后继续、自定义页脚、跨步骤备注、原生进度和完成按钮、单元素居中高亮。独立源码别名页面（不是正式打包入口或 Astro 水合页面）类型检查、lint 通过；Chrome 2/2（react-tour-demo-preflight-2.log，NativeExit=0）。首轮 0/2 是在默认动画尚未完成时连续导航/销毁，未进入原生回调完成阶段；测试改为等待实际 onHighlighted 状态后操作，未修改引擎或关闭动画。
- 独立服务器与 .tour-demo-check 已清理。tour-demo-focus.cy.js 保留用于正式文档页面整合。Tour 公共入口、正式文档构建/水合、动态切换 render 区域和更多原生边界仍待验证；目前文档 demo 的 /tour 公开导入将在正式接入时生效。
- Transfer 502 项全量 Chrome 回归仍在运行，日志 react-transfer-acceptance.log；已验证进程存活，不修改其运行入口和构建输出。

### 2026-11-08 Tour 动态区域恢复修复

- 新增打开状态下原生/自定义标题、描述、页脚、进度切换回归，复现原生标题与 React 标题叠加（react-tour-dynamic-before.log，6/7，NativeExit=1）。Core 原先仅在 popover 首次出现时移除原生内容，未响应后续区域变化。
- Core Foundation 新增 syncSlots，保存原生子节点及显示状态，区域切换时移除/恢复这些节点，保留原生按钮事件与 footer/progress 优先级。React 在 portal 宿主布局同步时调用；Vue 在 onUpdated 调用。新增 Core 回归以及 Vue 动态插槽浏览器用例。
- 隔离 Core 编译通过，Core 测试 8/8（tour-core-dynamic-preflight.log）；独立 React Chrome 7/7（react-tour-dynamic-after.log，NativeExit=0），确认关闭自定义区域后原生内容和按钮导航恢复。React 使用源码路径映射的类型检查及定向 lint 通过。此处未改动正式 dist，以保护进行中的 Transfer 502 项全量回归。
- Vue 新增用例尚未运行；下一步需验证 Vue Tour 全部用例、补齐正式构建和公开入口/文档水合。正式 Core dist 仍为旧版本，React 新 syncSlots 调用需与新的 Core 构建一起发布，当前常规类型检查应等 Core 构建后再跑。独立服务、编译目录及临时测试副本已清理，tour-focus.cy.js 留待永久套件整合。

### 2026-11-08 Tour 双框架边界验证

- 使用独立 Cypress 配置将 Tour Foundation 指向最新源码，Vue Tour 全部 16/16（vue-tour-dynamic-preflight.log，NativeExit=0），覆盖动态插槽恢复、原生实例/回调、演示与按需样式。未替换正式 Core dist，因此不影响进行中的 Transfer 全量回归。
- Vue Tour 样式改为使用 Core 的 tour/style/vendor.scss，与 React 共用 driver CSS 入口；变更后按需样式复验 1/1（vue-tour-shared-style.log，NativeExit=0）。
- React 增加 onDoneClick/onDestroyStarted 接管、卸载绕过退出钩子、方向键导航及 Escape 清理回归，独立 Chrome 9/9（react-tour-boundaries-preflight.log，NativeExit=0）。销毁退出原因保留原生语义：已有 close 退出请求后 API 清理仍报告 close。
- Vue Tour 源码与新增 slots 测试类型检查、React fixture 类型检查及定向 lint 通过（vue-tour-types-preflight.log、react-tour-boundaries-types.log、tour-boundaries-lint.log）。临时配置、页面目录和独立服务器均已清理。
- Tour 正式根/子路径导出、主浏览器入口、永久用例与正式文档水合/构建仍待接入；两份 focus JS 保留。Transfer 502 项完整回归进程仍存活，继续跟踪原进程和 react-transfer-acceptance.log。

### 2026-11-08 Calendar 配置适配起步

- 核对 Vue Calendar 根组件、config/view composable、props 定义和 Core calendar 模块。现有 Core 已包含配置、日期计算、导航、事件、拖拽和交互规则；React 继续复用这些规则，不用简单日期网格替代完整 Calendar。
- 新增 React calendar/types.ts 的配置/日程类型和 config.ts，匹配 Vue 配置默认值，通过 createCalendarConfigRules 派生视图、隐藏日、日期范围、日程、特殊时间、编辑权限及事件监听器。视图相关 getter 读取当前 host，实例默认事件数组隔离。
- 隔离编译与定向 lint 通过；配置单元 5/5（react-calendar-config-preflight.log，NativeExit=0），覆盖显式 undefined/default、picker + false、视图变更、schedule/Date/listener identity、输入不变与实例隔离。临时编译目录和测试副本已清理。常规全库类型检查因 Tour 新 syncSlots 依赖尚未构建的 Core dist 报错，不作为 Calendar 类型失败；Calendar 独立编译已验证。
- Calendar 仅完成配置适配起步，尚无根组件、视图、事件/拖拽适配、文档和浏览器测试，不能称为可用组件。后续还需整理共享默认配置以避免 Vue/React 默认值漂移。配置单元测试暂引用待正式构建的 dist/calendar/config.js，整合前先构建。
- Tour 的正式接入仍待完成；Transfer 502 项完整回归继续运行同一进程，未更改其运行入口/构建输出。

### 2026-11-08 Calendar 默认配置共享

- 新增 Core calendar/prop-defaults.ts，将 37 项标量默认值集中维护；Vue props-definitions 与 React resolveCalendarConfig 改用同一来源。集合默认值仍分别通过工厂或每次配置解析创建，不共享可变数组/对象。README、QUICK-START、ARCHITECTURE 同步说明迁移状态。
- React 隔离编译及配置测试 5/5（react-calendar-defaults-types.log、react-calendar-defaults-preflight.log），Vue Calendar 定向类型检查（vue-calendar-defaults-types.log）和定向 lint（calendar-defaults-lint.log）通过。React 临时编译目录/测试副本及 Vue 临时类型配置已清理。
- Vue Calendar 全部 29 个 spec 正在使用源码别名配置运行，日志 vue-calendar-defaults-preflight.log，进程会话 49797；尚无最终结果。运行所需 packages/web-vue/.calendar-check.config.ts 暂保留，结束后删除。不要在它运行时格式化/改动 Calendar 来源或重建 Core dist。
- Transfer 502 项完整回归仍使用原会话 46034，日志 react-transfer-acceptance.log，继续等待终态。Tour 入口整合和 Calendar 剩余实现未完成。

### 2026-11-08 Calendar 共享默认值回归与布局适配

- Vue Calendar 全部 29 个 spec、135/135 Chrome 用例通过，零跳过（vue-calendar-defaults-preflight.log，NativeExit=0），覆盖已有拖拽/创建审批、跨日索引、尺寸调整、特殊时间段、locale 隔离、真实过渡和演示等。运行结束后已移除 .calendar-check.config.ts。
- 新增 React calendar/view-layout.ts，通过 Core 计算行列/日期格、实际与扩展日期范围、标题/周数、相邻视图和当前时间线显示。每次解析只生成一次日期格，后续 React 状态适配可使用该布局快照，未复制日期算法。
- Calendar 配置及布局单元合计 9/9（react-calendar-layout-preflight.log，NativeExit=0），新增闰年二月、横向隐藏周末的完整周范围、时间线限制、年/多年格区间验证；隔离编译与 lint 通过。临时编译及测试副本已清理。
- 尚未实现 Calendar 根组件、状态/导航 hook、事件与拖拽适配、视图渲染、文档和 React 浏览器 E2E；上述纯逻辑检查不代表组件交付。Transfer 502 项完整回归仍在原会话 46034 运行，Tour 正式整合仍待完成。

### 2026-11-08 Calendar 事件订阅适配起步

- 新增 React calendar/events-store.ts，复用 Core createCalendarEvents，提供稳定版本快照/订阅与事件集合替换入口。仅代理普通对象/数组，保留 Date 和原生对象引用；通知按微任务批处理，只有事件集合成员变化重建索引，事件字段/元数据修改保留现有索引。
- Core 继续负责归一化、跨日范围查询、创建/删除流程和 resize 状态。适配在 dispose 时取消订阅通知并调用 Core 清理，不增加独立事件协议。
- 隔离编译、定向 lint、事件适配单元 4/4（react-calendar-events-types.log、react-calendar-events-lint.log、react-calendar-events-preflight.log）通过，覆盖归一化与 Date 身份、批量通知/取消订阅、成员创建替换删除与事件顺序、跨日范围、dispose 待发送通知。dispose 单元的 document.removeEventListener 为测试桩，不代表真实 DOM 手势清理已经验收。
- 该适配尚未接入 React hook/组件，StrictMode 生命周期、真实拖拽/resize、外部 props 更新和事件 DOM 注册仍需浏览器验证。临时编译和测试副本已清理，正式测试需要新的 React 构建产物。
- Transfer 502 项完整回归仍在会话 46034 运行，日志 react-transfer-acceptance.log；Tour 正式接入仍待完成。

### 2026-11-08 Calendar React 语言适配

- 新增 useCalendarTexts，复用 Core createCalendarTextsLoader/initializeDateLocale，保持与 Vue 相同的显式 locale、ConfigProvider 文案和周起始加载逻辑；每实例保留 texts，effect 清理后不再提交旧异步结果。
- 独立 StrictMode 浏览器页面 2/2（react-calendar-texts-preflight.log，NativeExit=0），验证 Provider 中英切换、显式覆盖/撤销覆盖、固定英文实例隔离、周起始重载不改变其他实例文案、快速切换与卸载重挂载。该测试未注入受控网络延迟，不宣称额外证明所有异步竞态；竞态序号处理复用既有 Core loader。
- Hook/fixture 定向类型检查和 lint 通过（react-calendar-texts-types.log、react-calendar-texts-lint.log）。独立服务器和临时目录已清理；calendar-texts-fixture.tsx 与 calendar-texts-focus.cy.js 留待 Calendar 正式集成。
- 当前只验证语言适配页面，不代表 Calendar 整体交互或 SSR 水合完成。Transfer 502 项完整回归仍在会话 46034 运行，Tour 正式接入仍待完成。

### 2026-11-08 Transfer 全量完成与 Tour 正式接入

- Transfer 完整 Chrome 502/502，零失败/跳过，29 分 08 秒（react-transfer-acceptance.log，NativeExit=0），会话 46034 已终止并核对退出码。
- Tour 根入口、/tour 子路径、全量/按需样式、主 fixture、12 项永久浏览器用例及正式文档已接入。React 与 Core Tour 单元/SSR/样式合计 249/249（react-tour-unit-final.log）；React/浏览器类型检查、文档类型检查、定向 lint、测试页生产构建、diff 检查通过。初次文档 194 页构建成功（react-tour-docs-final.log）。
- 正式 Core 构建下 Vue Tour 16/16（vue-tour-final.log，NativeExit=0）。React 集成最终 12/12、34 秒（react-tour-focus-final-3.log，NativeExit=0），覆盖组件与实际 Astro 页面水合/框架切换。
- 集成首轮 10/12：长页面 body 中心不可见导致 Cypress 键盘 trigger 未发送；仅为键盘 trigger 加 force。次轮 11/12：标题更新早于原生高亮过渡完成，driver 会忽略尚在过渡中的方向键；测试改为等待 onHighlighted 回调后再发送下一次方向键，组件逻辑未因此修改。保留 react-tour-focus-final.log 和 react-tour-focus-final-2.log 作为原始失败证据。
- 补充说明 destroy 在已有关闭请求后保留原请求 reason；文档措辞修订后的重建仍运行：会话 87777，react-tour-docs-final-2.log。构建完成后启动 514 项完整 React Chrome 回归。两份 Tour focus JS 已删除，全部用例保存在 switch.cy.ts。
- Calendar 适配仍在实现，尚无完整根组件/视图/交互，不能以本轮 Tour 通过声明全部迁移完成。

### 2026-11-08 Tour 全量启动与 Calendar 导航适配

- Tour 文档修订重建完成，194 页（react-tour-docs-final-2.log，NativeExit=0）；已启动包含 Tour 的 514 项完整 Chrome 回归，日志 react-tour-acceptance.log，会话 28651。运行期间保持正式入口/构建输出不变。
- 新增 Calendar view-controller，复用 Core navigation 与已有布局适配管理视图日期、选中日期、方向及范围快照；ready 前不触发 view-change，ready 后通过 host.nextRender 保留提交后的回调时机。范围内目标日期更新及选中日期更新不重建布局。
- 新增导航单元 4 项，连同配置/布局/事件合计 17/17（react-calendar-navigation-preflight.log，NativeExit=0），验证初始周归一化、范围内日期用于窄视图、隐藏周末且周日起始的前后导航、重复同日选择与日期格缓存。隔离编译和 lint 通过（react-calendar-navigation-types.log、react-calendar-navigation-lint.log）。临时编译/测试副本已清理。
- 导航测试的 nextRender 使用 Promise.resolve，并未证明 React 提交后的事件时序；仍需根 hook/组件完成后用真实浏览器验证。Calendar 视图/事件/拖拽适配尚未接入成完整组件，不能据此宣称迁移完成。

### 2026-11-08 Calendar 事件 Hook 与 StrictMode 验证

- 新增 useCalendarEvents，通过 useSyncExternalStore 订阅事件适配；配置/emit 使用当前 host，集合成员替换后同步，局部创建不会因无关父渲染重置。每实例复制输入事件和 Date，清除实例内部方法/DOM 注册，避免 StrictMode 初始化及新实例重用旧控制器闭包或修改父输入。
- 清理使用可撤销微任务：StrictMode 同步 reconnect 保留控制器，真实 unmount 清理订阅及 Core 监听。该 Hook 仍待 Calendar 根组件接入。
- 独立 StrictMode 页面初始 2/2（react-calendar-events-browser.log），覆盖创建/30 分钟对齐、删除顺序、输入不变、卸载重挂载、替换集合及动态删除权限。补充纯日期字符串后复现 UTC 解析偏差，2/3（react-calendar-events-dates-before.log）；修复为只复制 Date 对象，字符串仍由 Core 解析，最终 3/3（react-calendar-events-dates-after.log，NativeExit=0）。
- Hook 与 fixture 类型检查、lint 通过（react-calendar-events-hook-types-final.log、react-calendar-events-hook-lint.log）；独立服务和临时目录已清理，fixture/focus JS 留待正式 Calendar 整合。尚未验证真实 resize/drag 手势或完整 Calendar DOM 注册生命周期。
- 514 项完整 React Chrome 回归仍在会话 28651 运行，日志 react-tour-acceptance.log；未改变其入口与构建产物。

### 2026-11-08 Calendar 导航 Hook 与真实提交验证

- 新增 useCalendarView，将共享导航控制器接入 React layout 提交队列；prop 变化同步 view/viewDate/selectedDate/可用视图/周起始/隐藏日，卸载后取消待提交回调。实时更新复用 Core clock，按分钟对齐且 effect 清理停止计时。
- 独立 StrictMode 页面最终 4/4（react-calendar-view-browser-final.log，NativeExit=0），验证 view-change 回调读取到的 DOM 日期等于载荷日期、外部日期与视图更新、缩小视图保留目标、选中日期清空、导航与卸载同批时不触发旧回调、重挂载及实时钟启动/停止。时钟用例使用 Cypress 控制浏览器时钟；导航提交断言使用真实 React 渲染。
- React 全部源码及浏览器 fixture 类型检查通过（react-calendar-view-all-types-final.log），定向 lint 通过。首轮类型检查因测试 fixture 的 Object.defineProperties 返回类型仅保留 ready 报错，改为 Object.assign 本地配置对象，保留 getter 且无需类型断言。
- 独立服务器与临时目录已清理，calendar-view-fixture.tsx/calendar-view-focus.cy.js 留待完整 Calendar 整合。Calendar 根视图、事件 DOM、拖拽/resize 和正式文档仍未完成。514 项完整回归仍在会话 28651 运行，日志 react-tour-acceptance.log。

### 2026-11-08 Calendar 标题栏初步接入

- 新增内部 CalendarHeader，使用共享导航控制器处理前后范围、视图选择、扩大视图和今天导航；保留视图专用标题优先、整体标题栏覆盖、自定义前后/今天内容、显示开关、状态样式。导航按钮 type=button，前后按钮接受可访问名称，视图按钮提供 aria-pressed。
- 独立 StrictMode 浏览器 3/3、2 秒（react-calendar-header-browser-final-2.log，NativeExit=0），覆盖表单内导航不提交、最大视图标题语义、内容优先级/恢复、今天状态和整体覆盖/显示开关。初始两轮各 1/3 为测试配置问题：未开启 clickToNavigate、使用空默认文本、把包含今天的当前年份当作不包含今天。改为真实语言 Hook 并固定测试日期，上一年份验证今天跳转；保留失败日志。
- React 源码及浏览器 fixture 类型检查通过（react-calendar-header-types-final.log），定向 lint 通过。独立服务器与临时目录已清理，fixture/focus JS 保留等待正式组件整合。
- 标题切换动画、完整公开 render 参数/Calendar 根组件、格子/事件/拖拽与正式文档尚未完成。514 项完整 React 回归仍在会话 28651，日志 react-tour-acceptance.log。发现 package.json 中 /transfer 导出重复，待全量回归结束后清理，避免运行中更改包解析输入。

### 2026-11-08 Calendar 标题过渡

- 新增 CalendarTransition，复用 Core runCssTransition 和 Calendar 原有 slide-fade 样式，保留离场 React 子树直至动画结束，快速反向复用同 key 子树；离场容器 inert/aria-hidden，防止旧标题继续交互。初次显示不播放进入动画，effect 清理取消动画帧和计时器。
- Header 按视图/起始日期切换，使用控制器方向。原有标题内容实时更新，整体 header 覆盖或隐藏 titleBar 时卸载过渡容器。
- 独立 StrictMode Chrome 4/4（react-calendar-transition-browser.log，NativeExit=0，3 秒），含原有标题行为及左右方向、离场 inert、快速往返后单一容器/无残余动画 class、过渡中卸载后重挂载。React 全量源码/fixture 类型检查及定向 lint 通过（react-calendar-transition-types.log、react-calendar-transition-lint.log）。独立服务器及临时目录已清理。
- 完整 Calendar 根组件/公开参数、时间列、日期格、事件 DOM/拖拽及文档仍待实现。514 项完整 React Chrome 回归仍运行于会话 28651（react-tour-acceptance.log），未修改其运行入口或构建产物。

### 2026-11-08 Calendar 时间列

- 新增 CalendarTimeColumn，复用 Core surfaces.timeCells 与 minutesToPercentage/日期格式化，使用共享样式；支持全天标签、12/24 小时、末尾非完整时间格、当前时间与横纵方向、自定义时间格/当前时间标签完整参数。
- 独立 StrictMode Chrome 3/3、1 秒（react-calendar-time-browser-final.log，NativeExit=0），验证 50px 完整格/25px 半格、12 小时与语言切换、当前位置 70%→90%、横向后清除旧内联 top、自定义参数/恢复默认及隐藏标签。首轮 1/3 为测试预期大小写不符（All Day 与 PM），修正断言，组件无对应逻辑修改；保留 react-calendar-time-browser.log。
- React 全部源码及浏览器 fixture 类型检查通过（react-calendar-time-types.log），定向 lint 通过（react-calendar-time-lint.log）。独立服务器和临时目录已清理；fixture/focus JS 保留等待完整组件整合。
- 完整 Calendar 根组件、日期格/事件/拖拽、正式文档仍未完成。514 项完整 React 回归仍在会话 28651，react-tour-acceptance.log；本轮未更改其入口或构建产物。

### 2026-11-08 Tour 全量完成与 Calendar 日期格 Hook

- Tour 集成后的完整 React Chrome 514/514，零失败/跳过，29 分 43 秒（react-tour-acceptance.log，NativeExit=0）；会话 28651 已结束。此前 Transfer 全量 502/502 已通过。完整测试未包含尚未整合的 Calendar；不能据此声明全迁移完成。
- 新增 useCalendarCell，接入共享 cell rules/cell-interaction、实时 host/props、局部触摸状态、重叠计算、原生监听与 StrictMode 生命周期。每次提交同步监听集合；卸载清理 Core 手势监听和计时器。
- 对照 Vue creation-approval.cy.ts 确认待审批创建在日期格卸载后仍可按原日期提交，整个 Calendar 卸载后由事件管理器 disposed guard 拦截。移除了初稿错误的日期格级异步取消；未改动 Core。初稿 3/3 不作为正确契约证明，最终测试已替换该断言。
- 独立 StrictMode 浏览器最终 4/4、1 秒（react-calendar-cell-browser-final-2.log，NativeExit=0），覆盖选中/禁用监听更新、原生鼠标拖动占位与 30 分钟对齐的创建载荷、日期格卸载后审批及重挂载、活动手势卸载后无 hold/创建回调。fixture 使用空事件查询与 DnD 桩，仅验证日期格适配/创建载荷，不证明事件存储、真实事件拖放或完整渲染。
- React 全部源码/fixture 类型检查及定向 lint 通过（react-calendar-cell-types-final.log、react-calendar-cell-lint-final.log）。独立服务与临时目录已清理，focus JS/fixture 保留等待完整整合。
- 全量回归结束后删除 package.json 中完全相同的第二个 /transfer 导出声明；解析验证仅一处且目标仍相同。Calendar 完整 Cell View、公开 cell info 导航方法、事件视图、根组件、文档及后续全量回归仍待完成。

### 2026-11-08 Calendar 事件视图

- 新增内部 CalendarEventView，复用 Core event rules/interaction 和 PerformantEllipsis；接入真实事件 DOM 注册、动态监听、权限、时间/跨日片段、样式、全天/视图/通用内容优先级、缩放入口、原生删除通知和带过渡的删除控件。删除控件支持 Enter/Space。
- 原生事件根监听早于 React 合成冒泡，初稿点击删除会额外触发普通事件 click。新增用例复现 6/7（react-calendar-event-click-before.log），将删除 click/keydown 直接绑定在原生目标拦截后 7/7（react-calendar-event-click-after.log）。缩放手柄通过捕获阻止拖拽启动。
- 最终独立 StrictMode Chrome 8/8、3 秒（react-calendar-event-browser-final.log，NativeExit=0），覆盖 DOM 注册/注销、权限变化、内容优先级、跨日片段、真实 store 键盘/鼠标删除、stage 2 原生通知、真实 Core 鼠标缩放、hold 清理及原生 drag 入口路由/手柄阻止。DnD 回调仍是 fixture 记录桩，未证明跨日期拖放。
- 初轮 3/5 的另外两项是 fixture 错误：缩放容器缺少 data-start，且误以为 stage 3 会发 stage 2 的 event-deleted DOM 通知；修正 fixture 并分别测试两种删除阶段，保留 react-calendar-event-browser.log。
- React 全源码/fixture 类型检查和定向 lint 通过（react-calendar-event-types-final.log、react-calendar-event-lint-final.log）。独立服务器及临时目录已清理；fixture/focus JS 保留等待正式 Calendar 整合。Calendar Cell View、事件删除离场容器、完整 DnD/根组件/公开 API/文档仍待完成。

### 2026-11-08 Calendar 日期格视图与事件离场

- 新增 CalendarCellView，组合已有 Cell Hook/事件视图与共享规则，覆盖日期/内容/事件/整体覆盖入口、数字 schedule 分栏与独立事件集合、特殊时段默认/日程覆盖、事件计数、当前时间线、创建占位。Cell info 补齐 goNarrower/goBroader/broader/narrower，传给原生交互与渲染回调。
- 新增 CalendarEventList，保留离场事件及原始重叠几何 props，复用 Core CSS transition；离场事件 inert/aria-hidden，动画结束后移除，最后一个事件离场后移除容器。stage 2 局部删除后保留源事件，日期格卸载再由 Core stage 3 最终删除。
- Cell View 最终 5/5（react-calendar-cell-view-browser-final-2.log），初轮 2/5 为错误的日视图默认计数预期及 Cypress have.attr 改变后续 subject；中间 4/5 的动画断言改为在同一 DOM 回调检查 inert/几何后通过。动画中间态用例将 CSS 时长设为 1 秒以稳定观测，最终删除用例仍使用默认时长。保留原始/中间/debug 日志，不把调整测试称作组件修复。
- Cell View、Cell Hook、Event View 合并 StrictMode 浏览器回归 17/17、8 秒（react-calendar-cell-combined-browser.log，NativeExit=0）。使用真实事件存储、缩放与删除生命周期；DnD 仍为桩，尚未覆盖跨日期拖放或完整 Calendar 根组件。
- React 全源码/fixture 类型检查与定向 lint 通过（react-calendar-cell-view-types-final.log、react-calendar-cell-view-lint-final.log）。独立服务器、临时入口与合并 spec 已清理；原始 focus JS/fixture 保留等待正式整合。完整 headings/all-day resizer、DnD、root/API、文档及后续全量回归仍待完成。

### 2026-11-08 Calendar 星期/日程标题与全天区域

- 新增 CalendarHeadings，复用 Core surface rules/all-day resizer 与 Cell View；支持星期尺寸/隐藏日、星期键盘选中、日程标题及完整 heading cell 参数、自定义全天事件优先级、全天事件筛选、鼠标/触摸尺寸调整，视图/方向/全天开关变化或卸载时清理活动手势。
- 首轮 0/5 揭示 useCalendarCell 的实时 Proxy 直接以 React 冻结 props 为目标，日期对象更新违反 Proxy invariant。改为浅复制可变目标后转发最新 props。保留 react-calendar-headings-browser.log；后续真实多日期/视图切换通过。
- 共享 Core createCalendarTexts 在英文 locale 缺少 weekdaysShort/Min 时产生空紧凑标签；增加 full weekday→3 字符 short→2 字符 min 回退。新增单元先失败（calendar-abbreviations-before.log）后 21/21（calendar-abbreviations-after.log）。Core 正式构建通过（calendar-headings-core-build.log）。Vue locale-controls 同步增加 en/en-us 的 Monday/Mon/Mo 断言，语言/隔离/加载竞态/surfaces 合计 12/12（vue-calendar-headings-locale.log，NativeExit=0）。
- React headings 最终 6/6、2 秒（react-calendar-headings-browser-final-2.log），包括触摸取消；此前所有已实现 Calendar 片段合并回归 38/38、19 秒（react-calendar-headings-combined.log，NativeExit=0），该合并发生在最后新增 touchcancel 用例之前。
- 中间 resizer 卸载/方向测试未等待 React 提交就发送下一次 document move，补充 DOM 提交断言后通过；未修改组件清理逻辑来掩盖测试时序。保留 react-calendar-headings-browser-after.log。
- React 全源码/fixture 类型检查、定向 lint、相关 diff 检查通过。独立服务、临时入口及合并 spec 已清理，原始 fixture/focus JS 保留。Calendar Body/root、真实跨日/跨实例 DnD、完整公开 API/文档、正式集成全量回归仍待完成，不能将片段通过视为完整迁移完成。

### 2026-11-08 Calendar 主体网格与光标时间

- 新增 CalendarBody，复用 Core body controller/surface rules，渲染日期网格并转发 Cell View 内容入口，按主体容器设置网格变量；鼠标/触摸光标时间通过共享 shrink CSS 过渡进入/离开，离开期间保留最后文本/位置。
- 初轮 3/4（react-calendar-body-browser.log）复现同一主体实例切到月视图后残留光标标签；在视图/范围起始/方向变化的 layout 阶段清空坐标后 4/4（react-calendar-body-browser-final.log）。没有更改 Core 算法。
- 补充真实跨日期缩放：原生鼠标在事件缩放手柄开始，主体用 document.elementFromPoint 找到指针下的新日期格，Core 提交结束日期从 11 月 3 日变为 11 月 4 日 11:30。最终 5/5、3 秒（react-calendar-body-browser-final-2.log，NativeExit=0），另覆盖周/日/月/年格数、全天筛选、自定义格内容、横纵光标坐标、触摸结束与重挂载。
- React 全源码/fixture 类型检查及定向 lint 通过（react-calendar-body-types-final.log、react-calendar-body-lint-final.log）。独立服务和临时入口已清理，fixture/focus JS 留待正式整合。
- 本轮的跨日期行为是 resizeX 缩放，不是事件拖放；DnD 仍为 fixture 桩。完整 Calendar 根组件/整体主体覆盖、真实跨日/跨实例事件拖放、公开 API/文档与正式集成全量回归仍待完成。

### 2026-11-08 Calendar 原生拖放适配

- 新增 useCalendarDrag，React 实例共享 Core drag session，通过实时 host 转发接入事件存储、视图、触摸状态与回调；StrictMode 每次挂载创建可清理控制器。useCalendarCell 保持 cell info 对象身份稳定，使 Core 拖出比较能够取消悬停导航。
- 独立 StrictMode Chrome 原生 DragEvent/DataTransfer 集成 6/6、2 秒（react-calendar-drag-visual-after.log，NativeExit=0），覆盖同实例跨日、跨实例移动且不依赖删除权限、目标拒绝、目标卸载后延迟审批、拖出取消悬停导航、同任务开始结束拖动。使用真实事件存储；不等于操作系统原生拖动引擎验证。
- 快速拖动回归先 5/6 失败（react-calendar-drag-visual-before.log），暴露共享 Core 未清理零延迟视觉任务，dragend 后重新添加隐藏原事件的 class。Core 跟踪定时器与元素，在结束、卸载、新拖动时清理 ghost/original class。Core 14/14（calendar-drag-core-tests.log），新增结束/卸载两条回归；Vue 拖放边界同步新增测试，8/8、7 秒（vue-calendar-drag-regression.log，NativeExit=0）。Core 构建通过。
- React 日期格 hook 回归 4/4、2 秒（react-calendar-drag-cell-regression.log），全源码/fixture 类型检查、定向 lint 与相关 diff 检查通过（react-calendar-drag-types-final.log、react-calendar-drag-lint-final.log）。独立服务及临时入口清理，fixture/focus JS 保留等待正式整合。
- Calendar 根组件、公开 API/导出、文档、整体集成与后续全量测试仍未完成；此前完整 React 514/514 不包含这些 Calendar 内部片段，不能视为 Calendar 已交付。

### 2026-11-08 Calendar 根状态适配

- 新增内部 useCalendar，集中组装按实例隔离的文本/date utils、响应式手势状态、配置、事件存储、视图和 DnD。配置的视图标记读取当前 controller state，避免切换视图后沿用上一渲染的派生配置。公开 host 的 events 指向规范化私有存储，输入仍由 useCalendarEvents 单独同步。
- view 提供稳定的实时读取引用，接入 Vue 同类导航、事件增删、滚动方法、可见事件筛选与当前时间线信息。滚动复用 Core createCalendarScroll；本轮只验证适配器收到的滚动值，尚未接入完整 Calendar Scrollbar。
- 原拖放夹具改用统一 hook，删除重复组装代码。新增根适配夹具与 4 条用例，验证保留首个 view 引用后的导航/实时读取、视图相关 horizontal 配置、增删不修改输入、配置更新后的滚动与语言切换。
- 最终 StrictMode Chrome 合并 10/10、4 秒（react-calendar-root-combined-browser.log，NativeExit=0），包含上述 4 条与全部 6 条原生 DragEvent/DataTransfer 拖放回归。React 全源码/fixture 类型检查、定向 lint、相关 diff 检查通过（react-calendar-root-adapter-types-final.log、react-calendar-root-adapter-lint.log）。临时入口/合并 spec 和独立服务已清理，原始 fixture/focus JS 保留。
- 仍是内部状态适配；Calendar 根 View、Scrollbar/ready 生命周期、完整 render API、公开导出与文档、正式集成及全量回归仍待完成，不构成 Calendar 或整体 React 迁移完成证明。

### 2026-11-08 Calendar 根视图与包入口

- 新增 Calendar 根组件与 props/ref 类型，接入共享 root/surface controller、主题检测、Header、Headings、TimeColumn、Body、真实 Scrollbar、周数、DIY 与各层渲染入口。ready 在提交后的 ready 样式/状态就绪时触发，StrictMode 同实例仅一次；挂载/卸载清理 root controller。视图 ref 公开此前验证的实时 view。
- 根属性区分 Calendar 选项、组件回调和 DOM 属性；已声明的事件通过 emit 转发，cell/event 原生监听与审批通过 Core 配置接入。整格渲染抑制从属 cell/date/content/events/count 自定义入口，保留共享默认规则。完整事件 payload 类型仍待审计补齐。
- CalendarTransition 增加可选 frame style，根视图使用 flex 布局；标题默认行为保持。每个过渡面板的 Scrollbar ref 只清理自身持有的实例，避免离场卸载清空新面板的滚动引用。
- 根视图 5 条与标题过渡 4 条合并 StrictMode Chrome 9/9、6 秒（react-calendar-root-final-browser.log，NativeExit=0），验证完整网格/尺寸、ready、选择与监听、真实 viewport 滚动及导航离场后再滚动、周数/自定义内容、DIY 和卸载重挂载。
- 已接入根导出、calendar 子路径与独立 calendar.scss（含 Scrollbar/Ellipsis 依赖），React 正式构建通过（react-calendar-root-build.log）。首次包入口浏览器运行失败，运行中的 Vite 沿用新增 export 前的 manifest；Node 解析正确，重启专用服务器后，无源码修复即通过正式包入口及单独样式入口 5/5、4 秒（react-calendar-root-package-browser-final.log，NativeExit=0）。保留失败日志 react-calendar-root-package-browser.log，不将重启称作组件修复。
- 全源码/fixture 类型、定向 lint、相关 diff 检查通过（react-calendar-root-types-final.log、react-calendar-root-lint-final.log）。专用服务、临时入口及合并 spec 清理，原始 fixture/focus JS 保留。
- Calendar 完整 API/事件类型/渲染上下文审计、文档、与 Vue 全部场景对齐、正式 harness 整合和后续全量回归仍待完成；包入口可运行不等于整体迁移完成。

### 2026-11-08 Calendar 回调类型契约

- 根据 Core 实际调用点补充共享 CalendarDragData、事件交互/拖动结束/缩放/拖放审批与通知 payload；drag-and-drop 改为引用共享类型，删除内部重复声明。Vue Calendar types 与 React 类型入口均转出这些契约。
- React CalendarProps 为创建、拖放、缩放、点击、长按与日期格事件提供具体 payload 推断；保留任意原生 cell/event 监听的扩展入口。创建审批通过 resolve(boolean | CalendarEventInput)，拖放/缩放审批通过返回值；外部拖放候选尚未完整规范化，类型不承诺其具有 delete/isOverlapping 等所有实例方法。event-dropped 可能携带拒绝后的候选或缺失事件，保留相应联合类型。
- 新增公开包入口编译用例 calendar-callback-types.tsx，覆盖正向推断与错误用法的 @ts-expect-error（未规范化对象调用实例方法、创建替换对象缺少日期）。Core 构建、React 构建与全部源码/fixture 类型检查通过（calendar-callback-core-build.log、react-calendar-callback-build.log、react-calendar-callback-types-final.log）。
- 根 fixture 的 cell/event 回调直接解构已推断 payload，真实浏览器确认 cell 日期/当前 view/cursor Date、原生事件类型/事件标题/时长及事件点击不触发 cell 回调。正式子路径/独立样式 StrictMode Chrome 6/6、4 秒（react-calendar-callback-browser.log，NativeExit=0）；Core 拖放 14/14（calendar-callback-core-tests.log）。定向 lint/diff 检查通过。
- 独立服务与临时入口已清理。本轮不改变 Core 交互算法，也未完成 Calendar 全部 Vue 场景对照、文档、正式 harness 整合或全量回归；其余 React 组件迁移继续。

### 2026-11-08 Calendar React 文档与正式根测试入口

- 新增 `/react/components/calendar/` 文档，说明视图/布局/时间/事件/资源属性、审批语义、回调、render 参数、ref 方法与输入事件私有复制行为。新增 CalendarDemo（多视图、横向、资源、全天、自定义事件）、CalendarPickerDemo（受控选择/日期限制）、CalendarApprovalDemo（真实拖动后延迟批准/取消）三个 React 示例，使用正式组件与样式入口及库内 Button。包 README 补充入口和用法。
- 文档导航和菜单顶部 Vue/React 对应页切换由现有内容集合自动发现，无额外手写导航分支。React 文档示例类型通过（react-calendar-docs-types.log），完整 docs build:site 195 页通过（react-calendar-docs-build.log，49.71 秒）。实际 5188 页面身份/内容确认，独立文档 Chrome 4/4（react-calendar-docs-browser.log），覆盖自定义/资源/横向、日期选择、审批创建、框架切换。
- 正式 browser main 增加 `/calendar` 隔离入口，加载 CalendarRootFixture；6 条根组件与 4 条文档测试加入 switch.cy.ts。使用正式 5187/5188 服务的定向合并回归 10/10、21 秒（react-calendar-formal-browser.log，NativeExit=0）。React 全源码/fixture 类型、定向 lint 与相关 diff 检查通过（react-calendar-formal-types.log、react-calendar-docs-lint.log）。临时合并 focus spec 已删除，原始 focus JS 保留便于后续定位。
- 未重跑完整套件，不能将这 10 条通过写成全量通过。其余 Calendar 内部模块测试仍需正式整合，Vue 边界场景对照与缺口修复、更多演示覆盖以及其余组件迁移均继续；此前 514/514 全量结果不覆盖新增 Calendar。

### 2026-11-08 Calendar 内部模块正式回归整合

- 将 root adapter、Body、Cell hook/View、DnD、Event View/store、Header、Headings、texts、time column、view hook 共 12 个夹具的 54 条断言接入正式 switch.cy.ts，增加类型声明与已挂载文档 defaultView 断言，不跳过原有行为断言。根组件/文档 10 条在此前已整合。
- 首次新增独立 calendar.cy.ts 时，Cypress ts-loader/TNB 出现 source-map Debug Failure，0 条测试执行（react-calendar-integrated-browser.log）。按仓库既有单 TS spec 组织合并至 switch.cy.ts 并删除该独立文件；未替换 TNB 或添加类型抑制。
- 最初让 Calendar 路由复用整个测试应用入口，两次运行分别在 Header 第 2/3 条后发生 Chrome renderer crash，CDP 均返回 Inspector.targetCrashed，而 Cypress 父进程持续挂起；确认崩溃后才结束对应执行。保留 react-calendar-integrated-browser-final.log、react-calendar-integrated-browser-rerun.log、react-calendar-integrated-crash-diagnostic.txt。崩溃根因未证实。
- 增加独立 calendar.html/calendar-main.tsx 入口，仅加载 Calendar 夹具和正式 calendar.scss，使用 query fixture 选择；常规主测试应用保持原来入口，根 Calendar 路由仍为 /calendar。同一批原有断言完整通过 54/54、26 秒（react-calendar-integrated-isolated-browser.log，NativeExit=0）。这是一次通过证据，不将入口调整宣称为 Chrome 崩溃根因修复。
- React 全源码/fixture 类型、定向 lint 通过（react-calendar-integrated-types-final.log、react-calendar-integrated-lint-final.log）。临时合并 JS spec 删除，正式 TS spec 保留所有 54 条。
- 后续全量回归预计包含原 514 条、根/文档 10 条、内部模块 54 条，共 578 条。全量结果尚待运行确认。Vue 对照仍发现完整根组件级别的待验面：导航/卸载后的创建审批、特殊时段各轴向边界、缩放审批竞态、更多动态 props/语言/资源组合；内部模块通过不自动证明这些根组件场景。

### 2026-11-08 全量运行期间的根组件边界补验准备

- 完整 React 回归运行中：exec session 68032，日志 react-calendar-acceptance.log，预计 578 条。运行期间未修改它加载的组件、夹具、入口、正式 spec 或文档构建产物。
- 只读对照 Vue creation-approval/prop-boundaries/initial-state 用例后，新增尚未接入入口的 CalendarApprovalLifecycleFixture、CalendarPropBoundariesFixture 与 calendar-root-parity-focus.cy.js（8 条）。覆盖导航且旧格销毁后批准原日期创建、完整根卸载后批准、取消审批、初始 Date 不变、清空选择/外部字符串日期、未知视图/隐藏全部星期、epoch 零值的最小/最大日期。
- 新文件未被当前运行的 main/calendar-main 或 switch.cy.ts 引用，未执行这些新浏览器用例。仅 React 全源码/fixture 类型与新文件 lint 通过（react-calendar-root-parity-types.log、react-calendar-root-parity-lint.log）。全量终止后需接入独立 Calendar 入口运行，发现缺陷再修复，不把已编译的草稿算作浏览器覆盖。

### 2026-11-08 全量运行期间的缩放审批补验准备

- 同一全量 session 68032 / react-calendar-acceptance.log 继续推进，本轮末观察到 74 条通过，未取得终态。
- 对照 Vue resize-lifecycle.cy.ts 新增未接入的 CalendarResizeLifecycleFixture 与 calendar-resize-lifecycle-focus.cy.js（5 条）：move 审批乱序、mouseup 后旧 move 审批、touchcancel、整根卸载后的 move/end 审批。测试控制按钮使用 HTMLElement.click 避免 Cypress 鼠标手势意外提前触发 document mouseup，保持待测手势生命周期。
- React 源码/fixture 类型及定向 lint 通过（react-calendar-resize-parity-types.log、react-calendar-resize-parity-lint.log），尚未执行浏览器测试。连同此前 8 条，共 13 条根边界草稿需在全量终态后加入独立入口并运行；当前正式 spec/入口、组件与构建产物未改动。

### 2026-11-08 全量运行期间的特殊时段补验准备

- 同一全量 session 68032 / react-calendar-acceptance.log 仍在运行，本轮已观察到 144 条通过，尚无终态；未改变运行中的组件、正式入口/spec 或构建产物。
- 对照 Vue special-hours-create/drop/resize，新增未接入的 CalendarSpecialHoursFixture 与 calendar-special-hours-focus.cy.js（16 条）：横纵向正反创建、四个相邻小时的外部拖放、横纵向缩放，以及默认资源禁用规则与指定资源覆盖规则。
- React 全源码/fixture 类型和新文件 lint 通过（react-calendar-special-hours-types.log、react-calendar-special-hours-lint.log）。尚未执行这些浏览器用例，不能计入通过数。连同此前审批/属性/缩放草稿，共 29 条需在当前全量终态后接入独立 Calendar 入口验证。

### 2026-11-08 全量运行期间的完整根组件语言补验准备

- 同一全量 session 68032 / react-calendar-acceptance.log 仍存活并持续输出，本轮已观察到 169 条通过，尚未取得终态。
- 对照 Vue locale-isolation/locale-controls，新增未接入的 CalendarLocaleRootFixture 与 calendar-locale-root-focus.cy.js（5 条）：双实例导航后的语言隔离、同名 ConfigProvider 文案替换、活动全局语言包覆盖、en/en-us 的完整/短/极短星期标题以及切换中文。使用正式包导出的 Calendar、ConfigProvider 和语言注册 API。
- React 全源码/fixture 类型与新文件 lint 通过（react-calendar-locale-root-types.log、react-calendar-locale-root-lint.log）。没有修改运行中的源码/入口/spec/产物；尚未执行新增浏览器测试。累计 34 条根组件边界草稿需要在当前全量终态后接入 calendar-main 并执行，再整合正式 spec。异步语言资源加载竞态仍需单独验证，未把同步语言切换当作竞态证明。

### 2026-11-08 RegexVis React 独立实现草稿

- 当前完整 React 回归 session 68032 / react-calendar-acceptance.log 继续运行，已观察到 216 条通过，未取得终态。未改当前回归加载的模块、入口、正式 spec 或构建产物。
- 对照 Vue regex-vis.vue、types 与 foundation-state 测试后新增 React src/regex-vis/{index.tsx,types.ts} 和独立 styles/regex-vis.scss；直接复用已存在的 Core foundation/parser/layout/types 与共享 SCSS，输入与 flags 使用现有 Input/CheckboxGroup。支持受控/非受控输入和 flags、readonly/selectable、SVG 键盘/鼠标选择、空/错误/footer render 回调及 DOM/ref 透传。StrictMode effect replay 对初次错误通知及字面量 flags 同步去重。
- 新增未接入的 regex-vis-fixture.tsx 与 regex-vis-focus.cy.js（6 条草稿），覆盖受控拒绝/事件顺序/外部字面量、稳定选择与清空、键盘、非受控编辑/惰性量词、自定义内容、readonly。当前 /regex-vis.html 尚不存在，浏览器用例未运行。
- React 源码和 fixture 类型及新文件 lint 通过（react-regex-vis-draft-types.log、react-regex-vis-draft-lint.log）。公共根/子路径导出、总样式、正式 harness、React 文档/demo、正式构建及浏览器验证均待补齐；不把独立源文件或静态通过称为组件已交付。Calendar 34 条新增根边界草稿仍待本轮全量终态后接入运行。

### 2026-11-08 RegexVis 独立入口与 React 文档草稿

- 同一完整回归 session 68032 / react-calendar-acceptance.log 仍运行，已观察到 254 条通过，未取得终态。正式加载路径和构建产物保持冻结。
- 新增独立 regex-vis.html/regex-vis-main.tsx，挂载 StrictMode fixture 并只导入 regex-vis.scss；修正非受控字符节点测试预期为 Core/Vue 实际带引号的标签。6 条浏览器草稿仍未执行。
- 新增 React RegexVis 文档页与 RegexVisDemo/RegexVisCustomDemo，包含受控表达式/flags、Unicode、错误恢复、readonly/selectable、选择通知、自定义空/错误/footer，以及完整属性/回调说明。
- 示例目前直接引用新 React 源码和源码样式，以避免在全量运行期间改包入口/构建；这是暂态，需在终态后添加根/子路径导出、总样式并构建，再改为正式包入口和样式导入。文档尚未重建到 5188，导航/对应 Vue 切换和页面交互未验证。
- React 源码/fixture 类型、React 文档类型及定向 lint 通过（react-regex-vis-entry-types.log、react-regex-vis-docs-types.log、react-regex-vis-docs-lint.log）。正式文档构建、浏览器执行、更多 Vue 图形/Unicode/无障碍/主题场景和正式 spec 整合仍待完成。

### 2026-11-08 RegexVis 隔离编译与服务端渲染验证

- 当前完整回归 session 68032 / react-calendar-acceptance.log 继续运行，已观察到 287 条通过，未取得终态。
- 新增 tests/regex-vis.test.ts 共 6 项 SSR 断言：分组/分支/断言/惰性量词、Unicode 与非 Unicode 代理项分组、字面量有效 flags 与 footer 上下文、错误/空状态、readonly 与 selectable 分离、自定义前缀/原生属性/图形标签。
- 为保持 live dist 不变，用现有 TNB 将 React 编译到独立临时目录，再对同一测试的临时 import 路径副本执行 node --test。隔离编译通过（react-regex-vis-isolated-build.log），渲染 6/6 通过（react-regex-vis-isolated-render.log）。首次 5/6 是测试把只读属性限定为全小写，而 React SSR 输出 readOnly；按 HTML 属性大小写不敏感修正断言，无组件代码变动，保留 react-regex-vis-isolated-render-before.log。
- 定向 lint 通过（react-regex-vis-render-lint.log）。已核验临时目录/文件绝对路径与非链接属性并清理，正式 dist 未更改。SSR 结果不证明交互、样式或水合；公共导出、正式包入口验证和浏览器回归仍待完成。

### 2026-11-08 RegexVis 图形与 Unicode 浏览器补验准备

- 同一全量 session 68032 / react-calendar-acceptance.log 继续输出，已观察到 366 条通过，尚无终态。当前全量正在使用的源码/入口/spec/产物未变。
- 独立 RegexVis 页面增加 query pattern 场景夹具，记录节点 payload、校验通知与 flags 通知。新增 regex-vis-pattern-focus.cy.js 12 条：分组/分支/断言、StrictMode 初始校验与字面量 flags 通知去重、三种 Unicode 范围端点、Unicode/非 Unicode 代理项、切换 u 后重新校验、Unicode 属性、flags 变化保留选择、深色语义填充。
- React 源码/fixture 类型与定向 lint 通过（react-regex-vis-pattern-types.log、react-regex-vis-pattern-lint.log），浏览器尚未执行。连同原 6 条，RegexVis 独立浏览器草稿共 18 条；SSR 6/6 已验证但不替代这些交互/样式断言。全量终态后仍需先接入 Calendar 34 条根边界草稿并运行，再完成 RegexVis 正式导出、包构建/文档构建、浏览器验证与正式整合。

### 2026-11-08 ColorPicker 调色控件 React 适配准备

- 同一完整回归 session 68032 / react-calendar-acceptance.log 继续运行，已观察到 406 条通过，未取得终态。
- 对照 Vue ColorPicker 根、Panel、Palette、ControlBar、GradientThumb 及对应 Core，确认共享颜色格式、渐变、面板状态和鼠标控制器已存在；未复制这些算法。新增 React color-picker/use-control.ts 与 controls.tsx，复用 createColorControl，实时读取坐标值与回调并在卸载时 dispose；视图覆盖饱和度/亮度调色板、色相条及透明度条。
- 新增独立 color-picker-controls.html/main/fixture 与 3 条 JS 测试草稿：坐标映射、色相/透明度独立更新、拖动中卸载后的 RAF/监听清理。仅独立入口，未被运行中的主入口/spec 导入。
- React 源码/fixture 类型及定向 lint 通过（react-color-picker-controls-types.log、react-color-picker-controls-lint.log）。未执行这 3 条浏览器测试。ColorPicker 根组件/面板/渐变拖点/公开 API/文档/正式测试仍需实现；这些内部控件不等于完整 ColorPicker。

### 2026-11-08 ColorPicker 面板状态 React 适配准备

- 同一完整回归 session 68032 / react-calendar-acceptance.log 继续运行，已观察到 433 条通过，未取得终态。
- 新增 color-picker/use-panel.ts，直接适配 createColorPanel。状态/格式/草稿 setter 同步更新同一快照并请求 React 渲染，保证 Foundation 同一次调用中的读写顺序；共享 useAfterRender 接入回写核对，生命周期 epoch 阻止卸载后的旧回调写入。值/模式和格式/alpha 的变化分别同步，不因内联等值 colorModes 数组重置交互状态。
- 新增 panel fixture 和 3 条 JS 草稿，通过独立 controls 页面 query panel 进入，覆盖受控拒绝/接受、disabled 守卫及 alpha 格式同步、外部渐变替换保留选中色标身份。调色控件及状态适配合计 6 条浏览器草稿，尚未执行。
- React 源码/fixture 类型、定向 lint 通过（react-color-picker-panel-types.log、react-color-picker-panel-lint.log）。尚无面板完整 View、渐变拖点、ColorPicker 根公开 API 或文档，不能称为完整组件交付。当前运行中的正式入口/spec/构建产物保持不变。

### 2026-11-08 ColorPicker 渐变色标与完整面板视图草稿

- 新增 gradient-thumb.tsx：共享 createGradientThumb 负责选择/键盘删除/拖动后点击规则，React 通过原生 PointerEvent 接入 owner window，限定活动 pointerId，支持 pointercancel，禁用变化/卸载时移除监听并取消延迟计时。新增 gradient fixture 与 4 条未执行草稿，覆盖跨色标拖动身份、两端限制、键盘删除至少保留两点、其他指针/取消、卸载清理。
- 新增 panel.tsx：完整接入现有 RadioGroup、Input/InputGroup、InputNumber、Select、调色板、色相/透明度、渐变色标/角度、格式草稿、预设与最近颜色，复用 useColorPanel/Core。增加独立 color-picker.scss 及相关控件样式依赖。新增 panel view fixture 与 3 条未执行草稿，覆盖输入提交/最近颜色/预设、渐变模式与键盘加点、alpha/disabled。
- 类型检查与定向 lint 通过（react-color-picker-gradient-types.log、react-color-picker-gradient-lint.log、react-color-picker-panel-view-types.log、react-color-picker-panel-view-lint.log）。ColorPicker 浏览器草稿累计 13 条，均未执行；根组件/公共 API/导出/文档仍待实现。独立页面未被当前完整回归加载。

### 2026-11-08 Calendar 全量终态与测试路径修复

- 完整 React Chrome 回归 session 68032 已结束：578 条，572 通过，6 失败，32:07，NativeExit=6（react-calendar-acceptance.log）。原 514 条、Calendar 文档 4 条与内部模块 54 条通过；6 条 Calendar 根视图测试失败，不能称本轮全量通过。
- 失败截图显示 /calendar 打开 CalendarAdapterFixture 而非 CalendarRootFixture。原因是新增 calendar.html 被 Vite clean URL 优先匹配，遮住了 main.tsx 的 /calendar 条件路由。main 条件与正式 switch 根测试改为 /calendar-root，保持独立内部 /calendar.html 路径。未改 Calendar 组件逻辑。
- 从正式 spec 原样提取 6 条根用例重跑，全部通过，11 秒，NativeExit=0（react-calendar-root-route-browser.log）；类型通过（react-calendar-root-route-types.log）。这是定向修复证据，不替代后续完整重跑。原失败日志与截图保留。
- calendar-main 接入 approval-lifecycle、prop-boundaries、resize-lifecycle、special-hours、locale-root 五个夹具，34 条根边界测试开始执行，session 36080 / react-calendar-root-boundaries-browser.log。入口类型通过（react-calendar-root-boundaries-types.log），本记录时尚未取得运行终态。

### 2026-11-08 Calendar 34 条根边界执行与正式整合

- 首次新增边界运行 31/34，40 秒，NativeExit=3（react-calendar-root-boundaries-browser-before.log）。两条语言失败是夹具使用 month 视图却期待完整 Monday；共享 Core 明确 month 默认 day-sm。测试改为先切换 Week，再验证 Monday/Mon/Mo，不改组件规则。
- 外部日期更新首次得到 November 而非 December。诊断读取 public view 后通过，随后完全不额外触发父组件渲染、保持原步骤的单例也通过（react-calendar-date-diagnostic.log、react-calendar-date-no-extra-render.log）。未确认根因，不把单次重跑当作组件缺陷已修复。首次运行早期曾对 calendar-main 做格式化，不能排除运行入口变更的影响，但无证据确认因果。诊断按钮和临时诊断 spec 已撤销。
- 保持入口/代码冻结重跑完整 34 条，34/34、27 秒、NativeExit=0（react-calendar-root-boundaries-browser.log）；覆盖创建审批生命周期、属性边界、缩放审批竞态、特殊时段横纵向创建/拖放/缩放与资源覆盖、根组件语言更新。
- 将同一批 34 条断言加入正式 switch.cy.ts，仅为辅助函数添加参数类型及已挂载 DOM 非空断言。正式类型检查通过（react-calendar-boundaries-formal-types.log），定向 lint 通过（react-calendar-root-boundaries-lint.log）。预计正式完整套件 578+34=612 条，尚未重跑这轮完整套件。

### 2026-11-08 RegexVis 正式入口、文档与浏览器验证

- 新增根导出、regex-vis 子路径导出、总样式与 README 用法；夹具及 React 文档示例改用正式包入口，删除先前直接跨包引用源码的临时方式。正式 React 构建通过（react-regex-vis-build.log），公开入口 SSR 6/6（react-regex-vis-render-tests.log），源码/fixture 与文档类型通过（react-regex-vis-public-types.log、react-regex-vis-docs-public-types.log）。
- 首次浏览器 17/18，失败因测试用 #controlled svg 判断清空图形，把仍存在的 Checkbox SVG 也算入；改用 .sd-regex-vis-graph，无组件代码修复。保留 react-regex-vis-browser-before.log。正式包入口/独立样式/StrictMode Chrome 18/18、7 秒、NativeExit=0（react-regex-vis-browser.log）。
- 文档站 build:site 196 页通过，52.77 秒（react-regex-vis-docs-build.log）；构建后真实 5188 文档 Chrome 3/3、3 秒、NativeExit=0（react-regex-vis-docs-browser.log），覆盖表达式编辑/字面量 flags/节点选择/readonly、自定义错误与恢复/空状态、Vue/React 对应页切换。
- 18 条组件与 3 条文档断言加入 switch.cy.ts，类型通过（react-regex-vis-formal-types.log）。正式 TS spec、源码、fixture、SSR 测试及 demo lint 通过（react-regex-vis-formal-lint.log）。仓库配置忽略所有 *.js，单独 focus JS lint 返回 No files found，未将其记作通过；这些断言的正式 TS 版本已 lint。
- 专用 5190 Vite 已停止，原 5187/5188 保留。预计正式全量套件 612+21=633 条，尚未运行这轮完整套件。RegexVis 浏览器证据限 Chrome 与上述场景；ColorPicker 13 条草稿尚未执行，根组件/公开 API/文档仍待实现，其余组件迁移继续。

### 2026-11-08 ColorPicker 内部实测与根组件

- 内部 13 条首次 10/13（react-color-picker-internal-browser-before.log）：独立控件/渐变夹具缺少共享 SCSS 要求的 sd-color-picker-panel 父类，产生零尺寸；模式测试直接操作隐藏 radio。夹具补真实面板父类，测试改为点击可见 label，并断言控件高度非零；不使用 force 跳过可见性。随后 13/13、5 秒、NativeExit=0（react-color-picker-internal-browser.log）。
- 新增 ColorPicker 根组件及类型，直接适配 createColorPicker，提供受控/非受控颜色、输入草稿/提交/清除、格式、最近颜色、默认/受控弹层、hideTrigger、renderTrigger/children、只读提示与回调。面板支持 rootProps 透传，隐藏触发器时 ref/原生属性落在面板。ConfigProvider 增加 colorPicker.swatchColors，与 Vue 配置契约对齐。
- 根组件 6 条首次 5/6：输入编辑已经打开弹层，测试第二次点击将其关闭，却期待 true；截图与事件记录证明是测试步骤错误（react-color-picker-root-browser-before.log）。改为验证真实关闭/重开并加清除顺序。新增清除测试先因控件未聚焦、清除按钮 visibility:hidden 失败（react-color-picker-root-browser-clear-before.log）；按真实交互先聚焦输入后点击，无 force。
- 最终根组件 StrictMode Chrome 7/7、4 秒、NativeExit=0（react-color-picker-root-browser.log），覆盖非受控输入/预设、受控拒绝与外部值、初始打开、受控弹层与自定义上下文、只读提示、只读内联面板、清除 value/clear/change 顺序。源码/fixture 类型及 TS lint 通过（react-color-picker-root-types.log、react-color-picker-root-lint.log）。
- 目前使用源码夹具，ColorPicker 尚未添加公开根/子路径导出、总样式入口、README/React 文档与公开包入口验证，20 条用例也未接入正式 switch；更多 Vue 格式/渐变/输入/只读场景仍需对齐。正式已有全量预计 633 条，本轮未再运行完整套件。

### 2026-11-08 ColorPicker 公开入口与文档验证

- 已接入根/子路径导出、总样式入口、README 与 React 文档。公开入口 SSR 5/5（react-color-picker-render-tests.log），React 构建通过（react-color-picker-build.log）。
- StrictMode Chrome 38/38、34 秒、NativeExit=0（react-color-picker-public-browser.log）：内部 13、根组件 7、格式与受控边界 18。新增覆盖十种格式外部同步、HSL/HSV/CMYK 输入转换、Enter 单次提交、HEX8 两种透明度编辑、拒绝渐变加点/预设后由父组件接受。
- 文档 React 类型检查通过；完整文档站 197 页构建通过，55.68 秒（react-color-picker-docs-build.log）。真实文档 Chrome 4/4、4 秒、NativeExit=0（react-color-picker-docs-browser.log），覆盖编辑/清除/只读、渐变键盘加点与最近颜色、自定义受控 Button、Vue/React 切换。
- 42 条测试并入正式 switch.cy.ts，正式套件预计 675 条；类型通过（react-color-picker-formal-types.log）。lint 无错误，正式 spec 2595 行保留已有 no-unused-expressions 警告（react-color-picker-formal-lint.log）；focus JS 被仓库配置忽略，不列为 lint 通过证据。
- graphify update 已运行，旧图缺 source_file 的 104 条警告仍存在，未检测到拓扑变化。全组件迁移、跨浏览器与完整 Vue 场景审计仍未完成；本段定向结果不代表全量通过。

### 2026-11-08 TimePicker 面板适配草稿

- 当前完整 Chrome 回归会话仍在运行（react-color-picker-acceptance.log，switch.cy.ts，预计 675 条）；新增 TimePicker 文件均未接入公共入口或当前正式 spec，未修改运行中已导入的模块和构建产物。
- 已阅读 Vue TimePicker 根组件、panel/range-panel/time-column 与 Core foundation/options/panel/values/scroll-to。新增 React TimePanel、TimeRangePanel、TimeColumn，复用共享时间格式、禁用列表、时间单位选择、范围确认和滚动实现；滚动列卸载时停止该列动画。
- 新增独立 time-picker-panel.html 夹具和 11 条 focus 测试：待确认选择、外部同步、禁用交互、12 小时与 AM/PM、六种非法步长、范围缺失端点确认、移除选项后滚动。源码与夹具 typecheck 通过（react-time-picker-panel-types.log）。这些浏览器用例尚未运行，不能据此声称面板交互通过。
- TimePicker 根组件、通用 Picker 输入适配、公开 API/样式入口、文档和更多 Vue 场景尚未实现；先完成当前完整回归再运行新夹具，避免并发 Chrome 干扰。

### 2026-11-08 共享 React Picker 输入适配

- 新增 _shared/picker-input.tsx，单值显示使用 resolvePickerInputValue，范围显示/禁用端点/焦点使用 createPickerRangeInputFoundation。复用 React useFormItem、useFitWidth、useReadonlyTip、Tooltip、图标和 locale，不复制 Core 日期规则。支持单值/范围、原生输入属性、清除、prefix/suffix/separator、focus/blur、范围当前端点、反馈图标。
- 新增独立 picker-input.html 夹具与 5 条 focus 测试，覆盖原生属性与草稿、键盘清除/命令式焦点、只读反馈、fitWidth、范围端点禁用。源码与夹具类型通过（react-picker-input-types.log），TS lint 通过（react-picker-input-lint.log）。浏览器用例待当前完整回归结束后执行，尚无运行通过证据。
- 完整回归会话 89269 本轮重复确认仍存活，未重启。新增输入适配尚未由公开组件或正式 switch 导入；未触碰运行中构建产物。TimePicker 根组件/状态适配与公开文档仍待实现。

### 2026-11-08 TimePicker 根组件适配草稿

- 新增 types.ts/use-time-picker.ts/index.tsx 与按需 styles/time-picker.scss，使用共享 createTimePickerFoundation 和时间状态/格式工具，支持单值/范围、受控与默认值、输入草稿、确认/即时提交、弹层、禁用/只读、自定义触发器、原生属性、Form change 和 focus/blur。
- 共享 PickerInput 增加内部 renderRoot：将实际原生输入根容器交给 Trigger，避免把命令式输入 ref 当成定位 DOM，也避免额外布局包装。现有公开模块尚未引用新代码。
- 新增独立 time-picker-root.html 夹具与 8 条测试，覆盖输入 Enter、面板待确认、受控拒绝/接受、受控弹层、自定义触发器、只读锁定、范围排序、清除事件顺序、disableConfirm。清除测试使用 Chrome CDP 真实 mouseMoved 激活共享 hover 样式，不以 invoke(show) 或 force 跳过隐藏状态。
- 类型通过（react-time-picker-root-types.log）；新 TS/TSX lint 无输出、退出 0（react-time-picker-root-lint.log）。本轮仍有完整回归会话 89269 运行，因此新增 11+5+8=24 条定向浏览器测试尚未执行，根组件运行正确性尚未证实。公开导出、文档和完整 Vue 场景覆盖继续待办。

### 2026-11-08 TimePicker Vue 边界补测与源码 SSR

- 对照 Vue time-picker/**test**/index.cy.ts 新增 10 条独立边界测试：单值/范围布局属性、选择与确认的 Date 参数、12 小时列的 24 小时输出、AM/PM 禁用小时与隐藏选项、依赖回调的 24 小时参数、方括号字面量、各列步长、epoch=0。新增夹具类型和 TS lint 通过，浏览器尚未执行；当前累计待跑 34 条。
- 使用 Vite middleware SSR 加载源码（watch:null、hmr:false，未重建 dist）执行 4 场景断言，最终通过（react-time-picker-source-ssr.log）：单值格式/原生 id/width/ARIA、范围两端与只读、自定义触发器完整值/Date/可见上下文、禁用原生输入与隐藏清除按钮。初次只读断言大小写错误（React 输出 readOnly），保留 react-time-picker-source-ssr-before.log；改为 HTML 属性不区分大小写断言后通过，未改组件行为。
- 源码 SSR 不是公开入口/打包验证，也不是交互 E2E。完整回归 session 89269 仍在进行，不能报告本轮全量通过；TimePicker 公开导出、React 文档和新浏览器测试执行仍待办。

### 2026-11-08 TimePicker React 文档草稿

- 新增 React time-picker/index.mdx 与 TimePickerDemo.tsx，四个示例覆盖受控单值、受控范围、12 小时与禁用时段、自定义受控 Button 弹层；补属性、事件、实例、格式/范围提交说明。
- 示例暂时引用 web-react/src/time-picker 源码与按需样式，待 34 项新定向浏览器测试通过、公开入口接入后切换到正式包导入。文档 TSX 类型检查通过（react-time-picker-docs-types.log），demo lint 通过（react-time-picker-docs-lint.log）；root pnpm exec tsc 找不到命令，使用 workspace web-react 本地 tsc.cmd，未替换 TNB。
- 新增 4 条文档 focus E2E：编辑与只读/禁用、范围排序、自定义 Button 提交、对应 Vue/React 页面切换。这些断言尚未执行，也尚未运行新的文档 build:site，当前 5188 仍是 ColorPicker 构建。
- 完整 675 条 Chrome 回归仍使用原会话 89269，未重启、未修改其正式 spec 或公开导入模块。

### 2026-11-08 DatePicker 内部表头与日期格

- 按 graphify query 与实际 Vue panels/header.vue、panels/body.vue、use-cell-class-name.ts 读取契约后，新增 React DatePickerContext、DatePanelHeader、DatePanelBody。使用 Core createDatePanelHeaderLabels、createDatePanelBodyFoundation、createDateCellRangeFoundation/getDateCellClassName；保留 Vue 类名、可见导航占位、标签事件、禁用/隐藏格保护、周编号格和 Date cell render 参数。
- 源码与独立夹具类型通过（react-date-picker-primitives-types.log），TS lint 通过（react-date-picker-primitives-lint.log）。Vite middleware SSR 3 场景断言通过（react-date-picker-primitives-ssr.log）：本地化标签/自定义图标/隐藏箭头；选中/禁用/隐藏/排序范围与 Date render 参数；周编号非 gridcell。
- 新增独立 date-picker-primitives.html 与 4 条浏览器断言，尚未执行。当前完整 Chrome session 89269 仍运行，新增文件未接入公开入口/正式 spec，没有重建 dist。DatePicker 根组件、各模式完整面板、范围/时间联动、公开 API 与文档仍未实现；这批仅是内部视图，不代表 DatePicker 可用。

### 2026-11-08 DatePicker 年月季度面板

- 对照 Vue month/year/quarter 三个 panel，新增 DatePeriodPanel，复用 Core getMonthRows/getQuarterRows/getYearRows/getYearHeaderTitle 与已适配表头/日期格。保持对应 panel-* 样式、月份缩写、headerOperations/headerIcons、value/rangeValues、Date cell render、选择/悬停事件和季度比较规则。
- 源码与夹具类型通过（react-date-picker-period-types.log），TS lint 通过（react-date-picker-period-lint.log）；源码 SSR 六场景通过（react-date-picker-period-ssr.log），验证三个模式的格数、完整周期禁用/部分可选以及选中状态。
- 新增独立 date-picker-period.html 与 10 条 focus 断言，涵盖三种周期的完整/部分禁用、模式选择与格数、共享十年导航。尚未运行；DatePicker 共 14 条、TimePicker/共享输入 34 条和文档 4 条待运行。
- 当前正式 675 项 Chrome 回归仍为 session 89269，日志记录 417 项通过，尚未结束。此前 middleware SSR 初次启动日志出现依赖重新优化提示；没有重建 dist，但后续源码 SSR 必须指定独立 cacheDir，避免与运行中 Vite 的依赖缓存可能共用。当前未观察到由此导致的测试失败，不据此声称缓存影响已排除。

### 2026-11-08 DatePicker 日期/周与时钟视图

- 新增 DateCalendarPanel，复用 Core getDateRows/getDateWeekList、methods.startOfWeek/isSameWeek、已适配表头/日期格和 TimePanel。支持周起始日、隐藏外部日期、范围样式、本地/受控日期与时间视图、时间禁用覆盖、头部导航、单元格 render 和事件。
- React 内嵌 TimePanel 显式 visible，保证已挂载时钟同步外部 timePickerValue 与滚动；Vue 对应 DatePanel 目前未传 visible，这一差异需用双端实测核对，不能直接声称完全相同。新增外部时钟同步断言待执行。
- 类型及 TS lint 通过（react-date-picker-calendar-types.log、react-date-picker-calendar-lint.log），独立 cacheDir 的 Vite middleware 源码 SSR 4 场景通过（react-date-picker-calendar-ssr.log）：42 格、周编号/整周选中、并排时钟/禁用回调、范围 time 视图。
- 新增独立 date-picker-calendar.html 及 8 条 focus 断言：周起始 0/1/6、外部日期隐藏、禁用日期、受控拒绝与外部视图、非受控双向切换、已挂载时钟同步。浏览器未运行；当前 DatePicker 22 条、TimePicker/共享输入 34 条、TimePicker 文档 4 条待执行。
- 完整 Chrome 675 条回归 session 89269 仍未结束；没有修改其正式 spec/公共导入或重建 dist。DatePicker 根状态/范围总面板、快捷项/页脚、公开 API、文档尚待实现。

### 2026-11-08 DatePicker 快捷选项与页脚

- 按 Vue panels/footer.vue/shortcuts.vue 新增 React DatePanelFooter 和 DatePanelShortcuts。保留 extra/buttons、today/confirm、confirmBtnDisabled、now、render label、零值 label、原始 shortcut 对象和鼠标进入/离开事件。shortcut 值解析继续交给上层/Core getDateShortcutValue，不在视图渲染期间提前执行工厂。
- 类型与 TS lint 通过（react-date-picker-actions-types.log、react-date-picker-actions-lint.log），独立缓存源码 SSR 3 场景通过（react-date-picker-actions-ssr.log）：额外零值/自定义按钮/禁用确认、空页脚无按钮容器、函数 label 与值工厂未提前执行。
- 独立 date-picker-actions.html 新增 2 条浏览器断言尚未执行。当前 DatePicker 24 条、TimePicker/共享输入 34 条及文档 4 条待跑；DatePicker 上层 Picker/RangePicker 状态组合仍未实现。
- 正式 675 条 Chrome 回归 session 89269 日志已到 498 项通过，尚未终止，不能报告全量通过。下一步先等此轮结束，再执行新的独立夹具并修复实际失败。

### 2026-11-08 完整 675 项回归结果与测试服务隔离

- session 89269 已终止，35:53，675 项中 660 通过、15 失败、NativeExit=15（react-color-picker-acceptance.log）。完整日志的早期 3 项 Copy/Secret/Tabs 元素不存在，截图为根夹具空白；12 项 Calendar 都报同一个动态 dayjs zh-cn 语言文件 fetch 失败。之前只看日志尾部而报告未见失败不准确，已向用户纠正。
- 当前旧 node_modules/.vite/deps/_metadata.json optimized/chunks 为空，dayjs_locale_zh-cn__js.js 文件实际缺失，符合本轮早期源码 SSR 默认缓存重新优化的干扰证据。空白夹具 3 项原因未被独立证明，不能仅凭重跑通过宣称组件缺陷修复。
- 新增 vite.e2e.config.ts 和 serve:e2e：使用独立 node_modules/.vite-e2e，关闭 HMR 与 watch，避免长回归被文件变化/其他 SSR 缓存重写干扰。已停自己创建的旧 5190 Vite，保留原 5187/5188；新 5190 session 37400、日志 react-e2e-server.log。配置关闭 watch 后，任何源码修改后下一轮测试前需重启服务。
- 初次恢复 spec 错用旧 focus 文件的 / 路由，Calendar 未进入指定夹具；日志保留 react-regression-recovery-browser-routes-before.log，未将该次失败当组件问题。随后从正式 switch.cy.ts AST 提取原 3 项失败测试及 5 个 Calendar describe，复测 22/22、32 秒、NativeExit=0（react-regression-recovery-browser.log），覆盖全部 15 项原失败。
- 此结果不是完整 675 项通过证明，仍需在冻结源码和独立测试服务上重跑完整套件。58 条新 TimePicker/共享输入/DatePicker 内部测试已经启动（react-time-date-browser.log），文档 4 条仍待 build:site 后执行。

### 2026-11-08 TimePicker 公共入口与 DatePicker 内部适配验证

- 新增 58 项 Chrome 测试已全部通过（react-time-date-browser.log，22 秒，NativeExit=0），覆盖 TimePicker 面板/根组件/边界、共享输入及 DatePicker 表头/日期格/周期/时钟/页脚/快捷项；已纳入 switch.cy.ts，正式组件与文档回归集从 675 增至 733 项。
- 前两轮失败证据保留 react-time-date-browser-before.log、react-time-date-browser-hover-before.log、react-time-date-browser-focus-before.log。修复 TimePicker Sass 同名 namespace、夹具缺失基础样式与定位父级；纠正 Cypress 属性断言后 subject、React mouseover 事件、CDP AUT iframe 坐标以及弹层测试的明确打开前置条件，没有强制点击或修改可见性绕过验证。
- TimePicker 已提供根与子路径导出、按需/总样式、README 和公开入口文档示例。包 build、源码/浏览器类型检查、文档 React 类型检查通过；新增公开包 SSR 测试 3/3 通过（react-time-picker-render-tests.log）。定向 oxlint 通过但保留 switch.cy.ts:2595 既有 no-unused-expressions 警告，JS focus 文件不计作 lint 覆盖。
- DatePicker 目前只完成内部面板，根组件与范围选择器仍在实现；Vue DatePanel 内嵌 TimePanel 未传 visible，外部时钟同步存在待复现差异。文档构建与 4 项新文档浏览器测试正在进行。当前没有新的全量 100% 通过结论。
- 后续文档 build:site 成功，198 页（react-time-picker-docs-build.log），TimePicker 文档 4/4 Chrome 通过（react-time-picker-docs-browser.log），已合并正式回归集，当前总数 737。
- Vue DatePanel 时钟同步差异已真实复现：新增 external-clock.cy.ts 单值/范围两项在旧代码均停留 09 而非外部更新后的 18，0/2（vue-date-picker-external-clock-before.log）。仅给受 v-if 控制的内嵌 TimePanel 补 visible；两项加原有范围排序三项共 5/5 通过（vue-date-picker-external-clock.log），与 React 已通过的外部时钟测试保持一致。DatePanel 独立挂载夹具有缺省注入警告，未影响时间断言。
- Vue 全包 typecheck 通过（vue-date-picker-external-clock-types.log）；TimePicker 两个根组件/边界夹具已改为公开包子路径与样式入口，React source/browser 类型检查再次通过。graphify update 已执行，既有 104 个缺少 source_file 的旧图节点警告仍在。
- 冻结源码/构建/夹具后重启独立 5190 测试服务，启动正式 737 项完整 Chrome 回归（react-time-picker-acceptance.log）。运行中不能视为通过；需等待终态、检查全部失败及 NativeExit。

### 2026-11-08 冻结全量回归期间的交付缺口复核

- 当前 Vue `components/*/index.ts` 与 React package exports 对比，仍缺 16 个对应子路径：basic-crud-table、cascader、cropper、date-picker、file-previewer、json-form、markdown-render、model-selector、rich-text-editor、sender、table、theme-provider、toolbar、tree、tree-select、upload。此比较只检查入口存在，不能证明已有入口的完整 API 对齐。
- ThemeProvider 已从 React 根包和 config-provider 导出并复用共享 Foundation，因此不是组件完全缺失；但缺 theme-provider 子路径、独立文档页，且 Vue 已有的 tag 属性在 React ThemeProviderProps 中不存在，根节点固定 div，主题/浮层 class 固定 sd 前缀。现有测试只覆盖主题更新、卸载、StrictMode 与全局恢复，不覆盖这些缺口；需补真实回归并修复后再验收。
- Vue/React 文档目录比较中 chat-composer、header-list 是空目录，不计作现存文档页缺失；其余上述 16 个组件均需补齐相应公开交付链路或验收已有等价入口。
- DatePicker 下一步依赖已核对：Core date-picker/header.ts 提供 createDateHeader、跨度/超跨度、范围表头排序与操作；foundation.ts / range-foundation.ts 提供提交、预览、受控值、端点锁定及事件顺序；values.ts 提供快捷值与 Date/timestamp/格式化输出转换。React 上层应直接复用，不能在两个框架中重新写排序、时区或确认规则。
- DatePicker 单面板还需 year/month 表头钻取、左/右/底快捷项与无快捷项时 Now/确认按钮组合；范围面板需双端表头、共享日期/时间视图、重开时视图复位、start/end 禁用回调及自定义单元格端点上下文。根组件还需 Date/Week/Month/Quarter/Year/Range 命名与复合导出、值/弹层/表头受控契约、readonly/form/native input/ref、时区与全部文档。内部面板测试通过不代表这些链路已经存在。

### 2026-11-08 DatePicker 单值组合面板

- 新增尚未被公共入口、现有夹具或正式 switch.cy.ts 引用的 use-date-header.ts 与 picker-panel.tsx，保持运行中 737 项回归的依赖图不变。表头适配直接调用 Core createDateHeader 与跨度函数，支持受控/默认表头、选中值同步、静默重置；组合面板连接五种日期模式、year/month 表头钻取、快捷项位置与延迟值转换、Now/确认组合及额外页脚。
- 源码与浏览器 TS 类型检查、三个新增 TS/TSX 文件的定向 oxlint 通过。独立临时 Vite cacheDir、noDiscovery、无 watch/HMR 的源码 SSR 检查 10 场景通过（react-date-picker-composite-ssr.log），覆盖五种模式、三种快捷项位置、表头钻取隐藏页脚和禁用确认。这不是公开打包或浏览器交互证明。
- 新增 date-picker-composite.html / main.tsx / focus.cy.js，13 条待执行浏览器断言覆盖模式选择、快捷项布局/延迟求值/hover、外部表头更新、钻取、Now 与禁用确认、受控拒绝/回写及非受控静默重置。未并入当前运行的正式回归集，待该轮终态后接入验证。

### 2026-11-08 DatePicker 范围组合面板与浏览器验证

- 新增 range-picker-panel.tsx，连接双端五种模式、Vue 表头模式分支、独立 start/end 禁用日期与时间回调、端点 renderCell、共享日期/时间视图、弹层重开视图复位、快捷项和确认页脚；尚未进入公共导出或根组件。
- 源码/浏览器类型检查、范围面板与夹具 TSX 定向 oxlint 通过，独立源码 SSR 10 场景通过（react-date-picker-range-panel-ssr.log）：五种双端面板、三种快捷项位置、两种表头模式与禁用确认。
- 为避免影响 5190 全量回归，另开 5191 Vite 服务，使用 node_modules/.vite-date-picker 独立缓存并禁用 watch/HMR；只运行独立新夹具。单值组合 13 项 + 范围组合 13 项共 26/26 Chrome 通过，12 秒，NativeExit=0（react-date-picker-composites-browser.log）。当前正式 switch.cy.ts 仍保留 737 项，不在其运行中追加测试；26 项待全量终态后并入。
- 范围测试覆盖五种模式两端渲染与选择、端点内容、双端时钟视图同步及重开复位、禁用小时与锁定端点、year/month 表头钻取保留页脚、三种快捷项位置/延迟求值及确认禁用。DatePicker/RangePicker 根状态适配、公共导出、文档和完整验收仍未完成。

### 2026-11-08 DatePicker 范围表头状态

- 新增 use-range-date-header.ts，复用 Core fixRangeHeaders/sortSelectedRangeHeaders/canShortenRangeHeaders/rangeHeaderOperationKeys/setDateRangeHeader 与 React useDateHeader。覆盖初始双面板间距、选中值排序、受控导航、单次双端通知和 afterRender 后读取最新选中值；卸载后取消待执行重置。
- 新增独立 date-picker-range-header 夹具与 11 项 Chrome 测试，5191 独立服务全部通过（react-date-picker-range-header-browser.log，NativeExit=0）。覆盖五模式初始跨度、倒序选中值、相邻面板不能交叉、扩大间隔后恢复向内导航、受控拒绝/接受/外部替换、批处理重置、卸载取消及等值事件抑制。
- 类型检查与定向 TS/TSX lint 通过；6 个源码 SSR 场景通过（react-date-picker-range-header-ssr.log），确保初始范围间距在服务端同样生效。当前新增未并入正式回归的浏览器测试共 37 项，等待运行中的 737 项回归结束再整合。DatePicker 根状态与公开交付仍待完成。

### 2026-11-08 DatePicker 时间值状态适配

- 新增 use-date-time-value.ts，单值复用 createTimePickerValueFoundation，范围复用 getSideTimePickerProps/createRangeTimePickerValueFoundation，格式解析复用 resolveTimeFormat。选中值覆盖默认值；移除选中值保留面板时钟，显式重置时恢复最新默认值；范围部分更新保留未提供的端点。
- 独立夹具 6/6 Chrome 测试通过（react-date-picker-time-state-browser.log），覆盖单值/双端默认、外部选中与移除、默认值更新后重置、部分/undefined 更新、十二小时制及无时间列格式回退。类型检查、定向 TS/TSX lint 通过；6 个源码 SSR 场景通过（react-date-picker-time-state-ssr.log），包含 epoch=0、选中优先级和范围统一/独立默认值。
- 新增浏览器回归累计 43 项尚未追加至正在运行的 737 项正式 spec；根组件与公开交付工作继续，以上不代表 DatePicker 已整体完成。

### 2026-11-08 DatePicker 单值根状态适配

- 新增 use-date-picker.ts，连接共享 createDatePickerFoundation、日期格式/返回值/禁用规则、FormItem、已验证表头和时间值适配；管理已提交/待确认/预览/输入草稿、受控弹层与延迟预览清理。尚未连接公开组件的输入与 Trigger 视图。
- 独立状态夹具 11/11 Chrome 测试通过（react-date-picker-state-browser.log，4 秒，NativeExit=0）：即时/确认提交、事件与 Date 载荷顺序、受控拒绝/接受/外部替换/释放、受控弹层、关闭清理草稿、Enter 提交、readonly 与禁用日期、100ms 预览清理、快捷项/clear 顺序、日期时间合并及 year/month 表头钻取。
- 类型检查、定向 TS/TSX lint 通过；7 个源码 SSR 场景通过（react-date-picker-state-ssr.log），含 timestamp/Date epoch=0、week/quarter 默认值格式、时间确认、受控弹层优先级及函数展示格式回退。当前新增待并入正式 spec 的浏览器测试累计 54 项；本次状态夹具不是 DatePicker 根输入/弹层 E2E 验收。

### 2026-11-08 DatePicker 单值真实根视图

- 新增 picker.tsx 与 styles/date-picker.scss，连接 PickerInput、Trigger、单值 Foundation 状态与组合面板；支持输入/ref/native 属性、受控值、确认、readonly/disabledInput、函数格式、locale、时区、自定义触发器/面板/日期格、内嵌面板及额外页脚。picker-panel.tsx 增加根属性转发，保持内嵌模式原生布局与事件。
- 独立根夹具 11/11 Chrome 通过（react-date-picker-root-browser.log），覆盖真实弹层日期选择、确认、Enter、受控拒绝/回写/替换、原生布局与 ref、readonly、函数格式、自定义/内嵌面板、触发器、locale 与嵌入时钟；类型与定向 lint 通过，5 个源码 SSR 场景通过（react-date-picker-root-ssr.log）。
- 合并当前新增单值/范围面板、范围表头、时间状态、单值状态及真实根夹具，独立 5191 服务 65/65 Chrome 再次通过，24 秒，NativeExit=0（react-date-picker-progress-browser.log）。本轮仍未修改正在运行的正式 737 项 switch.cy.ts。
- 仍缺全局 ConfigProvider.datePicker 配置合并、RangePicker 根状态与视图、日期模式公开包装及复合导出、公开包验证与文档。现有 Picker 只作为内部根实现，不能视为 DatePicker 公共交付完成。

### 2026-11-08 RangePicker 根状态适配

- 新增 use-range-picker.ts，连接 Core createDateRangeFoundation、范围禁用/焦点/排序/时间规则、FormItem、范围表头、时间值与 footer 保留状态。包含受控值与弹层、草稿/预览清理、afterRender 焦点、卸载取消、端点表头选择及禁用确认。
- 状态夹具 12/12 Chrome 通过（react-date-picker-range-state-browser.log，3 秒，NativeExit=0），覆盖排序提交、确认、受控拒绝/接受/外部更新、不完整范围切换端点、锁定端点与清除保护、readonly/关闭恢复、exchangeTime/fixedTime 三种组合、Enter、预览延迟与 clearRangeOnReselect。
- 类型检查与定向 TS/TSX lint 通过；7 个源码 SSR 场景通过（react-date-picker-range-state-ssr.log），包含 epoch 范围、空受控值覆盖默认、禁用端点与初始焦点、不同模式时间确认和受控弹层优先级。
- 当前新增独立浏览器回归累计 77 项，仍未修改正在运行的正式 737 项 spec。RangePicker 双输入/Trigger/双面板根视图、全局配置与公共交付尚未完成。

### 2026-11-08 RangePicker 双输入根视图与空草稿修复

- 新增 range-picker.tsx，连接共享范围 Foundation、双输入、Trigger、双面板、内嵌属性、自定义触发器/面板/日期格、时钟及禁用端点；单值和范围共用 use-date-picker-locale.ts。范围源码 SSR 4 项通过，根组件 12 项中先发现 1 项空输入草稿失败，修复后与单值根组件合计 23/23 Chrome 通过（react-date-picker-roots-after.log）。
- Core range-foundation.ts 删除清空输入时把草稿重置为 undefined 的分支，使空字符串留在当前端点草稿中。新增 Core 测试在旧构建上失败，重建后 21/21 日期测试通过；Vue 旧实现空草稿 2/2 本来通过，故不能称为 Vue 同样可见的缺陷。修复后 Vue 空草稿与受控草稿 6/6、范围时钟/排序/编辑权限/只读 14/14 通过，已提交值保持不变。
- React ConfigProvider 增加 datePicker 配置，单值/范围遵守本地值优先、提供者值其次、组件默认值最后。8/8 Chrome 验证响应更新、显式 false/0/空数组覆盖、快捷项预览关闭、月份缩写和 Now 可见性；源码类型及定向 TS/TSX lint 通过。
- 将本阶段 97 项测试合并至独立正式 tests/browser/date-picker.cy.ts；正式 spec 类型与 lint 通过，整组运行结果待补。此前临时 JS 文件不属于 lint 覆盖。
- 737 项全量回归在 572 项通过后失去测试页渲染进程：浏览器 CDP 仍响应、页面 Runtime.evaluate 超时，唯一剩余 renderer 为 top-chrome-webui。已停止本任务残留 Chrome/Cypress 并保留原日志与 react-time-picker-acceptance-interruption.txt；最终退出 255。这是未完成的全量运行，渲染进程消失的底层原因未确定，不能记作 737 项通过。
- DatePicker 仍缺公开模式包装、入口/子路径导出、公开包验证与文档；全局 exchangeTime 尚待接入及验证。其他剩余组件和多次完整 E2E 仍属于原目标，尚未完成。
- 正式 TS spec 首次被 Cypress ts-loader/TNB 的多文件 source map 输出错误阻止（显式模块标记也复现）；改用现有 Vite 作为 spec 构建器，不改变 TNB 类型检查。构建器配置类型通过；临时文件自检验证初始 TS 构建、修改后重新构建、rerun 通知及输出更新，关闭 watcher 后清理。
- 新构建器整组首跑 96/97：失败是根输入提交后弹层已卸载，旧断言要求节点仍存在但不可见。改为断言无可见弹层后重跑；未修改组件行为。11 个已被正式 spec 覆盖且无引用的临时 JS 测试文件已移除，保留夹具和历史日志。
- 修正关闭态断言后，正式 date-picker.cy.ts 整组 97/97 Chrome 通过，36 秒，NativeExit=0（react-date-picker-formal-after-browser.log）；正式 spec 类型、定向 lint、提供者夹具类型（含 Vite 客户端样式声明）通过。此结果只覆盖本阶段 DatePicker 测试，不代表剩余 737 项或完整迁移通过。

### 2026-11-08 DatePicker 公开包与文档交付

- 新增日期、周、月、季度、年包装、RangePicker 命名导出和 DatePicker 复合属性；公开主入口/子路径类型与组件、样式总入口、README 用法。默认显示及返回值格式复用 Core，未复制日期规则。
- 接入 ConfigProvider.exchangeTime，与 Vue 一致：全局关闭或本地关闭任一条件均禁止排序交换时钟。真实单值/范围根夹具切换为公开构建包；新增五模式、复合导出、ref 和三种交换开关组合测试，正式 DatePicker 105/105 Chrome 通过（react-date-picker-public-browser.log，46 秒）。公开包 SSR 六场景和主入口/子路径同一性通过；公开夹具类型、正式 spec 类型及定向 lint 通过。
- 新增 React 日期文档和五个交互示例，文档构建 199 页、56.09 秒。浏览器首轮 4/5：测试误以为范围快捷项还需确认；对照共享 Foundation 确认快捷项直接提交后修正断言并补文档说明，5/5 页面 E2E 通过（react-date-picker-docs-after-browser.log）。包含受控提交/确认、四种周期面板、范围快捷项、内嵌全局配置、自定义触发器与对应 Vue/React 页面切换。
- 此前 737 全量因测试页渲染进程消失中断，尚无全量通过结论。当前正式 spec 共 847 项；准备按 Vue 套件已有配置关闭 Cypress 浏览器内存管理后重新完整运行，不能预先认定中断已解决。
- 最终文档说明构建完成：199 页、58.56 秒（react-date-picker-docs-final-build.log）。847 项、retries=0 的完整 React 回归已在独立 5190 服务启动，日志 react-date-picker-acceptance.log；结果尚待完成，不计为通过。

### 2026-11-08 Cropper React 适配与共享缓存图片缺陷

- 新增 React Cropper 源码适配、按需样式和独立浏览器夹具，复用 Core createCropper/getCropperRootStyle。接入根属性、尺寸、图片/画布/选区参数、几何回调、画布动作与图像变换、完整 imperative API；StrictMode 每次 effect 创建新 Foundation，销毁时取消后续异步回调。尚未加入公共入口、子路径或文档，不改变运行中 847 项回归的加载依赖。
- 首轮 6/7：选区宽度断言漏计共享逻辑的边框。修正后增加指针移动/缩放/禁用测试，10/11 通过，但真实图片替换仍失败：原始及内部图片均为 320x240，Cropper 显示尺寸仍为旧 400x225、matrix=[0.625,0,0,0.625,-120,-30]。
- 新增 Vue replacement-dimensions.cy.ts，旧实现同样失败，实际比例仍 16:9 而非新 4:3。检查安装的 Cropper 2.3 引擎，发现 connectedCallback 在初始内部图片已缓存时调用 handleLoad，却不注册后续持续 load 监听。Core bindImageEvents 现在跟踪内部图片 load，仅在元素尺寸落后于自然尺寸时保留原 DOM 位置重新连接，交由正常生命周期重新计算；监听仍由 destroy 统一清理。
- 为保持正在运行的全量回归基线，未重建 Core/React。独立 5191 服务仅将 Cropper foundation 别名指向共享源码，React 11/11 通过（react-cropper-source-fix-browser.log）；Vue 临时同类源码别名配置跑替换尺寸/源替换/指针/销毁后更新/延迟初始化，10/10 通过（vue-cropper-source-fix-browser.log），临时配置已删除。
- Core 用 Node resolve hook 仅把 Cropper foundation/engine 定位到源码，12/12 通过（core-cropper-source-test.log），含尺寸已匹配不重连、兄弟顺序、销毁监听清理。Core 类型、React 源码类型、夹具类型和定向 TS/TSX lint 通过；隔离 Vite cache 下源码 SSR 根属性/尺寸、浏览器引擎延迟加载及前缀/样式通过。临时 JS Cypress 用例未计入 lint，尚待整合正式 spec。
- 847 项全量回归进程仍存活并持续推进，日志 react-date-picker-acceptance.log；本阶段 Cropper 源码不在其验收范围内。Cropper 构建产物、公开包、文档及完整回归仍待后续交付。

### 2026-11-08 Cropper 行为补齐与文档源码验证

- 把临时裁剪用例合并为正式 cropper.cy.ts，并补齐自动贴合开关、无贴合图片替换保留选区、父级几何回写、延迟图片加载时最新坐标、加载错误后的事件及自定义模板。17/17 Chrome 通过（react-cropper-formal-browser.log，4 秒）；正式 spec 类型与 lint 通过，旧 cropper-focus.cy.js 已删除。
- 新增 CropperDemo.tsx 四示例及 React cropper/index.mdx，包含真实 PNG 生成、替换/禁用图片、选区比例、受控几何、contain/cover，完整属性/回调/ref 说明。公开导出尚未接入，独立预览服务仅把 @sdata/web-react/cropper 和共享 Cropper Foundation 映射到源码，未构建或改写现有 dist。
- cropper-docs-preview.html 与临时 JS 测试验证四个源码示例，4/4 Chrome 通过（react-cropper-docs-preview-browser.log）；确实生成了非空 PNG，验证 cover 改变了图片实际边界。通过临时 TypeScript paths 指向源码的文档预览类型检查及 TSX lint；临时类型配置已删除。这不是正式文档站或公开包验收。
- Vue Cropper 全部组件用例正在用共享源码别名运行，日志 vue-cropper-source-full-browser.log，结果待补。原 847 项完整 React 回归仍持续推进，不能改写其依赖的构建产物。Cropper 公开入口/样式总入口/子路径、实际构建、正式站点测试和后续全量运行仍待完成。
- Vue Cropper 完整组件范围（11 个 spec）最终 41/41 通过，NativeExit=0（vue-cropper-source-full-browser.log），使用共享源码别名；临时 Cypress 配置已删除。这仍需在实际 Core 构建后复验，不能视为发布产物验收。

### 2026-11-08 Toolbar 共享状态 React 适配

- Toolbar 完整视图依赖尚未迁移的 JsonForm，当前先新增内部 use-toolbar.ts，复用 Core createToolbarFoundation，连接受控/非受控 value、更新通知、深复制初始值重置、resetSkipKeys、搜索/重置/验证清理顺序、schema 样式与嵌套 slot 名、展开及真实测量状态。
- 新增独立状态夹具与正式 toolbar-state.cy.ts，5/5 Chrome 通过（react-toolbar-state-browser.log，2 秒）：保留跳过字段并删除后加字段、嵌套初始值恢复、静默重置、受控拒绝/接受/外部替换、实际 scrollHeight 和展开策略、schema span/style/slot、Enter/textarea/contenteditable/preventDefault/IME。
- React 源码类型、定向夹具/spec 类型及 TS/TSX lint 通过。以上是状态适配验证，不是 Toolbar 完整组件、JsonForm 集成或公共交付验收。
- 原 847 项完整 React 回归仍运行，最近检查 455 条通过记录、未出现失败标记；未重建 Core/React，Cropper 公共构建与正式文档站验收继续等待该运行完成。

### 2026-11-08 JsonForm 模型和字段 React 适配

- 新增内部 use-json-form.ts，连接共享 createJsonFormFoundation/createJsonFormFieldFoundation。保留 Vue 契约：非受控 model 原地更新，受控字段发布新的顶层对象但保留共享嵌套修改；模型替换通过 layout effect 同步，字段与 adapter 始终读取最新 props。schema 转换由调用方传入现有共享转换器，未复制 A2UI 或路径逻辑。
- 独立 JsonForm 状态夹具与正式 json-form-state.cy.ts 覆盖动态模型隔离、字段切换、受控通知、A2UI 动态标签和 JSON Pointer 转义、本地 adapter 优先级及原型路径隔离。首轮 5/6 因夹具未提供 A2UI 必需的 root 节点而得到空 schema；补齐夹具后 6/6 Chrome 通过（react-json-form-state-after-browser.log，1 秒）。定向 TS/TSX 类型和 lint 通过。
- 本次不包含 JsonForm 控件注册表、视图/插槽、FormItem 校验生命周期、公开包或文档交付；Toolbar 仍等待 JsonForm 集成。当前完整 React 回归继续运行，不能用这些状态测试替代完整组件或全量验收。

### 2026-11-08 JsonForm 控件与表单项 React 适配

- 新增内部 control.tsx，复用 Core 控件解析、占位符与样式选择，连接 checkbox/radio modelValue、switch onChange 与其他控件 value/onValueChange；组合 schema 事件与组件属性回调，支持默认内容和 render props。正式 json-form-control.cy.ts 7/7 Chrome 通过（react-json-form-control-final-browser.log），定向类型/lint 通过。
- 新增内部 item.tsx，复用字段 Foundation、规则、列配置，连接 FormItem、递归 Row/Col、隐藏/noFormItem、自定义命名内容和 render 组件。首轮 3/8 暴露 hidden 插槽被当成 React 原生 hidden 属性传入控件，导致控件隐藏；将此结构插槽保留在隐藏分支后 8/8 Chrome 通过（react-json-form-item-after-browser.log，5 秒）。覆盖模型替换、字段切换、验证注册与移除、显式列/表单项覆盖、JSON Pointer 规则与写入；定向类型/lint 通过。
- 仍是内部适配，尚无完整 JsonForm 注册表、公共入口、根组件或文档交付，也不构成 Toolbar 完成交付。
- 847 项完整回归再次失去测试页 renderer：最后推进到 Calendar event view；Chrome CDP 枚举仍返回 runner 页，但 Runtime.evaluate 5 秒无响应，所属 Chrome 仅剩 top-chrome-webui renderer。已保存 react-date-picker-acceptance-interruption.txt 并停止确认归属本轮的 Chrome/Cypress 进程。关闭 manageBrowserMemory 未解决复现，根因未知；本轮不计完整通过，之前局部测试也不能替代它。
- graphify update . 完成；旧图仍有 104 个缺失 source_file 警告，拓扑未改变。

### 2026-11-08 Cropper 公开包及正式文档交付

- 接入 React 根入口、cropper 子路径、完整公共类型和总样式入口；浏览器夹具改用构建后的 @sdata/web-react/cropper，5191 测试服务已移除 Cropper 源码别名。README 补齐按需导入与文档地址。
- Core 和 React 实际构建通过；构建后的 Core Cropper 测试 12/12（core-cropper-built-test.log），Vue 全部 11 个 Cropper spec 共 41/41（vue-cropper-built-browser.log）。React 公开包 17/17 Chrome（react-cropper-final-browser.log）；新增公共入口一致性、SSR/native 属性、尺寸样式和 provider 前缀测试 2/2。
- React 全部包测试 261/261（react-cropper-package-tests.log）。随后新增 Cropper 独立样式契约测试，复现未导入基础主题变量的问题，补齐 base 样式后 1/1 通过（react-cropper-style-before.log / react-cropper-style-after.log）；该新增测试不包含在前述 261 计数内。最终 React 类型检查、文档 React 类型检查、定向 lint 通过。
- CropperDemo 与完整 API 文档已进入实际 Astro 文档构建，最终 200 页、59.79 秒（react-cropper-docs-final-build.log）。删除临时源码预览 HTML/TSX/JS spec，改为正式 cropper-docs.cy.ts，验证 PNG、源替换、禁用、比例、受控几何、contain/cover 及框架切换；首次正式站点 5/5（react-cropper-docs-public-browser.log），基础样式修复后最后复验结果见 react-cropper-docs-final-browser.log。
- 本阶段是 Cropper 完整组件范围验证；整个 React 迁移仍缺其他组件，847 项完整回归的 renderer 中断尚未解决，不能据此声明整体 100% 或多轮完整 E2E 通过。
- 最终正式文档站复验 5/5、NativeExit=0（react-cropper-docs-final-browser.log，3 秒）。

### 2026-11-08 ThemeProvider React 契约与文档补齐

- ThemeProvider 新增 Vue 对应的 tag 根标签及局部容器原生属性透传；根节点与浮层容器改用 ConfigProvider 前缀。主题计算、目标切换/清理、DOM 环境模式跟踪、变量继承和全局恢复继续使用共享 Core Foundation，未复制其逻辑。
- 增加 @sdata/web-react/theme-provider 公共子路径及主题配置类型导出。ConfigProvider 仅继承主题配置三项，避免将 ThemeProvider 的 DOM 属性误声明成 ConfigProvider 的配置能力。
- 正式 theme-provider.cy.ts 6/6 Chrome 通过（react-theme-provider-final-browser.log），覆盖标签替换及旧节点清理、自定义前缀、token 清理、透传模式、嵌套/环境继承和全局恢复。首轮 5/6 是测试把 Cypress 包装的原生节点误按数组读取；修正为包装引用对象后通过，没有因此改动组件逻辑。
- 从原 switch.cy.ts 精确提取其两项主题场景到临时 spec，2/2 通过（react-theme-provider-legacy-browser.log），原测试保持不变，临时文件已删除。公共入口/SSR 与 ConfigProvider 测试 3/3；完整 React 包测试 264/264（react-theme-provider-package-tests.log），包括上一轮新加的 Cropper 样式契约。
- 新增 ThemeProviderDemo、完整属性/继承说明及 ConfigProvider 文档链接；正式站点 theme-provider-docs.cy.ts 3/3 通过（react-theme-provider-docs-browser.log），含局部模式/颜色、真实 Popover 所属主题容器及 Vue/React 对应页切换。React 全部类型、文档 React 类型及定向 lint 通过。文档首轮构建 201 页（react-theme-provider-docs-build.log）；补齐交叉链接和根主题类型导出后的最终构建见 react-theme-provider-docs-final-build.log。
- 以上是该组件和 React 包级回归，不能证明所有未迁移组件完成，也不能替代用户要求的多轮完整浏览器 E2E。此前完整运行的 renderer 消失根因仍未解决。
- 最终文档构建 201 页、57.13 秒、NativeExit=0（react-theme-provider-docs-final-build.log），构建 HTML 中 ConfigProvider → ThemeProvider 交叉链接验证通过；最终 React 类型检查通过。

### 2026-11-08 拆分浏览器测试并启动 904 项完整回归

- 原 switch.cy.ts 集中 737 项测试、约 9500 行；两次完整运行均在较后位置失去测试页 renderer，关闭 manageBrowserMemory 未解决问题。当前按组件拆分后半部分，并把前部大型综合套件按最多 40 个注册语句拆分，得到 31 个 spec（循环注册的首组实际 41 项）。
- 拆分使用 TypeScript AST 保留原有语句，注册清单以隔离 VM 执行 describe/it 注册，逐项比较原/新 737 项测试的完整标题、测试函数体、钩子及分组拼接后的顺序，deepEqual 通过。原文件 SHA256、临时备份地址和每个新 spec 的数量记录在 react-e2e-split-inventory.log。辅助函数保留在使用它们的套件内；顶层 Image 等辅助函数与其组件组一起移动。没有删减断言或设置跳过。
- 删除被完全替代的 switch.cy.ts 和一次性拆分脚本。全部 React/夹具类型检查通过（react-e2e-split-types.log）。拆分 spec 的 lint 无错误，仅原先 expect(writes).to.have.been.called 表达式存在 no-unused-expressions 警告（react-e2e-split-lint.log）；本轮未改动该断言。
- 连同新增 Cropper、ThemeProvider、JsonForm 内部适配等测试，当前全量注册清单为 41 个 spec / 904 项（react-split-full-inventory.json）。已重启独立 5190 服务并用重试 0 启动完整 Chrome 运行，日志 react-split-full-acceptance.log。该运行仍活跃，刚完成 BloomMenu 并进入 BorderBeam；不能计为完整通过，也不能据此声称 renderer 原因已定位或修复。
- 本轮固定 Core/React 构建及 201 页文档基线。运行期间不重建依赖、不改写本轮已选择的测试或共享源码。后续未加载的新组件源码可独立推进。graphify update . 完成，仍有旧图 104 个 source_file 缺失警告。

### 2026-11-08 Cascader 路径与懒加载内部适配

- 新增 React 内部 use-selected-path.ts 与 use-lazy-load.ts，分别复用 Core createCascaderPath/createCascaderLazyLoad；不复制节点解析、导航、请求去重和源对象一致性规则。懒加载 Foundation 在 layout effect 中创建并在 cleanup 销毁，以适配 StrictMode 重放，避免复用已永久 disposed 的实例。
- 正式 cascader-state.cy.ts 6/6 Chrome 通过（react-cascader-state-browser.log，3 秒）：启用节点环绕导航、搜索过滤、展开路径与列清理、重复加载/禁用和叶节点保护、同键源对象替换后旧回调隔离且不清除新请求、卸载迟到结果、重挂载及失败后使用最新 loader 重试。夹具使用共享 getOptionInfos 构建真实索引，不手工模拟路径规则。
- 定向源码/夹具/spec 类型和 lint 通过（react-cascader-state-types.log、react-cascader-state-lint.log）。这仍是内部适配；Cascader 完整值状态、面板/选项、触发器、表单/只读/键盘集成、公共入口与文档尚未完成，不能作为完整组件验收。
- 904 项完整回归依然活跃，检查时已有 176 条通过记录、无失败标记（react-split-full-acceptance.log）。本轮新增源码和新 spec 不在该运行已选择的 41 个 spec 内；未重建 Core/React 或文档，保持其基线。新 Cascader 6 项须纳入下一轮完整运行。

### 2026-11-08 Cascader 选项索引与缓存 React 适配

- 新增内部 use-options.ts，复用 Core getOptionInfos，连接选项/叶节点索引、值到路径映射、层级深度、字段映射、对象 valueKey、严格选择和懒加载开关；加载结果记录源对象并由共享逻辑判断缓存是否仍适用。复用上一阶段的 React 懒加载适配，不复制请求生命周期。
- 每次 React 渲染重新生成索引，确保同一选项对象的子节点变化在父级重新渲染后可见，避免仅按数组引用 memo 导致动态选项失效。直接 children、缓存 children 和已替换源对象的优先关系由 Core 决定。
- 正式 cascader-options.cy.ts 6/6 Chrome 通过（react-cascader-options-browser.log，2 秒）：加载完成后重建索引、同键源替换失效、直接 children 覆盖缓存、移除选项清理索引、strict/lazy 切换、自定义字段和对象值/禁用分支、带连字符和百分号路径的防冲突、移除后迟到完成。定向类型与 lint 通过。
- 仍未交付 Cascader 的选中值状态、完整面板与触发器、Form/只读/键盘整合、公共包及文档。新 6 项不在当前已启动的 904 项完整回归中；保持现有构建/文档与已选测试基线不变，后续完整运行需包含新增用例。
- 当前完整运行随后出现 AutoComplete 虚拟列表失败：components-02 的 scrolls AutoComplete virtual suggestions and honors local provider opt-outs，在 ArrowDown/Enter 期间抛出 ResizeObserver loop completed with undelivered notifications（截图和日志已保留）。运行仍在推进到 components-03；未添加异常忽略或修改正在执行的基线，后续需独立定位观察器调度。

### 2026-11-08 AutoComplete 虚拟列表 ResizeObserver 故障定位

- 保持当前 904 项完整运行及生产源码不变，在独立 5191 服务用临时 auto-complete-resize-diagnostic.cy.js 重放原失败操作。诊断用例记录 ResizeObserver 创建栈、通知目标/尺寸和错误前回调序列；仅为收集数据暂存 ResizeObserver 异常，最后显式断言错误数组为空，因此出现异常仍判失败，没有把异常忽略成通过。
- 原行为 8 次中 6 次复现（react-auto-resize-diagnostic-browser.log；react-auto-resize-diagnostic-1..8.json）。观察到 Virtua 测量回调期间挂载 Trigger/Ellipsis/RichLineClamp 的新观察目标，栈来自 React 源码与 Core clamp layout。
- 仅延后注册的分组实验：clamp 4/4 失败、ellipsis 3/4、trigger 2/4、三组一起 2/4（react-auto-resize-experiment-browser.log）。不能把注册延后当成充分修复。
- 延后回调的第二组实验见 react-auto-resize-callback-experiment-browser.log 与 react-auto-resize-experiment-summary.json。仅延后 Virtua 回调的 4 次实验无 ResizeObserver 错误，其余各组仍有失败。当前安装 Virtua 0.53.4，检查其实现确认尺寸通知会同步刷新 React；这是继续定位调度边界的证据，不是已交付修复。
- 所有原始 trace 已保留在根目录 react-auto-resize-*.json。临时诊断 JS 不在正式 *.cy.ts 集合中，也不在当前完整运行已选的 41 个 spec 内。后续需要在隔离环境验证可维护的实际修复和虚拟列表测量/滚动/卸载语义，再补正式回归；不能把 monkey-patch 实验用于生产或作为完整通过证据。

### 2026-11-08 Virtua 尺寸调度候选修复验证

- 按 pnpm patch 流程提取 Virtua 0.53.4 到 D:/Temp/sd-virtua-resize-patch-20261108；核对提取与已安装 React ESM 文件 SHA256 相同后，将候选修改复制到提取目录。尚未执行 patch-commit/install，pnpm-workspace.yaml 与 lockfile 未接入补丁，当前 904 项完整回归继续使用原依赖。
- 候选只修改 React ESM 入口中的尺寸观察器工厂：按目标保存最新 entry，每帧统一交付；取消观察时移除该目标的待交付 entry，断开时取消帧并清空待交付/观察集合。同步刷新 React 因而离开原生 ResizeObserver delivery 阶段。删除该已修改 ESM 文件末尾的旧 sourceMappingURL，避免继续指向失效的映射；未添加 CJS 适配。
- 独立副本位于 packages/web-react/node_modules/.cache/virtua-resize/index.js；5191 服务通过仅此服务的 virtua alias 使用候选，缓存目录为 .vite-virtua-candidate；5190 完整回归服务及其缓存不变。
- scripts/verify-virtua-resize-candidate.ts 从候选提取实际工厂验证同帧合并/最新值、多目标保留、unobserve 过滤、dispose 取消、迟到通知隔离和重新观察，全部 assert 通过（react-virtua-candidate-scheduler.log），脚本 lint 通过。它仍是候选验证脚本，不是已安装包测试。
- 未注入观察器替身、未忽略异常，精确复用原 AutoComplete 失败用例连续 8 次全部通过（react-virtua-candidate-browser.log）。从现有 spec 抽取的 AutoComplete/虚拟选择/动态行高/同步截断/方向/滚动边界/卸载 15 项也全部通过（react-virtua-affected-candidate-browser.log，58 秒）。临时 candidate JS specs 不在正式完整集合内。
- 候选结果支持继续落地，但并不等于已经修复：仍需在当前完整运行结束后注册补丁、安装锁定依赖、将候选调度验证转为正式验证、移除临时 alias/诊断文件，并运行使用实际补丁包的相关与完整回归。整体 React 迁移与多轮完整 E2E 尚未完成。

### 2026-11-08 Cascader 选中值和事件 React 适配

- 新增内部 use-selection.ts，使用 Core createCascaderFoundation/getCascaderValueMap/getDefaultCascaderValue，连接受控与非受控模型、单/多选、路径模式、严格父级选择、只读保护、标签移除和清除，以及更新/change/Form/后续视图事件顺序。
- 内部值用 ref 提供同步读取，保证同一 React 事件内连续选择使用最新非受控值；受控值仍以父级为准，拒绝写回不会改变展示。从受控值释放到 undefined 时按 Vue 契约恢复默认空值；multiple/pathMode 变化调用共享模式归一化。
- 正式 cascader-selection.cy.ts 7/7 Chrome 通过（react-cascader-selection-browser.log，2 秒），含受控拒绝/接受/外部替换/释放、连续多选和父级去重、保留锁定值、移除未解析标签、只读三种操作、路径/严格父级选择、模式切换和清除导航事件顺序。定向类型与 lint 通过。
- 这是内部选择适配，不是完整 Cascader：面板、触发器、搜索/键盘、Form 视图整合、公共入口及文档仍待交付。测试夹具未导入 Virtua，因此 5191 上为上一阶段候选设置的 virtua alias 未参与这组验证；尚未安装依赖补丁。
- 当前 904 项完整回归依旧运行，检查时 719 条通过记录，已知 AutoComplete ResizeObserver 一项失败仍保留。新 Cascader 7 项不在已启动的测试集合里，后续完整回归需纳入。未改变本轮构建/依赖/文档基线。

### 2026-11-08 Cascader 交互适配与 Virtua 补丁落地

- 新增内部 use-interaction.ts，复用 Core createCascaderInteraction，连接受控/非受控输入、弹层变化后的路径恢复、清除保护、搜索防抖及 StrictMode 卸载定时器清理。cascader-interaction.cy.ts 5/5 Chrome 通过；类型和 lint 通过。
- cascader-keyboard.cy.ts 组合真实 React options/path/selection hooks 与 Core keyboard，验证打开/关闭、禁用跳过、上下循环、父子列导航、多选/严格父级、搜索横向按键及禁用节点保护，最终 5/5 通过。首次 4/5 的失败是测试在清空选中值后错误假设活动节点保留；共享 Foundation 明确重置路径和活动节点，修正为先断言重置再重新导航。未因此修改共享代码。
- 904 项完整回归已终止并收集完整结果：41 specs，903 passed、1 failed、无 pending/skipped，29:13（react-split-full-acceptance.log）。唯一失败为原 AutoComplete ResizeObserver 错误；这次完成全套不代表之前 renderer 丢失问题已证明解决。
- 完整运行结束后执行 pnpm patch-commit，已注册 patches/virtua@0.53.4.patch 并更新 workspace/lockfile，安装成功。补丁只调整 React ESM ResizeObserver 延迟交付，内容与此前候选一致。
- verify-virtua-resize.ts 改为通过 import.meta.resolve('virtua') 验证实际安装入口，调度自检通过（react-virtua-installed-scheduler.log）。整包 React typecheck 通过（react-virtua-installed-types.log）。删除三份临时 diagnostic/candidate JS specs；原始诊断证据日志保留。
- 已停止自有 5190/5191 旧服务，重启 5190 正常 Vite 服务且无候选 alias，正在跑原始 components-02/03 正式用例（react-virtua-installed-browser.log）。5187/5188 服务保留。补丁后的完整回归、构建和文档重建仍待执行。
- Cascader 本次仍是内部适配与组合测试，面板、触发器、Form、公共入口及文档未完成；新 10 项不在上述 904 集合内，连同此前 19 项需纳入后续完整回归。

### 2026-11-08 Cascader 选项视图及补丁正式验证

- 新增内部 context.ts/option.tsx，直接使用 Core createCascaderOptionFoundation，连接现有 Checkbox/Radio/Ellipsis/PerformantEllipsis/Icon，支持点击/悬停展开、禁用和 selectionDisabled、严格单选、多选半选、加载图标、搜索箭头、路径格式化和自定义选项。未另写选择算法。
- cascader-option.cy.ts 最终 6/6 Chrome 通过（react-cascader-option-verified-browser.log），整包类型检查通过（react-cascader-option-final-types.log），定向 lint 通过。首次测试使用隐藏原生输入 check 导致 2 项操作失败，改为点击可见 label；下一次 1 项失败源于夹具误把 Core 计算字段 selectionDisabled 当原始选项配置，改为全部子节点 disabled 的真实数据触发该状态。上述失败证据保留，未修改共享算法适配错误断言。
- 当前选项测试服务 5191 使用独立 .vite-cascader-view 缓存，无 Virtua 候选 alias；此前普通启动的 5191 服务已停止。Cascader 仍未交付完整列面板、触发器、公共 API 和文档。
- 实际 pnpm patched Virtua 依赖下，原始 components-02/03 两个正式 specs 80/80 通过（react-virtua-installed-browser.log，4:13），包含先前失败的 AutoComplete 虚拟建议用例；React build + package tests 264/264 通过（react-virtua-installed-package-tests.log）。文档 build:site 已启动（react-virtua-installed-docs-build.log），其完成结果与后续完整回归需要另行核验。
- 文档最终构建成功：201 页、57.93 秒，Pagefind 索引完成。随后重启 5190 正常服务并启动完整 47 specs（原 904 项加 Cascader 35 项，预计 939 项），日志 react-patched-full-acceptance.log；运行期间冻结现有 Core/React 构建、依赖和文档输出基线，新工作只能使用未纳入该轮的新模块/夹具及独立缓存服务。完整结果尚未取得。

### 2026-11-08 Cascader 列与搜索面板

- 新增内部 column.tsx/search-panel.tsx，复用已验证的选项视图、Scrollbar、VirtualList、Empty、Spin 和 ConfigProvider。列视图支持路径/活动项高亮、层级 z-index、普通与虚拟列表及空状态；搜索视图支持路径标签、加载提示、选择和局部/全局空状态。
- cascader-panels.cy.ts 5/5 Chrome 通过（react-cascader-panels-final-browser.log，2 秒），覆盖多列展开、数值 0、路径高亮、500 项虚拟滚动到末尾、替换数据、搜索选择/加载及空内容优先级。首次 4/5 失败是测试试图滚动外层 host，改为真实 .sd-virtual-list-scroller 后验证通过，未禁用 scrollability 检查。定向类型及 lint 通过，graphify 已更新。
- 本次 5 项是在完整 47 specs 启动后新增，尚未纳入正在运行的完整回归；后续全套应纳入。没有重建 Core/React/文档或改动当前全套已加载的适配器。
- 完整 Cascader 仍缺基础面板的列过渡、独立 Panel 组合、下拉触发器与 Form 整合、公共导出及文档；列和搜索视图的局部通过不等于整个组件迁移完成。

### 2026-11-08 Cascader 独立 Panel 与完整回归 renderer 证据

- 新增 base-panel.tsx/panel.tsx，组合共享 options/path/selection/keyboard 和选项上下文，支持 standalone 单/多选、路径/严格模式、受控值、动态展开方式和异步加载。基础面板使用 AnimatePresence 保留退出列，并复用 Core runCssTransition 与现有 cascader-slide SCSS 完成进出；Column 传递 React 19 DOM ref。
- cascader-panel.cy.ts 最终 6/6 Chrome 通过（react-cascader-panel-final-browser.log），覆盖路径事件顺序、真实键盘、受控拒绝/接受/释放、多选清空、悬停与退出动画、StrictMode 异步加载。首次 5/6 的异步加载点击被测试冻结的动画挡住，推进加载计时后恢复真实时钟验证通过，未强制点击或绕过遮挡检查。定向类型/lint 通过，graphify 更新。
- 47 specs 完整运行未完成：在 calendar-views 停止推进。核实 Chrome 99804 的父进程是本轮 Cypress 37624（5190 配置），仅剩 top-chrome-webui renderer；CDP 仍列出 Calendar 测试页，但 Runtime.evaluate 超时。证据 react-patched-full-interruption.txt；据此停止上述自有 Chrome/Cypress，运行句柄最终退出 255。保留 react-patched-full-acceptance.log，不把本轮算作通过。拆分 spec 未消除 renderer 丢失，原因仍未确定。
- 新增 scripts/run-isolated-e2e.ts，完整集合逐 spec 独立启动 Cypress/Chrome，固定清单并输出逐项日志、JSON 与汇总；不允许失败/pending/skipped/零测试算成功。--self-test 已通过，正在通过 --spec cascader-panel.cy.ts 做实际 runner 验证（react-isolated-runner-smoke.log）。该方式用于完整覆盖验证，不宣称修复 renderer 根因。
- 独立 Panel 尚未接入正式 root/subpath 与文档；下拉 Cascader 的触发器、Form、公共 API 和整体验证仍待完成。本次 6 项也是上一轮完整运行启动后新增。
- 隔离 runner 首次实际执行的 Cypress 用例 6/6，但汇总错误假设 API 返回 status 字段而记为失败；按已安装 Cypress 类型/实际结果改用 totalTests 区分成功执行与启动错误，config 使用 e2e.baseUrl，显式 Node 类型检查通过。再次实际执行正确记录 6/6 并退出 0（react-isolated-runner-final-smoke.log）。原始错误汇总保留，不算通过证据。
- 已启动包含所有新 Cascader specs 的 49 文件隔离完整回归（react-isolated-full-acceptance.log），逐 spec 原始日志/结构化结果和固定 inventory 在该日志所列 isolated-e2e 目录。此运行仍需等待最终结果；当前基线包含新 Panel/列视图，期间不改动这些模块或重建依赖/文档。

### 2026-11-08 Cascader 下拉整合初步验证

- 新增内部 cascader.tsx，整合现有 SelectView/Trigger/Tooltip/Form 与 Cascader hooks、列/搜索面板。过滤、展示标签、键盘、选择、弹层兼容事件和配置解析均使用 Core；支持路径/多选/严格模式、搜索防抖、受控 show/popupVisible、字段映射、fallback、只读、懒加载、虚拟配置和自定义触发器状态。
- cascader-dropdown.cy.ts 6/6 Chrome 通过（react-cascader-dropdown-final-browser.log），包含数值 0、搜索键盘选择、多选后清空输入、受控 show 拒绝/接受、只读/禁用、自定义触发器与缺失值回退。首次 4/6 失败来自测试用精确全文匹配 Ellipsis 内含测量内容的按钮；截图确认菜单存在，改用实际 option button title 定位后通过，未绕过可见性或点击检查。
- 定向类型与 lint 通过；删除未使用类型导入。随后补齐自定义触发器 host 的 fitWidth/maxWFull/style.width 布局，对应最终布局仍需后续测试。graphify 更新。该模块与新 spec 不在运行中的 49 文件集合内。
- 当前只是下拉初步整合，仍需完整 props/slots/ref/Form/clear/异步/虚拟/生命周期矩阵、公共入口与样式发布、文档和 SSR/打包验证；不代表完整 Cascader 已交付。隔离完整回归已有前 4 specs 通过，正在 calendar-views，尚无完整结果。

### 2026-11-08 Cascader 边界验证及隔离回归缺陷

- 新增 cascader-boundaries fixture/spec，最终 5/5 Chrome 通过（react-cascader-boundaries-final-browser.log），验证 focus/blur ref、Form blur/change 必填校验、继承 Form disabled、清除保留禁用标签及事件顺序、只读清除保护、全局配置下局部搜索/清除关闭、自定义触发器 180px host 宽度。定向类型和 lint 通过。
- 首次失败来自清除按钮未聚焦时按既有样式隐藏、属性断言改变 Cypress subject 后继续链式断言，以及 5191 缓存仍持有补宽度前的 Cascader 模块；改为用户可达的聚焦后点击、独立属性断言，并重启独立缓存的 5191 后通过。未强制点击隐藏按钮；未修改正在全量回归的组件。
- 隔离 calendar-views 再次只有 top-chrome-webui renderer，CDP Runtime.evaluate 超时，证据 react-isolated-calendar-interruption.txt。核实 Chrome 49084 的父进程是该 spec 的 Cypress 79396 后停止这两个自有进程，父 runner 将该文件记为 failed（Could not find Cypress test run results）并继续其他 specs。前面已通过的用例保留在逐 spec 原始日志，不把被中断文件算通过。
- 将停顿后首个键盘删除用例独立运行，1/1 通过（react-calendar-delete-diagnostic.log），临时 JS diagnostic spec 已删除，原正式用例保留。这不能证明 renderer 根因修复，也不足以判定键盘删除自身有缺陷；需继续定位完整 Calendar 文件上下文。
- 全量推进至 components-01 前又发现 color-picker 41/42：uncontrolled draft 用例在 color-picker.cy.ts:240 等待 .sd-color-picker-panel 失败。证据 packages/web-react/isolated-e2e-1794094896095/color-picker.cy.ts.log；暂未改动，待定向复现。完整隔离回归仍进行，已有失败，不能宣称全通过。

### 2026-11-08 ColorPicker 关闭契约修正与 Calendar 分组诊断

- 精确核对 color-picker.cy.ts:240 后纠正先前定位：失败发生在关闭后的 not.be.visible，打开/编辑/色板选择均已通过。Trigger 默认 unmountOnClose=true，关闭内容最终卸载，旧断言要求 DOM 仍存在因而有动画时序竞争。将该断言改为 not.exist；仅修改已经在当前完整运行结束执行的 ColorPicker spec，未改变运行中的组件代码或其他待执行 specs。
- 单独记录原始打开步骤 click/focus 事件，6/6 通过（react-color-picker-open-diagnostic.log；packages/web-react/color-picker-open-diagnostic-0..5.json）。这些记录没有证明关闭问题，但保留了排除打开假设的证据；临时 JS spec 已删除。
- 修正后 ColorPicker 整文件仍是 41/42（react-color-picker-close-contract-browser.log）：原关闭用例通过，但 shared pointer controls 第二项在 color-picker.cy.ts:26 色相仍为 0，预期 0.75。该新失败未修复，不能用原失败消失宣称全文件通过；需继续检查 use-control/RAF/测试事件时序。
- 将 calendar-views 最后完整 Calendar event view 分组原样转译到临时 JS，8/8 通过（react-calendar-event-context-diagnostic.log），包括此前停顿后的键盘删除、resize、原生删除和 drag。临时 JS 已删除，正式原分组未改。整文件 renderer 丢失原因仍未确定，分组通过不算根因修复。
- 隔离完整回归已继续通过 components-01/02/03，正在 components-04；Calendar 和原 ColorPicker 失败保留在本轮汇总。

### 2026-11-08 Cascader 独立入口/样式与色相诊断

- 新增 cascader/index.ts：default/named Cascader、CascaderPanel、Cascader.CascaderPanel 身份一致，导出共享模型/字段/值类型及 React TagProps 特化选项、loader、事件和格式化类型。新增 styles/cascader.scss，包含基础主题、Select 依赖和 Radio，并转发 Core Cascader 样式。尚未接入 root/package exports/styles index，避免改变当前完整回归的模块基线。
- cascader-entry.cy.ts 2/2 Chrome 通过（react-cascader-entry-browser.log），只加载 Cascader SCSS 验证主题背景、弹层/列布局、默认与命名/复合入口身份及叶子选择。入口类型、lint 通过。
- 使用 tsc 将当前 React 源码编译到独立 node_modules/.cache/cascader-entry-build（react-cascader-entry-isolated-build.log），未覆盖正式 dist。针对该隔离输出的 SSR 身份/路径标签/combobox/Panel 原生属性自检通过（react-cascader-entry-ssr.log）；这是源码入口验证，不是已发布 package 子路径验证。
- 通过临时 JS 捕获 mousedown、RAF queue/run/cancel 堆栈，色相操作重复 20/20 通过（react-color-control-diagnostic.log；packages/web-react/color-control-diagnostic-0..19.json）。未复现原 0.00 vs 0.75 失败，未修改控件逻辑，也不声明故障已修复。临时 JS spec 已删除，诊断数据保留。
- 完整隔离运行仍在继续，components-04 通过后进入 components-05；已有 Calendar/ColorPicker 失败仍然保留。

### 2026-11-08 Cascader React 文档源与示例

- 新增 React Cascader MDX 页面，说明基础受控值、多选、路径/悬停、懒加载、独立面板、自定义触发器，以及选项数据、属性、回调、渲染、ref 和键盘契约。新增 CascaderDemo.tsx 六个真实交互示例。
- 当前示例临时直接导入 web-react/src/cascader/index.js 和独立 SCSS，避免在完整回归期间改变包级 exports 与正式 dist；完成包级接入后必须切换为 @sdata/web-react/cascader 与发布样式路径。MDX 面向用户的代码示例使用最终包路径。
- 独立 cascader-docs-preview fixture 渲染实际文档示例，6/6 Chrome 通过（react-cascader-docs-preview-final-browser.log，8 秒），覆盖搜索/ref、多选、完整路径、异步区域、严格父级和自定义触发器状态。首次 5/6 的路径用例试图点击只读已选状态中宽度为 0 的内部 input，改为点击可见 .sd-cascader 触发区域后通过；未强制点击。
- 示例和预览定向类型/lint 通过，graphify 更新。尚未构建这份 MDX，未验证正式文档路由/导航/Vue-React 切换或最终包导入；当前 49-spec 隔离回归不包含新增文档预览用例。

### 2026-11-08 Cascader 下拉数据契约

- 新增 cascader-data fixture/spec，最终 6/6 Chrome 通过（react-cascader-data-final-browser.log），验证 fieldNames + 对象 valueKey + pathMode、指定 popupContainer、custom filter 接收 raw option、searchOptionOnlyLabel、全局虚拟配置下 500 项末尾选择、同键 raw source 替换的迟到请求隔离、卸载后回调忽略，以及 disabled 变化关闭已开弹层并同步 aria-expanded。
- 首次懒加载用例在 Resolve new 后点击外部按钮使弹层关闭，关闭无选中值时按契约重置路径；测试重新打开后漏展开父级，导致找不到新子项。补上再次展开，并断言加载次数仍为 2 后通过；未修改共享加载或路径实现。禁用用例用按钮原生 click 触发 prop 更新，避免以外部 mousedown 关闭行为冒充 disabled 同步验证。
- 定向类型/lint 通过，React 全源与浏览器夹具 typecheck 通过（react-cascader-data-all-types.log），graphify 更新。新增用例未纳入正在运行的 49 文件集合。
- 当前完整隔离回归已通过 components-07/08，进入 components-docs-01；原 Calendar 和 ColorPicker 失败仍保留，后续全量必须重新覆盖修正与新增测试。

### 2026-11-08 Calendar 视图测试分组隔离

- 将原 calendar-views.cy.ts 的 8 个已有顶层分组分别移至 calendar-view-root/docs/adapter/body/cell-adapter/cell/drag/event.cy.ts。保留各分组局部 helper 与原始测试正文，不拆改单个测试，不增加 skip/retry，不删覆盖。
- TypeScript AST 提取完整语句，执行前后注册清单并 deepEqual 每个测试标题、函数正文和继承 beforeEach hooks：原 42 项与拆分 42 项完全一致。证据 react-calendar-view-split-inventory.log，原文件备份 D:/Temp/sd-calendar-views-1794096666352.cy.ts。原聚合文件和一次性拆分脚本已删除，避免重复测试。
- 拆分后的全部 8 specs 在 Chrome 42/42 通过（react-calendar-view-split-browser.log，55 秒）；React 全源/浏览器类型检查通过（react-calendar-view-split-types.log），8 个 specs lint 通过，graphify 更新。
- 这是一项保留覆盖的执行隔离，不是已证明的 renderer 根因修复。当前仍在运行的 49-spec 清单已执行旧 Calendar 文件并记录失败，清单不会中途替换；下一次完整运行需采用新增 8 文件并保留本轮失败记录。组件/Core 源码、构建与文档输出未改变。

### 2026-11-08 Tree 数据 React 适配

- 新增内部 tree/use-tree-data.ts，直接复用 Core generateTreeData/getFlattenTreeData/getKey2TreeNode，组件实例持有 WeakMap 键缓存；每次 React 渲染重建节点模型以反映原地数据变更及动态字段/能力配置，不复制建树算法。
- tree-data.cy.ts 5/5 Chrome 通过（react-tree-data-browser.log，1 秒），覆盖数字 0 键、节点对象索引身份、重复 raw 对象的不同生成键及 rerender 稳定性、移除/替换/清空、custom fieldNames、回调式 selectable/checkable、懒加载叶子分类、连线几何和原地 title 更新。定向类型（react-tree-data-types.log）与 lint 通过，graphify 更新。
- 这是 Tree 内部数据适配，不是完整 Tree：选中/勾选/展开状态、加载与拖拽、键盘、节点视图、虚拟化、公共 API 和文档仍待实现。TreeSelect/JsonForm 依赖链也尚未完成；本次测试不在当前 49 文件完整清单内。
- 当前完整隔离运行已通过 JsonForm control/item/state，进入 kv-list；原 Calendar 和 ColorPicker 失败继续保留。Cascader 包级接入及正式文档构建仍待本轮结束后完成。

### 2026-11-08 Tree 勾选状态 React 适配

- 新增内部 tree/use-checked-state.ts，复用 Core createCheckedStateFoundation；受控值与节点模型/模式变化重新计算，释放受控时按共享契约清空，普通非受控重渲染保留本地勾选和半选。
- tree-checked.cy.ts 5/5 Chrome 通过（react-tree-checked-browser.log，NativeExit=0），覆盖默认父子联动、禁用子项、受控更新与释放、最新子节点重初始化、onlyCheckLeaf/checkStrictly 切换及严格模式外部 halfCheckedKeys。定向类型检查（react-tree-checked-types.log）与 lint 通过。
- 仍为内部状态适配，Tree 公共组件、展开/加载/拖拽/键盘视图和文档尚未完成；新增 5 项不在当前 49 文件整套清单内。整套运行已进入 thinking-orb（42/49），此前 Calendar renderer 和 ColorPicker 失败仍保留。

### 2026-11-08 TimePicker 关闭断言契约

- 当前完整隔离运行 time-picker.cy.ts 为 33/34，唯一失败在输入 Enter 后的关闭断言（time-picker.cy.ts:152）：默认 Trigger unmountOnClose=true 已卸载容器，旧 not.be.visible 要求查询元素存在，造成时序依赖。
- 核对 TimePicker root fixture 未覆盖 unmountOnClose，组件传递该值至 Trigger。只将该断言改为 not.exist，保留先确认打开、输入值和提交事件的断言；完整 TimePicker 34/34 Chrome 通过（react-time-picker-close-contract-browser.log，NativeExit=0），lint 通过。未改组件行为。
- 本轮 49-spec 原失败继续保留；后续完整运行仍须覆盖该修改。

### 2026-11-08 Cascader 正式包与文档接入

- 接入 React 根入口、./cascader 包导出和总 SCSS；文档示例与入口浏览器 fixture 改用正式 @sdata/web-react/cascader 和样式路径，移除源码相对导入。README 补充使用方式。
- 新增包 SSR 检查默认/具名/根入口/复合 Panel 身份、选中路径、原生属性和 ConfigProvider prefix。正式构建及全部包测试 266/266 通过（react-cascader-public-package-tests.log）；正式入口 Chrome 2/2 通过（react-cascader-public-browser.log）。
- 文档 build:site 完成 202 页（react-cascader-docs-build.log）；新正式 cascader-docs.cy.ts 7/7 Chrome 通过（react-cascader-formal-docs-browser.log），覆盖搜索与 ref、多选、完整路径/hover、异步加载、严格独立面板、自定义触发器及 Vue/React 同名页面往返。既有预览测试保留用于直接源示例验证。
- React 全源/浏览器类型检查（react-cascader-public-types.log）、文档 React 示例类型检查（react-cascader-formal-docs-types.log）、定向 lint 通过，graphify 更新。未提交或推送。

### 2026-11-08 完整隔离 E2E 第一轮结束

- 固定 49 文件全部执行完毕，进程 exit 1；证据 packages/web-react/isolated-e2e-1794094896095/inventory.json、summary.json 及各文件日志，主日志 react-isolated-full-acceptance.log。
- 48 个有完整结构化结果的文件合计 908 项，906 通过、2 项失败；另有旧 calendar-views 文件 renderer 丢失，未生成测试结果（工具 failures=4294967295 是运行失败码，不是测试数量）。因此不能把本轮称为 906/950 或完整测试通过。
- ColorPicker 和 TimePicker 失败都是已关闭后查询卸载元素的旧断言，已按默认卸载契约改为 not.exist；TimePicker 重跑 34/34。ColorPicker 关闭修正后的整文件重跑另有 hue 指针失败（41/42），20 次定向诊断未复现，仍待解决。旧 Calendar 42 项已原样拆分为 8 文件且定向全通过，但这不是 renderer 根因修复。
- 下一次完整回归必须包含拆分 Calendar、新增 Cascader/Tree 与两处关闭断言修正；多次完整 E2E 100% 的目标尚未达到。当前 5190 服务加载的是本轮旧依赖缓存，下一轮前须重启；5191 已重启供 Cascader 正式包验证，5187/5188 用户服务保持运行。

### 2026-11-08 Tree 操作状态 React 适配

- 新增内部 use-tree-state.ts，复用 Core createTreeFoundation 和 getDefaultExpandedKeys；适配默认/受控选中与展开、释放控制、勾选策略、展开动画状态、加载去重和错误回调，保留共享事件顺序与 raw node payload。
- use-tree-checked-state 返回勾选和半选 getter，避免同一 React 事件中连续操作读取上次渲染数组快照；新增连续勾选兄弟节点用例验证父级联动及 parent 公共输出策略。
- tree-state.cy.ts 新增 6 项与既有 tree-checked.cy.ts 5 项合计 11/11 Chrome 通过（react-tree-state-browser.log，NativeExit=0）。覆盖数字 0、禁用节点过滤、单选 selectAll、受控拒绝和释放、动画重入保护/结束、加载成功/拒绝/重试。React 全源和浏览器 typecheck（react-tree-state-types.log）、定向 lint 通过。
- 仍为内部适配：加载期间数据替换/新增子节点和卸载迟到结果边界尚未验证，Tree 完整视图、拖拽、键盘、虚拟化、公共包入口及正式文档尚未完成。11 项定向通过不是新的完整回归结果。

### 2026-11-08 Tree 基础节点视图 React 适配

- 新增 tree/node.tsx，复用 Core createTreeNodeFoundation 处理标题选择、切换展开、复选框及原生节点事件；沿用 Vue 的 treeitem ARIA、数字/字符串 key 元数据、缩进连线、展开/禁用/选中类名，复用 Checkbox、Ellipsis/PerformantEllipsis 和现有图标。
- 支持 Tree 级标题/图标/额外内容渲染及节点自身 icon/switcherIcon/loadingIcon/dragIcon 优先级；纯叶子无连线时保持空 switcher，loading 图标替代普通切换图标。新增 tree.scss 按需样式，引用共享 Tree SCSS。
- tree-node.cy.ts 最终 7/7 Chrome 通过（react-tree-node-final-browser.log，NativeExit=0），覆盖选择与勾选独立、禁用能力、数字 0、ARIA/缩进、事件 native payload、actionOnNodeClick、图标优先级/加载/隐藏、连线和省略。首轮唯一失败来自测试把只剩一个可勾选子节点的父级误判为半选；按共享规则修正为父级全选，未改勾选逻辑。
- React 全源与浏览器类型检查（react-tree-node-final-types.log）和定向 lint 通过，graphify 更新。该视图仍为内部：根 Tree、键盘焦点导航、拖拽交互/指示、长按与滑动、虚拟化/过渡、公共入口和正式文档尚未完整接入，不能视为 Tree 交付完成。

### 2026-11-08 Tree 键盘导航 React 适配

- 新增 use-keyboard.ts，复用 Core getActiveTreeKey/getTreeKeyAction；React 适配 roving tabindex、DOM focus、scrollToKey 和待挂载节点的焦点重试。选择/勾选/展开/加载继续调用共享 Tree Foundation，已取消事件及 IME composition 不触发导航。
- tree-keyboard.cy.ts 6/6 Chrome 通过（react-tree-keyboard-browser.log，NativeExit=0）：方向键、Home/End、默认选中 tab stop、数字 0/字符串 0 区分、Enter/Space、禁用节点、Right 懒加载、preventDefault、CSS 特殊字符 key、卸载/重新挂载后的 pending focus、节点移除后的活动 key 回退。
- React 全源与浏览器类型检查（react-tree-keyboard-types.log）、定向 lint 通过，graphify 更新。pending focus 用例是 DOM 延迟挂载夹具，不是实际虚拟列表集成验证；真实 Virtua 滚动与焦点仍需随 Tree 根组件验证。Tree 拖拽、触摸手势、展开过渡、公共入口和正式文档未完成。

### 2026-11-08 Tree 拖拽 React 适配

- 新增 use-drag.ts，复用 Core createDragSort 和 createTreeDragFoundation；React 维护 root 生命周期及拖拽状态重渲染，按节点标题几何计算放置区域，读取最新节点模型/allowDrop/回调。node.tsx 补充拖拽源、上方/下方间隙和内部高亮类名。
- tree-drag.cy.ts 最终 6/6 Chrome 通过（react-tree-drag-complete-browser.log，NativeExit=0），通过现有 Vue 共用 DOM pointer helper 执行真实 Sortable 手势，验证三种位置、事件 drop→leave→end 顺序、禁止子孙放置、allowDrop 属性更新、Escape 取消、单节点 draggable=false、根卸载清理及重新绑定；DOM 顺序不由 Sortable 修改。
- 首轮卸载夹具用 click 被 Sortable 拖拽抑制拦截，改为窗口事件直接卸载，并先断言根移除。第二轮清理已通过，但没有释放模拟指针，后续 remount 点击仍被抑制；补全 pointerup/mouseup/click 手势后全通过。未改共享驱动的点击抑制规则，原两次失败日志保留。
- 节点视图回归 7/7（react-tree-drag-browser.log 的第二个 spec），React 全源/浏览器类型检查（react-tree-drag-final-types.log）及定向 lint 通过，graphify 更新。
- 尚未验证实际虚拟列表跨屏/源节点回收拖拽与触摸设备；Tree 根组件、滑动/长按、展开过渡、公共入口与文档仍待完成。定向通过不是新一轮完整 E2E 结果。

### 2026-11-08 Tree 长按与滑动适配

- 新增 Core tree/gestures.ts DOM 驱动，按当前安装 VueUse 的 Tree 默认契约处理 500ms 长按、移动 10px 取消、50px 滑动阈值、四方向与 touchcancel 结束。React 节点绑定标题 ref，读取最新回调并在卸载时移除监听及清理待执行长按计时器。
- tree-gestures.cy.ts 6/6 与 tree-node.cy.ts 7/7 合计 13/13 Chrome 通过（react-tree-gestures-browser.log，NativeExit=0），覆盖四方向、阈值、取消、长按只触发一次、卸载前取消与重新挂载绑定。Core 构建（react-tree-gestures-core-build.log）、React 全源/浏览器类型检查（react-tree-gestures-types.log）、定向 lint 通过，graphify 更新。
- 当前 Vue 节点继续使用原有 VueUse 适配，未在本次改动中替换其依赖；共享驱动已用于 React，未验证真实触摸设备。Tree 根组件、虚拟列表集成、展开过渡、公共入口和正式文档仍待完成；本轮不是完整 E2E。

### 2026-11-08 Tree 根组件组合

- 新增内部 tree/tree.tsx，组合数据、状态、基础节点、键盘、拖拽和真实 VirtualList；提供选择/勾选/展开事件和 ref 查询/批量操作/scrollIntoView，沿用共享可见节点过滤与 Tree 根样式。
- tree-root 首轮复现 ref.checkNode 后立即 getCheckedNodes 返回旧数组；use-tree-state 返回状态改为实时 getter 后，根组件 2 项与状态回归 6 项合计 8/8 Chrome 通过（react-tree-root-final-browser.log）。真实 200 节点 Virtua 列表通过 ref 滚动到末项，非虚拟展开/勾选与同步 ref 查询通过。
- React 全源/浏览器 typecheck（react-tree-root-types.log）及定向 lint 通过，移除未使用 TreeNodeKey import，graphify 更新。仍为内部根组件：拖拽/手势公共事件、allowDrop、展开过渡、虚拟焦点/跨屏拖拽完整边界、包入口和文档尚未补齐，不能称为完整 Tree 交付。

### 2026-11-08 Tree 根组件公共事件

- Tree 根组件接通按 Vue 命名生成的全部 node DOM 事件、长按/滑动事件、拖拽事件及 allowDrop。节点事件传 raw node + native Event，手势传 raw node + event + direction 对象，拖拽延续 event/node 与 drop 对象契约；onNode 回调从原生根属性中过滤，避免泄漏到 DOM。
- tree-events.cy.ts 新增 4 项与根组合回归 2 项合计 6/6 Chrome 通过（react-tree-events-browser.log，NativeExit=0）。验证 nodeKeydown preventDefault 阻止展开、click raw node/native event、允许/禁止放置的拖拽回调、根级长按与 swipeStart/swipe/swipeEnd 数据。共享拖拽驱动继续管理 DOM 顺序。
- React 全源/浏览器类型检查（react-tree-events-types.log）、定向 lint 通过，graphify 更新。尚未补齐展开过渡、真实虚拟焦点与跨屏拖拽边界、公共包入口和正式文档；本轮定向结果不等于全量 E2E。

### 2026-11-08 Tree 实际虚拟列表交互验证

- 新增 tree-virtual.cy.ts，直接运行根 Tree + 200 节点 Virtua。3/3 Chrome 通过（react-tree-virtual-browser.log，NativeExit=0）：End/Home 跨屏挂载后实际 DOM focus 与唯一 tab stop、拖拽源 key=1 被虚拟回收后仍向 key=199 放置、滚动后开始拖拽的上方位置识别。
- 夹具增加窗口滚动事件以在拖拽中通过实际 ref.scrollIntoView 滚动，避免点击被 Sortable 拦截；断言源行确实从 Tree DOM 移除，末项可见、drop raw keys/position 及拖拽浮层清理。测试执行真实共享 Sortable 驱动，未替换 Virtua 或模拟 Foundation 结果。
- React 全源/浏览器类型检查（react-tree-virtual-types.log）、定向 lint 通过，graphify 更新。此次补齐真实虚拟交互证据，无组件行为修改；展开过渡、加载生命周期边界、公共包入口和正式文档仍待完成，也未获得新一轮完整 E2E 全绿结果。

### 2026-11-08 Tree 展开过渡

- 新增内部 transition-list.tsx，复用 Core createTreeExpandTransition、getTransitionTreeNodes 和 runCssTransition。非虚拟 Tree 默认 animation=true，过渡时暂存后代列表并按共享高度规则展开/收起，完成后 endExpand 清理状态；空后代立即结束。虚拟列表按 Vue 当前契约不使用展开动画，支持 animation=false。
- tree-transition.cy.ts 新增 2 项，连同 root/events/virtual 共 11/11 Chrome 通过（react-tree-transition-browser.log，NativeExit=0）。覆盖临时列表隐藏溢出、动画完成移除、收起后节点移除、再次展开、关闭动画直接更新，及既有真实 Virtua 焦点与跨屏拖拽回归。
- React 全源/浏览器类型检查（react-tree-transition-types.log）、定向 lint 通过，graphify 更新。尚未验证加载生命周期边界、复杂嵌套/受控动画中数据替换；Tree 公共包入口、完整 API 对照和正式文档仍待完成。不是完整 E2E 新一轮全绿结果。

### 2026-11-08 Tree 加载请求身份与取消

- Core Tree Foundation 新增请求记录，按每次请求及 raw node 身份处理同键替换；旧请求不再阻止替换节点加载、清除新请求 loading 或展开/勾选新节点。新增 cancelPendingLoads，React state adapter 在卸载/StrictMode effect 清理时调用。
- 新回归在修复前失败（react-tree-loading-before.log）；修复后 Core tree-model 15/15 通过（react-tree-loading-after.log），包括同键替换及取消后同 raw node 重试，确保旧请求不能冒充新请求。
- 浏览器初次 root/transition 4 项通过，state 加载用例失败：夹具每次渲染重建 raw nodes，因此按新身份规则忽略旧结果。将该普通加载夹具稳定为实例 ref 后 state 6/6 通过（react-tree-loading-fixed-browser.log）。修正夹具时出现一次括号语法错误，已修复，最终 React 全源/浏览器 typecheck（react-tree-loading-types.log）与定向 lint 通过。原失败日志保留。
- Core 构建通过，graphify 更新。未验证 React 同一 Promise 内更新数据与 resolve 的提交顺序、Vue 卸载取消挂接以及完整浏览器加载替换/卸载场景；公共入口与文档仍未完成。本轮不是全量 E2E。

### 2026-11-08 Tree 加载后 React 提交同步

- 新增根 Tree 加载夹具：异步 loader 修改同一 raw node.children，触发 React 更新后立即完成。修复前新子节点未得到正确勾选，浏览器回归失败（react-tree-loading-commit-before.log）。
- Core TreeAdapter 新增可选 afterLoad 提交等待，React 通过一次布局提交同步模型后再继续展开/勾选；卸载清理结束提交等待，Foundation 再检查请求记录以忽略取消结果。其他适配器未提供该等待时保留原行为。
- 修复后 loading 新用例与 state 回归合计 7/7 Chrome 通过（react-tree-commit-browser.log，NativeExit=0），新子节点可见且勾选，事件 expand→check:root,child。Core tree-model 15/15（react-tree-commit-core-tests.log）、Core 构建、React 全源/浏览器类型检查（react-tree-commit-types.log）及定向 lint 通过，graphify 更新。
- 验证范围为保留 raw 父节点身份并更新 children 的加载方式；不可变替换父节点仍按节点替换规则处理，相关 API 契约需继续对照。完整浏览器替换/卸载边界、Vue 卸载挂接、公共包入口与文档尚未完成。

### 2026-11-08 Tree 正式入口与文档

- 新增 tree/index.ts 默认/具名及类型导出，接入 ./tree 包入口、根导出和总 SCSS。新增包 SSR 检查入口身份、原生属性、数字 key、默认展开/勾选、Provider prefix 与自定义标题；正式构建及全部包测试 268/268 通过（react-tree-public-package-tests.log）。README 增加按需用法。
- 新增 React TreeDemo 三个正式包导入示例及 react/components/tree MDX，说明受控/默认状态、数据与渲染、加载、虚拟化、事件、键盘及 ref。文档构建 203 页通过（react-tree-docs-build.log，58.75 秒）；正式路由 tree-docs.cy.ts 4/4 Chrome 通过（react-tree-formal-docs-browser.log），覆盖受控清空与再勾选、异步分支一次加载、千节点末项滚动和 Vue/React 同名切换。
- 文档示例类型（react-tree-docs-types.log）、React 全源/浏览器类型（react-tree-public-types.log）与定向 lint 通过，graphify 更新。尚未完成 Tree 全面 Vue API 对照、不可变父节点替换加载契约、完整卸载浏览器测试和 Vue 取消挂接；不能据此宣布 100% Tree/API 或整体迁移完成。多个其他组件及多轮完整 E2E 全绿仍未达到。

### 2026-11-08 Tree Vue API 默认值对照修正

- 实际对照 Vue tree.vue 发现 React defaultExpandAll 默认 false 与 Vue 默认 true 不一致；已改为 true。补齐 size=medium、mini/small/medium/large 根类名及虚拟默认 itemSize 24/28/32/36（用户指定 minItemSize 时不覆盖），虚拟高度未指定时使用 100% 与根 minHeight=0。新增 searchValue，在值变化时更新节点视图 key，保持 Vue 现有重建契约。
- 新增 tree-api.cy.ts 验证默认分支展开及 medium 类名、mini 实际 24px 几何和显式 defaultExpandAll=false；连同 root/virtual/loading/transition 共 10/10 Chrome 通过（react-tree-api-browser.log）。既有根夹具本就显式传入 false，继续覆盖折叠交互。
- 正式构建和全部包测试再次 268/268（react-tree-api-package-tests.log），React 全源/浏览器类型检查（react-tree-api-types.log）与定向 lint 通过，MDX 参数说明同步，graphify 更新。本次未重新构建文档或验证新虚拟默认行高/无高度布局的全部边界。
- 源目录对照仍缺少完整 React basic-crud-table、chat-composer、file-previewer、header-list、markdown-render、model-selector、rich-text-editor、sender、table、tree-select、upload；json-form/toolbar 尚有内部适配未交付。该清单不是完整 API/文档审计，整体目标及多轮完整 E2E 全绿仍未完成。

### 2026-11-08 全部组件验收基线

- 用户明确范围为所有组件。新增 scripts/verify-react-component-inventory.ts，从当前 Vue 正式 components/index.ts AST 提取全部 100 个公共组件组，对照 React 根具名导出、源目录、子路径、SCSS 和文档；生成 docs/react-component-inventory.json。全部 behaviorVerified 保持 false，避免把文件存在当作 API/行为验收。
- 首次发现 15 组结构缺口，包含已实现 LiquidGlassLogo 缺少 Vue 公共常量；已补 root/subpath 的 defaults/duration/themes/noteLogo/referenceMark 和 Tuning 类型，直接复用 Core。正式构建及 LiquidGlassLogo 包测试 3/3 通过（react-logo-exports-build.log、react-logo-exports-tests.log）。组件行为未改，不新增浏览器用例。
- 更新清单为 100 组、14 组存在结构检查缺口（react-component-inventory.log）。clamp/config-provider/theme-provider 的样式差异可能是有意共享入口，仍待逐项核对；目录里未公开的内部组件不会误计为公共交付项。脚本退出非零保留缺口信号，不能称为迁移通过。
- 清单脚本类型检查（react-component-inventory-types.log）与定向 lint 通过，graphify 更新。清单仅覆盖运行时导出与交付文件存在性，所有组件还需逐项核对 props/types/events/render props/ref/controlled/样式与完整运行时验收；目标仍为全库 1:1，未缩小到列出的缺失组件。

### 2026-11-08 TreeSelect React 选择适配

- 新增 tree-select/use-selection.ts，复用 Core createTreeSelectValues/createTreeSelectFoundation 和既有 useAfterRender；处理默认/受控键、控制释放、labelInValue、路径标签、缺失节点 fallback、选择/清空/移除、disabled/readonly，以及回调和 Form 通知顺序。
- tree-select-selection.cy.ts 4/4 Chrome 通过（react-tree-select-selection-browser.log，NativeExit=0），验证数字 0、单选关闭/清空输入、受控拒绝与释放、多选路径 label value/数字标签移除、缺失节点原标签及禁用/只读保护。React 全源/浏览器类型检查（react-tree-select-selection-types.log）与定向 lint 通过，graphify 更新。
- 全量 100 组件清单重新生成，TreeSelect 仅新增内部选择适配；下拉视图、搜索/交互、Tree 面板接入、完整 API、包入口和文档尚未完成。全部组件 1:1 的目标保持不变，本次内部测试不代表 TreeSelect 或全库验收完成。

### 2026-11-08 TreeSelect 实际 Tree 面板

- 新增 tree-select/panel.tsx，复用 Core createTreeSelectPanelFoundation，组合实际 Tree/Scrollbar；覆盖选择键、勾选键与标题点击转 toggleCheck，沿用虚拟包装样式及 scrollbar 参数。TreeInstance 类型补齐已由 Foundation 提供的 toggleCheck 方法。
- 新增 tree-select.scss，复用共享 TreeSelect SCSS 与 Select/Tree/Scrollbar 依赖。tree-select-panel.cy.ts 3/3 Chrome 通过（react-tree-select-panel-browser.log，NativeExit=0），验证数字 0、原生 Tree 选中、禁用节点、标题与复选框的父子联动、受控拒绝与真实虚拟面板布局。
- React 全源/浏览器 typecheck（react-tree-select-panel-types.log）与定向 lint 通过，graphify 更新。搜索过滤、空状态由完整下拉根组件继续实现；目前仅内部面板，未完成弹层/键盘触发器、公共入口或文档，也不是完整 TreeSelect 交付。

### 2026-11-08 TreeSelect 搜索与交互适配

- 新增 use-filter.ts，复用 Core getFilteredTreeKeys/matchTreeNodeKey，保留 Vue 100ms 防抖、fieldNames key、命中祖先保留、自定义过滤及禁用过滤语义；效果清理取消待执行计时器。
- 新增 use-interaction.ts，复用 Core createTreeSelectInteraction；适配 input/defaultInput、popupVisible/show 及默认值、只读提示、输入/搜索和弹层回调顺序。内部值变更不覆盖受控值，释放受控输入清空本地输入。
- tree-select-interaction.cy.ts 4/4 Chrome 通过（react-tree-select-interaction-browser.log，NativeExit=0），验证映射键命中/祖先路径、定制标签过滤、空结果、禁用过滤、弹层/输入/搜索/关闭 blur 顺序、受控拒绝与只读提示。React 全源/浏览器类型检查（react-tree-select-interaction-types.log）和定向 lint 通过，graphify 更新。
- 尚未组装完整下拉根组件/触发器键盘/空状态展示，也未交付公共入口与文档；TreeSelect 内部适配并不代表组件完成。全部 100 组件仍按全量基线推进，未缩小范围。

### 2026-11-08 TreeSelect 下拉根组件组合

- 新增内部 tree-select.tsx，组合已有选择/搜索/交互 hooks、Core presentation、SelectView、Trigger、Tooltip、真实 Tree 面板及 Empty；接入基础 ref focus/blur、Form disabled/size/error/change、单选/勾选、输入和清空、搜索祖先展开。
- 首轮 3 项全部失败，弹层因 display:contents 包装元素没有有效定位锚点而保持隐藏；沿用 Cascader 的实际 SelectView target 解析并传入 Trigger/Tooltip referenceElement 后，3/3 Chrome 通过（react-tree-select-root-final-browser.log，NativeExit=0）。覆盖单选关闭与 ref focus、搜索命中/空结果、标题勾选与多选弹层保留。原失败证据 react-tree-select-root-browser.log 保留。
- React 全源/浏览器 typecheck（react-tree-select-root-types.log）及定向 lint 通过，graphify 更新。仍需补触发器键盘、完整 Vue props/aliases/custom trigger/虚拟配置对照、Form 行为边界、公开包入口与正式文档；当前基础下拉通过不代表 TreeSelect 完成。全部 100 组件的 1:1 目标仍保持。

### 2026-11-08 TreeSelect API 别名与能力

- 对照 Vue 根 props，补 options/data、checkable/treeCheckable、filterable/allowSearch、clearable/allowClear、border、checkStrategy/treeCheckedStrategy、selectable（含 leaf/回调）、顶层 virtualListProps/virtualScroll 及 triggerProps/popupContainer/floatingOptions。搜索/清空与虚拟尺寸使用 Core 解析函数；leaf 父节点标题只展开不选择，模型和实际面板使用同一能力判定。
- tree-select-alias.cy.ts 最终 4/4 Chrome 通过（react-tree-select-alias-final-browser.log），覆盖 checkable/filterable、leaf 能力与虚拟开关；根下拉回归 3/3（react-tree-select-alias-browser.log 第一文件）。首轮别名夹具显式传 allowSearch=undefined，被共享 hasLocalProp 优先级判为本地主属性，修正为省略该属性后通过；组件未改该契约。
- React 全源/浏览器 typecheck（react-tree-select-alias-types.log）与定向 lint 通过，graphify 更新。此次仅为部分 API 补齐，options/clearable/弹层容器等新增表面尚需独立运行验证；键盘入口、默认全局虚拟配置、custom trigger/header/footer/loading、Form 边界、公开入口和文档仍待完成。

### 2026-11-08 TreeSelect 自定义内容

- 新增 renderTrigger 及共享 presentation 生成的 value/displayValue/inputValue/selectedOptions/popupVisible/disabled/loading/multiple 状态；自定义触发器实际 DOM 同时作为弹层锚点和 ref focus/blur 目标。
- 补 header/footer、showHeaderOnEmpty/showFooterOnEmpty、empty/loader、Spin props、Scrollbar props、dropdownClassName/style。空数据现在进入 Empty 分支；虚拟面板取消外部最大高度限制，加载时优先显示 loader/Spin。
- tree-select-custom.cy.ts 4 项与 root 回归 3 项共 7/7 Chrome 通过（react-tree-select-custom-browser.log，NativeExit=0），验证自定义触发器选中显示/ref focus、头尾内容、空状态显示开关、加载后真实面板。React 全源/浏览器 typecheck（react-tree-select-custom-types.log）及定向 lint 通过，graphify 更新。
- 尚未验证新增配置的全部组合、Spin 默认加载和 Scrollbar 配置边界；键盘入口、全局虚拟配置、Form 生命周期、公开入口与正式文档仍待完成。全量 100 组件行为验收仍未完成。

### 2026-11-08 TreeSelect Form/Provider 与正式入口

- 对照 Vue 当前模板确认触发器没有单独 ArrowDown 开启实现，保留相同基线；补 combobox aria-haspopup=tree/aria-autocomplete、失焦清空输入、共享 resolveDropdownVirtualList 全局配置继承。
- tree-select-form.cy.ts 3/3 Chrome 通过（react-tree-select-form-browser.log，NativeExit=0）：真实 Form blur/change 必填校验、选中后解除错误、disabled 继承/ref focus 保护、全局虚拟列表与搜索失焦清理。React 全源/浏览器 typecheck（react-tree-select-form-types.log）与定向 lint 通过。
- 新增 tree-select/index.ts、./tree-select 子路径、根入口和总 SCSS。正式构建与公开包 SSR 2/2 通过（react-tree-select-public-build.log、react-tree-select-public-tests.log），核对根/具名/默认入口身份、数字 0/ARIA、options 别名及自定义触发器原始选项。
- 全量 100 组件清单重新生成，graphify 更新。TreeSelect 正式文档尚未交付，完整 props/样式组合与浏览器全部边界尚未审计；SSR/定向通过不代表该组件或全库 1:1 完成。

### 2026-11-08 TreeSelect 正式文档

- 新增正式 React TreeSelectDemo 四个包导入示例（受控标题搜索/ref、多选勾选、异步分支、自定义触发器与头尾）和 react/components/tree-select MDX，说明参数、别名、数据/加载身份、回调及公开 ref。README 补充按需用法。
- 文档 build:site 完成 204 页（react-tree-select-docs-build.log，75 秒）。正式路由 E2E 4/4 Chrome 通过（react-tree-select-docs-browser.log，NativeExit=0），覆盖实际水合、搜索受控选择、多选保留、异步子节点选择、自定义内容以及 Vue/React 同名路由往返。
- 当前构建全部 React 包测试 271/271（react-tree-select-package-suite.log）通过；示例类型（react-tree-select-docs-types.log）、React 全源/浏览器类型（react-tree-select-docs-all-types.log）及定向 lint 通过，graphify 更新。100 组件清单重新生成，13 组仍有结构缺口，全部行为验收未完成。
- 这完成 TreeSelect 当前文档交付链路，不代表全面 props/样式组合和全库 1:1 审计完成。多轮完整浏览器全绿仍缺证据，原 Calendar/ColorPicker 运行问题仍需处理，继续保留风险记录。

### 2026-11-08 Upload React 状态生命周期

- 新增 upload/use-upload.ts，直接复用 Core createUploadFoundation：React 负责列表状态刷新、读取最新选项/回调和 Form 通知。Foundation 在布局 effect 内创建，清理时 dispose，保证 StrictMode 重放后使用新实例。默认/外部 fileList 同步，公开内部 submit/abort/remove/updateFile/uploadFiles 操作。
- upload-state.cy.ts 4/4 Chrome 通过（react-upload-state-browser.log，NativeExit=0），真实 input.selectFile 后用自定义 request 验证上传/进度/成功顺序、手动提交、限额、beforeUpload 拒绝、abort 后迟到成功忽略及 StrictMode 卸载中止。
- React 全源/浏览器 typecheck（react-upload-state-types.log）与定向 lint 通过，100 组件结构清单刷新，graphify 更新。测试使用 customRequest，没有验证真实 XHR/网络传输。控件视图、拖放/目录输入、三种文件列表、预览、受控深层列表变更、公开入口和正式文档仍待完成；该内部适配不是完整 Upload 交付。

### 2026-11-08 Upload 文件选择与拖放视图

- 新增内部 upload/button.tsx，复用 Core createUploadInput、现有 Button/图标/本地化，覆盖隐藏文件输入、重复选择后重置、accept/multiple/directory、拖放 enter/leave 状态、disabled/hide、自定义内容及默认/拖拽/picture-card 展示。input click 停止冒泡避免重复触发选择动作。新增 upload.scss 共享样式入口。
- upload-button.cy.ts 最终 4/4 Chrome 通过（react-upload-button-final-browser.log），验证重复同文件选择、drop accept 过滤/单选、多选/禁用拒绝、picture-card 与目录属性。首轮目录测试链在 have.attr 后 subject 变为属性字符串，拆开断言后通过，原失败日志保留。
- React 全源/浏览器 typecheck（react-upload-button-types.log）及定向 lint 通过，graphify 更新。目录验证仅确认 DOM 属性，未遍历实际目录；真实文件系统选择器/目录上传、自定义 onButtonClick Promise、三类列表、预览、根 Upload、包入口和文档尚未完成。

### 2026-11-08 Upload 三类文件列表

- 新增内部 upload/list.tsx，复用 Core getUploadFileKind/getProgressStatus 和现有 Progress/Tooltip/图标/本地化；支持 text/picture/picture-card、文件名/图片/整项/额外操作定制、链接与下载、开始/重试/取消/删除/预览回调及键盘激活。SCSS 入口补齐 Progress/Tooltip 依赖。
- upload-list.cy.ts 4/4 Chrome 通过（react-upload-list-browser.log，NativeExit=0）：定制文件名/文件类型图标、Enter 删除、错误重试后进度与取消、缩略图/下载链接、卡片自定义图片与 Space 开始。React 全源/浏览器 typecheck（react-upload-list-types.log）和定向 lint 通过。
- 测试后进一步对照修正卡片错误的默认 ImageClose 图标及 upload-icon-error 包装，类型检查再次通过；该错误卡片分支未重新执行浏览器，保留验证缺口。graphify 更新。
- 列表过渡/卡片视觉与全部图标插槽组合、预览层、根 Upload、真实 XHR、公开入口和文档尚未完成；4 项内部列表通过不代表 Upload 或全库 1:1 完成。

### 2026-11-08 Upload 根组件与预览

- 新增内部 upload/upload.tsx，组合 useUpload、UploadButton、三类 UploadList 与现有 ImagePreviewGroup，复用 Core accept/limit/按钮隐藏/预览函数；接入 Form disabled/change、wrapper 类名与 submit/abort/updateFile/upload ref。upload.scss 补 Image 依赖。
- upload-root.cy.ts 3/3 Chrome 通过（react-upload-root-browser.log，NativeExit=0），验证真实 input 文件选择→请求状态→完成→删除、限额隐藏/恢复、手动 ref 提交，以及默认图片列表通过共享预览层显示/关闭并发出原文件回调。React 全源/浏览器类型检查（react-upload-root-types.log）及定向 lint 通过，graphify 更新。
- 请求使用 customRequest，未验证真实 XHR。当前根节点 attrs 与 showFileList=false 的 DOM 契约、普通 tip 展示、深层受控列表变化、完整图标/过渡、Form 校验、实际目录和 Web Locks、公开入口及正式文档仍待完成；不能称为完整 Upload 1:1 交付。

### 2026-11-08 Upload 真实 XHR 验证

- 新增独立 loopback HTTP 接收端 scripts/serve-upload-test.ts（5192），接收并记录真实 multipart，请求路径支持成功 JSON、HTTP 500、延迟响应与释放；仅允许回归服务 5190/5191 Origin。根夹具 real 模式使用 Core 原生 XMLHttpRequest，未拦截/替换网络响应。
- upload-network.cy.ts 最终 3/3 Chrome 通过（react-upload-network-final-browser.log，NativeExit=0），验证接收端实际收到 document 文件名/body、team 表单字段、X-Upload-Test 请求头及 multipart boundary；真实 500 显示错误；确认延迟请求已到接收端后 abort，释放服务端后仍为错误，迟到成功不改变状态。
- React 全源/浏览器类型（react-upload-network-types.log）、接收端 Node 类型（react-upload-receiver-types.log）与定向 lint 通过，graphify 更新。接收端当前保持运行供后续全套回归，启动命令 mise exec -- node packages/web-react/scripts/serve-upload-test.ts。
- 这证明本地浏览器真实 XHR 成功/失败/取消，不覆盖生产服务、真实认证/cookie、Web Locks 或实际目录。Upload DOM/API 对照、Form、列表过渡、公开入口和文档仍待完成，全库目标未完成。

### 2026-11-08 Upload DOM 契约与正式入口

- 修正 showFileList=false 时多余 div，按 Vue 返回按钮 span 或普通 tip 包装 span；showFileList/showUploadButton 均为 false 时返回空。补普通 tip、原生 HTML/aria/data 属性及点击透传，内部根属性从组件选项分离，input click 仍阻止冒泡避免重复选择。删除提前返回后的不可达列表分支。
- upload-dom.cy.ts 3/3 Chrome 通过（react-upload-dom-browser.log，NativeExit=0），核对 wrapper/span 标签与属性、tip 和一次 click。React 全源/浏览器 typecheck（react-upload-dom-types.log）及定向 lint 通过。
- 新增 upload/index.ts、./upload 子路径、根入口和总 SCSS。正式构建与公开包 SSR 2/2（react-upload-public-build.log、react-upload-public-tests.log）通过，核对默认/具名/根入口身份、默认文件显示、button-only 属性与 tip。100 组件清单刷新，graphify 更新。
- 文档、Form 校验、受控深层列表、列表过渡、完整卡片视觉、Web Locks 和实际目录仍未完成；新增公开入口不代表 Upload 或全库 1:1 完成。DOM 夹具 click 回调仅在 nolist 场景开启，避免改变既有上传/预览事件记录。

### 2026-11-08 Upload 受控列表与 Form

- 新增 upload-form 夹具/spec，首轮 2/3，复现同一 fileList 数组原地修改 name/status 后界面不更新（react-upload-form-before-browser.log）。useUpload 现在逐次渲染比较文件项自身字段的浅快照及数组结构；变化仍交给 Core checkFileList 重建映射，不复制上传规则。响应对象引用内的深层变动未单独实现深比较。
- 修复后 Form/root/state 共 10/10 Chrome（react-upload-form-browser.log 前三文件）通过，覆盖同引用字段修改/数组删除、受控文件新增和移除、required Form change 校验、禁用拒绝删除及原有上传流程。
- 同次网络回归 2/3，取消用例接收端尚未收到完整请求，旧断言只重试第一次空响应。改为有上限重新 GET 接收端状态后确认收到再 abort，网络最终 3/3（react-upload-form-network-final.log）通过；原失败保留。递归 helper 初始 Chainable 类型声明不兼容，改为显式排入 Cypress 队列的 void helper，最终全源/浏览器 typecheck（react-upload-form-types.log）通过。
- 定向 lint 通过，graphify 更新。仍需验证响应对象深层变更、并发受控替换请求、列表过渡/卡片视觉、Web Locks/目录及正式文档；本轮不是全套浏览器回归结果。

### 2026-11-08 Upload 文档与 SSR 默认状态

- 新增 React UploadDemo 三个正式包示例（明确标注模拟请求、手动 ref 提交、实际共享图片预览）及 upload MDX，说明真实 XHR、customRequest/abort、文件状态、全部主要配置、渲染入口、回调和 ref。README 同步按需用法。
- 补 SSR 初次默认文件状态：Core 抽出 normalizeUploadFile，Foundation 和 React 初始值共用，未指定 status 的默认文件服务端也渲染 done；SSR 测试新增 done 类名断言。Core 上传/预览 16/16（react-upload-core-regression.log）、公开 Upload SSR 2/2（react-upload-docs-ssr-tests.log）、全部 React 包测试 273/273（react-upload-package-suite.log）通过。
- 文档 build:site 205 页完成（react-upload-docs-build.log），正式 upload-docs.cy.ts 3/3 Chrome（react-upload-docs-browser.log，NativeExit=0）通过：模拟上传/完成/删除、手动提交、真实预览层和 Vue/React 同名切换。示例/全源浏览器类型（react-upload-docs-types.log、react-upload-docs-all-types.log）与定向 lint 通过，graphify 更新。
- 100 组件清单更新后 12 组有结构缺口。Upload 列表过渡/全部卡片视觉、实际目录、Web Locks、并发受控替换/深响应等仍待全面验证；文档模拟请求不作为真实网络证据，真实网络证据保留此前 upload-network。全库 API/行为对照及完整 E2E 多轮全绿仍未完成。

### 2026-11-08 FilePreviewer React 状态适配

- 新增内部 file-previewer/use-preview.ts，复用 Core createFilePreviewer/shouldRenderFile/shouldUseImagePreview；处理受控/默认显示、fullscreen/inline、加载状态、关闭/遮罩/Escape、source/type/插槽变化同步和请求代次隔离。资源端口读取最新 adapter，卸载失效请求并销毁 PDF。
- file-preview-state.cy.ts 4/4 Chrome 通过（react-file-preview-state-browser.log，NativeExit=0），验证 loaded/error、原生 Escape 与 close→visible:false 顺序、受控拒绝、inline 保留渲染、自定义内容立即 loaded、源变更重置和迟到媒体准备不覆盖图片状态。
- React 全源/浏览器 typecheck（react-file-preview-state-types.log）与定向 lint 通过，100 组件结构清单更新，graphify 更新。资源端口在夹具中提供可控 Promise，不是实际 PDF/media 渲染证据；图像/PDF/媒体视图、弹层焦点/滚动锁、worker、公开入口和文档均待实现，不能视为 FilePreviewer 已完成。

### 2026-11-08 FilePreviewer 真实 PDF 适配

- 新增 React use-pdf.ts，直接复用 Core createPdfController/loadPdfModule/resolvePdfWorker，读取最新 src/pdfProps，维护 doc/page/numPages 并负责卸载 destroy。Core 新增延迟加载的 pdf-worker-url 模块，资源路径从 Core 的 pdfjs-dist 依赖解析，避免 React 另加依赖。
- PDF 测试数据沿用 Vue 已有两页最小 PDF 构造，真实 pdf.js 解析/渲染，不 mock document/page/render。file-preview-pdf.cy.ts 最终 2/2 Chrome（react-file-pdf-final-browser.log，NativeExit=0）通过：loaded、1/2→2/2 边界、canvas 100px→200px 缩放、destroy 后文档状态归零。
- 首轮夹具把 PdfContext.src getter 写成字符串，类型检查及浏览器均失败，修正后 React 全源/浏览器 typecheck（react-file-pdf-types.log）、Core 构建（react-file-pdf-core-build.log）、定向 lint 通过，graphify 更新。初次失败日志保留。
- 未单独证明 worker 线程实际执行，也未覆盖 worker=false/workerPort/workerSrc 全部优先级、PDF 请求竞争及生产打包资产。完整 PDF 视图/工具栏、媒体、图片/弹层、公开入口与文档尚未完成；内部控制器通过不代表 FilePreviewer 交付。

### 2026-11-08 FilePreviewer PDF 视图

- 新增内部 pdf-view.tsx，组合真实 usePdf 控制器、共享 PDF canvas/toolbar 类名、分页按钮本地化/禁用边界、加载/错误状态及 renderPdf 插槽状态与文档操作；file-previewer.scss 复用 Core 样式和 Image 依赖。
- file-preview-pdf-view.cy.ts 3/3 Chrome 通过（react-file-pdf-view-browser.log，NativeExit=0），真实解析两页 PDF 后点击分页/缩放并断言画布尺寸，实际无效 PDF 显示 role=alert，custom PDF 状态跳页后切回默认 canvas 保留页码并重新绘制。
- React 全源/浏览器 typecheck（react-file-pdf-view-types.log）与定向 lint 通过，graphify 更新。未实现 Vue 没有的额外缩放/旋转工具栏，缩放来自 pdfProps；旋转、更多 worker/竞态/生产资源路径仍待验证。完整图片/媒体/全屏弹层、公开入口和正式文档尚未完成，全部 100 组件目标保持。

### 2026-11-08 FilePreviewer 公开组合、媒体与文档

- 新增 media-view.tsx，复用 Core media 属性合并、皮肤标签和请求代次保护；React 事件名适配 loadedData/playsInline。真实 WAV 加载与错误回调、实际 Audio/Video.js Neutral 自定义元素和属性透传、自定义媒体状态恢复，file-preview-media.cy.ts 3/3 Chrome（react-file-media-browser.log）通过。此验证未播放真实视频，也不覆盖自动播放策略。
- 新增 FilePreviewer 公开组合与完整配置/类型、默认与命名子路径/根入口、样式汇总。复用 Core FilePreviewer/弹层堆栈/滚动锁、React Image、PDF 和音视频视图；提供全部类型 render 回调、受控/默认显示、inline、关闭控制与 ref。PDF 自定义加载/错误回调转发状态；PDF 视图可受父状态控制，ref.onError/onLoad 同步实际覆盖层。
- file-previewer.cy.ts 5/5、pdf-view 3/3（react-file-final-browser.log）通过，覆盖真实图片、容器传送/聚焦/滚动锁、遮罩/Escape/锁定/ref、真实 PDF 分页及 ref 错误恢复。最初图片断言误要求隐藏根节点移除，已按 Image 实际保留隐藏根节点调整；初始失败日志保留。
- 正式示例/MDX 支持图片、inline、自定义内容和全部主要配置说明，README 同步。build:site 最终 206 页（react-file-docs-build-final.log），文档交互 2/2（react-file-docs-browser-final.log）通过；文档首次关闭断言误要求已卸载 wrapper 可见性，修正为 not.exist，保留首次失败日志。生产构建生成 PDF worker 资源，但未验证生产环境 PDF Worker 实际执行。
- React 全包 275/275（react-file-package-suite.log）、最终公开入口 SSR 2/2（react-file-final-ssr.log）、源码/浏览器与示例类型、定向 lint 通过。100 组件清单更新为 11 组结构缺口（react-component-inventory.log）；已有组件仍需完整行为对照，清单 behaviorVerified 保持 false。所有组件目标未完成，未进行全量 E2E/跨浏览器或全部媒体/PDF 参数组合验收。

### 2026-11-08 Table React 查询与行状态适配

- 新增内部 use-query/use-pagination/use-row-selection/use-expand，直接复用 Core 筛选、排序、legacy 分页、行选择和展开 Foundation；保留 Vue 受控值优先级、默认值变化、clearSorters 仅通知语义、跨页选择、事件顺序及本地状态。
- table-query.cy.ts 4/4（react-table-query-browser.log），table-row-state.cy.ts 4/4（react-table-row-browser.log）Chrome 通过；包括受控空过滤/排序/选中/展开、默认值重置、同步批量操作、禁用/跨页 key、radio、动态全量展开。Core table.test.ts 4/4（react-table-core-regression.log）、全源/浏览器类型（react-table-query-types.log、react-table-row-types.log）、定向 lint 通过。
- 此处只完成内部状态适配，Table 公开入口、列/单元格视图、过滤面板、排序/列调整/拖拽、固定列/虚拟滚动/异步加载、完整 API 与文档仍未完成；不以状态适配通过作为 Table 完成交付。

### 2026-11-08 Table 列查询、异步加载及 React 事件桥接

- 新增 use-column-query，复用 Core 列排序与过滤 Foundation。table-column-query.cy.ts 3/3（react-table-column-browser.log）Chrome 通过，覆盖升/降/清除排序循环、原生事件、过滤草稿在无关重渲染中保留、确认/重置、外部值与复用列字段变化。TNB 自引用 getter 类型推断需显式返回类型，已使用现有 Foundation state 类型标注，未添加编译器抑制。
- 新增 use-cell-loading，直接复用 Core 请求 generation/reset 逻辑；保持 raw 行身份时保留请求，替换/卸载时 reset，避免过期响应写入新行。初次 0/3（react-table-cell-browser.log）真实暴露 nativeEvent.stopPropagation 无法阻止 React 合成事件父级回调，适配器现在同时处理 React MouseEvent 的 stopPropagation。FilePreviewer Escape 也补桥接，并新增父级键盘回调不触发断言。
- 最终 table-cell-loading 3/3 + FilePreviewer 5/5（react-table-events-browser-final.log，NativeExit=0）通过，覆盖重复点击去重、raw 包装变化、替换后旧请求不清除新请求、卸载过期响应、叶子/已有 children 不请求、点击/键盘冒泡边界。所有 Table 适配器当前共 14 个定向 Chrome 用例通过，公开 Table 视图仍未交付。
- 最终 React 源码/浏览器类型（react-table-final-types.log）与定向 lint/diff check 通过，图谱更新。FilePreviewer 最新事件桥接已在开发构建验证；文档生产构建/275 包测试记录在该桥接之前，此一行后未重复全量构建和包套件。全库多轮 E2E、跨浏览器及剩余公开组件实现继续保留为未完成。

### 2026-11-08 Table React 单元格、操作列、列宽与数据视图

- 新增 Table 公共数据/列/筛选/操作/摘要/跨度类型以及内部 Thead/Tbody/Tr/Th/Td 视图。表头复用 Core 列查询与布局 Foundation、真实 Trigger/Checkbox/Radio/Button/Ellipsis；支持键盘排序、ARIA、列内容/标题定制、固定列/跨度与共享样式。单元格复用 Core 路径取值、布局与 lazy-load 请求保护，支持 render/slot、自定义类/样式、摘要、缩进、内联展开、真实加载状态与工具提示。
- 新增内部 OperationTh/OperationTd，直接复用 Core 表头勾选状态与树形操作 Foundation，保留跨页/禁用边界、strict/radio、定制操作、展开与拖动图标、summary 隐藏操作。新增 use-column-resize 接 Core window 鼠标驱动、最小 40px、mouseup/contextmenu/卸载清理；列宽更新驱动 React 重渲染。
- table-cells.cy.ts 最终 4/4（react-table-cells-browser-layout-final.log）、table-operations.cy.ts 4/4（react-table-operations-browser.log）、table-resize.cy.ts 3/3（react-table-views-browser-final.log）Chrome 通过。最初测试用不可见原生 checkbox 做 check、Ellipsis 总文本含隐藏测量副本，已改为真实 label 点击与可见内容断言；此前 fixture 未使用共享 CSS grid 变量/行组、声明操作宽度却未渲染占位导致固定列重叠，以及 Cypress 点击卸载按钮前的 mousemove 使列宽多变一次，均修正 fixture，保留失败日志，不用 force 绕过真实遮挡。
- 测试实际发现 React Portal 筛选弹层点击沿组件树触发表头 onClick（默认筛选确认后 headerClicks=2，Vue 原生 Teleport 无此路径），Th 筛选内容现在阻止点击冒泡；默认和自定义筛选内容共用隔离容器。修复后真实过滤、排序/键盘、表头点击隔离通过。
- 新增 TableColumn 声明与 getChildColumns（复用 getRenderItems 的 Fragment 展开），支持嵌套/条件列顺序与属性变化；新增 use-data 复用 Core process/filter/sort/page/raw/key 管线与 lazyLoad Map。table-data.cy.ts 4/4（react-table-data-browser.log）通过：嵌套/禁用 keys、过滤/排序/分页、懒加载/空 children 策略、callback rowKey、原始数据保留、动态 Fragment 列声明。保留 Vue filtered count<=pageSize 时不切片的既有规则。
- 本轮新增 15 个定向 Chrome 用例通过；源码/浏览器类型（react-table-data-types.log、react-table-view-types.log）、定向 lint、React build（react-table-view-build.log）与新单元格 SSR 2/2（react-table-view-ssr.log）通过。未重复全包/E2E/跨浏览器。
- 当前仍是 Table 内部模块，主视图组合、Table/7 公开入口、受控交互整合、虚拟滚动、拖拽、完整插槽/API 和文档均未完成；结构清单仍保留 Table 缺口，不能把本轮 15 用例视为 Table 完成。全部 100 组件目标保持，不提交、不推送。

### 2026-11-08 Table React 主视图、虚拟/拖动、公开入口与文档

- 新增 table.tsx 主组合，直接接 Core TableChange、布局/操作列、span/summary 数据和已有 React 适配器。query/pagination 返回 getter，确保同一事件内 onChange 读取本次新排序/过滤/分页数据，且受控列不提前提交。接入行/单元格原生事件、跨页及 onlyCurrent 选择、层级/自定义展开、异步行、分组列、摘要/跨度、分页回调组合与 ref；ConfigProvider.table/tableSpinProps 支持当前 Vue 默认项且显式 props 优先。
- 接入共享 Scrollbar、分离表头、sticky 数字偏移、表头/正文/摘要横向同步、固定列边界与滚动位置类名；Root ResizeObserver 随生命周期释放。实际 VirtualList/virtua 动态渲染 200 行，ref scrollIntoView 支持 index/key，保留结构性 list/item/tag/class 强制绑定；空数据/表头移除恢复测试通过。横向滚动筛选至空时应按处理后的 model.rows 决定 split，已修正原先只看 data.length 的组装遗漏并覆盖。
- 新增 use-drag，复用同一 Core createDragSort + createTableDragFoundation，保留 DOM 归 React、同级路径限制、当前页索引转全量路径、提交时临时 reorderRows、raw 与 sorted 回调及受控父级回写。取消、禁用和卸载重置 driver/Foundation。table-drag 最终 8/8（react-table-native-drag-browser.log），包括 CDP Input.dispatchMouseEvent 的真实浏览器首次 mouseReleased 即提交，无需额外点击；其余测试复用 Vue 手势 helper。卸载测试最初少发送模拟手势的 pointerup/mouseup/click，首次重挂按钮点击被 Sortable 消费，补齐与 Tree 测试一致的浏览器尾事件，组件清理逻辑保持。
- 新增 table 子路径、根入口、默认/命名及 Table.Thead/Tbody/Tr/Th/Td/Column 复合入口，共享 table.scss 纳入样式汇总，行组/Td 支持 DOM ref。公开类型包含列、数据、配置、事件、视图、摘要和实例；移除本次自己引入但无消费者的 column.slots.default 类型（Vue 默认插槽用于嵌套列，cell 才是单元格）。README 与正式 TableDemo/MDX 五个示例同步。
- 包级全部 280/280（react-table-package-suite.log）通过；末次主源码 React build（react-table-final-build.log）与入口/单元格 SSR 5/5（react-table-final-ssr.log）通过。全源/浏览器类型（react-table-root-final-types.log）、示例类型（react-table-docs-types.log）、定向 lint/diff check 通过。全包 280 记录在最后 hover/ref/split 修正之前，后续用定向 SSR/类型/浏览器覆盖，没有冒充重新全包运行。
- 补齐 Vue 的 30ms 单元格 enter/leave debounce 与卸载 cancel。对照发现 Root ref reset/clear 的 hook 回调必须接 tableChange.filter/sort，原先只 emit props 会漏掉统一 change 与 clearSorters 实际状态清除；已修正并覆盖实际 UI + ref 的同一查询管线。主视图最终 11/11（react-table-root-browser-acceptance.log）；新增空筛选项后旧测试选择器匹配两项，改为按 B only 文案定位，保留中间失败日志。
- 文档 build:site 207 页（react-table-docs-build-final.log），最初 MDX 裸花括号被当作表达式，已改 inline code。文档 4/4（react-table-docs-browser-final.log）：受控选择/排序/筛选、树形叶子联动、200 行虚拟拖动和父级回写、摘要/声明式分组及框架页切换。首次虚拟拖动测试未把示例滚到视口，截图确认仍在页面顶部，补 scrollIntoView 后通过。该生产文档构建在最后 ref/split 修正之前；最新源行为由后续开发构建定向测试证明，最终生产组合仍待后续验收。
- **最后统一重跑 Table 的 12 个正式浏览器 spec，共 56/56 Chrome，全无跳过/待定（react-table-all-browser.log，NativeExit=0）**，包含此前所有状态/单元格/操作/resize/data、主视图、virtual、drag 与 docs。未做全库 E2E 或跨浏览器；不得用 56 项 Table 通过外推全部组件。图谱更新。
- 100 组清单当前 10 组仍有结构缺口（react-component-inventory.log），Table 的入口/源码/样式/文档均存在，但 behaviorVerified 仍 false。Table 完整 scoped 根节点插槽/手工内容、全部滚动/虚拟/受控事件组合与边界仍需逐项对照；全部 100 组件 1:1 目标未完成，未提交或推送。

### 2026-11-08 Table 渲染根节点、JsonForm 与 Toolbar React 公开交付

- 范围仍为全部 100 个 Vue 公共组件组，包括已有 React 组件的完整行为/API/样式对照；未以本轮几组组件代替全库目标。
- Table 补齐 renderThead/renderTbody/renderTr/renderTh/renderTd 的作用域根节点、属性/样式/事件/ref 合并、React 19 ref cleanup、手工 renderContent 与 compound children 分支。专属渲染用例 6/6（react-table-render-browser-final.log）；最终全部 13 个 Table spec 63/63 Chrome（react-table-render-all-browser.log），包含生产文档 5 项。手工模式不生成数据行、分页或 Spin，正常模式切换回原查询管线。仍未穷尽全部虚拟/滚动/受控组合及其他浏览器。
- JsonForm 完成公开根/子路径/类型/样式/ConfigProvider 入口，复用 25 个真实控件、Core default/A2UI 适配与字段 Foundation；支持 value/modelValue/model、命令式 Form 代理、嵌套模型身份、隐藏/row/命名插槽、React/Vue 风格事件组合和 scoped 渲染属性。使用 JsonFormModelBridge 保持 Vue 命令式原地写模型语义，复用现有受保护的路径写入。公开具体 schema 与自定义组件类型用例经过 TNB 检查，避免宽泛运行时 schema 强制 DOM 事件签名与已知控件回调冲突。
- 修复 Core resolveJsonFormComponent 将 constructor/**proto**/toString 等继承属性误作组件的问题；before 日志 react-json-resolver-before.log 记录真实失败，Core JsonForm 6/6（react-json-resolver-core.log）、Vue JsonForm 31/31 Chrome（react-json-vue-regression.log）通过。React 插槽元数据也限定 own 属性，保留失败日志 react-json-slot-prototype-before.log 和包内断言。
- JsonForm 最终 5 个浏览器 spec 32/32 Chrome（react-json-final-browser.log），含生产文档 2 项。Rate 的半星/整星双层和 Select 测量副本使初版测试过度计算渲染节点；核对两端模板后按右层/首个副本断言，未修改组件以迁就数量。尚未逐个穷尽 25 控件全部插槽和事件组合，不能视为全库或完整 JsonForm 验收。
- Toolbar 公开入口/样式/类型/ConfigProvider.toolbarSpinProps/文档均已交付，直接复用 Core Foundation 和 JsonForm；支持查询/ref/Enter、深拷贝初始快照的重复重置、skip keys、受控/非受控、真实 ResizeObserver/scrollHeight 展开、语言切换、React 动作/命名字段插槽及多态 Button 事件组合。真实浏览器 8/8（react-toolbar-browser.log），生产文档 1/1（react-toolbar-docs-browser.log）。完整跨浏览器和所有空插槽/动态配置组合仍需继续核对。
- 最新全包测试 289/289（react-json-toolbar-package-final.log），React 源与浏览器类型（react-json-toolbar-final-types.log）、React docs 类型（react-json-toolbar-docs-types.log）、定向 lint（react-json-toolbar-lint.log）通过。最新生产文档 build:site 209 页（react-toolbar-docs-build.log）；前一次 JsonForm 构建为 208 页，最初 MDX 泛型文本未加代码标记的构建失败已修正。
- 100 组结构清单刷新后仍有 8 组缺口（react-component-inventory.log）：BasicCrudTable、MarkdownRender、ModelSelector、RichTextEditor、Sender，以及 Clamp/ConfigProvider/ThemeProvider 的样式项（是否确需独立样式继续核对）。所有 behaviorVerified 继续保持 false。BasicCrudTable 已完成首轮 Vue/Core 流程阅读，尚未写 React 实现。全库 E2E/跨浏览器未重跑，历史 ColorPicker 间歇失败及 Calendar renderer 崩溃边界仍保留。goal 保持 active，未提交或推送。

### 2026-11-08 BasicCrudTable React 公开实现及独立主题样式

- 继续全部 100 组 1:1 目标；上一 goal turn 属于有实质实现和验证的 progress，本轮基于当前工作树重新确认后实现 BasicCrudTable，未缩小为缺失组件清单即可完成。
- 新增 BasicCrudTable 主视图、内部 BasicCrudModal、use-table/use-modal/use-model，分别直接复用 Core 请求/分页/排序/删除和弹窗 Foundation；保留 afterRender 屏障，复用现有 useAfterRender。整合真实 Toolbar/Table/JsonForm/Modal/Popconfirm，包含根/子路径/公共类型/独立与聚合样式/ConfigProvider.basicCrudTableSpinProps/生产文档示例。支持非受控初值及 loading/toolbarModel/tableData/modalModel/modalVisible 更新、ref 方法与实时读取、三种重置、异步详情/提交前钩子失效、接口错误、确认删除、按命名空间转发插槽。
- 内部弹窗 7/7 Chrome（react-crud-modal-browser-final.log）；主视图初版 7/7（react-crud-table-browser-final.log）。补齐 toolbarProps.onSearch/onReset 组合回调和 modalFormProps.slots 保留后，两个正式源 spec 14/14（react-crud-browser-acceptance.log）通过。生产文档 2/2（react-crud-docs-browser.log），示例使用内存异步回调模拟接口，并非真实后端验收。
- 后续增加 Vue 同款 fullHeight 400px/20 行实际滚动用例，最终主视图 8/8（react-crud-full-height-browser-final.log）。中间首次因固定的 watch:null Vite 服务未刷新 fixture 而失败，重启后高度与 scrollHeight/clientHeight 均通过；仍失败的是 display:contents 行的 Cypress 可见性断言，改为检查真实单元格后通过。未为迁就断言修改组件布局。表格全量边界/所有受控组合/全部 namespace 根节点插槽仍需继续核对，不能把 8 项外推为组件完全验收。
- 核实并补齐三个独立样式入口：ConfigProvider/ThemeProvider 直接复用 Core 主题根节点 min-width 和 fixed/zero-height/pointer-events:none 浮层容器规则，并加入聚合入口；Clamp 与 Vue 一样转发当前为空的共享样式契约。样式打包 3/3（react-provider-style-test.log），ThemeProvider 增加实际 CSS 断言后 7/7 Chrome（react-provider-style-browser.log）。同步更正文档此前没有独立样式文件的描述及 Demo 导入。
- 最新完整 React 包测试 294/294（react-crud-provider-package-final.log），Core BasicCrudTable 21/21（react-crud-core-regression.log），最终公开 SSR 2/2（react-crud-public-ssr-final.log）；React 源/浏览器类型（react-crud-provider-types-final.log）、React docs 类型（react-crud-docs-types-final.log）、定向 lint（react-crud-provider-lint-final.log）通过。生产文档最新构建 210 页（react-crud-provider-docs-build.log），BasicCrudTable 2 项 + ThemeProvider 3 项共 5/5 生产交互（react-crud-provider-docs-browser.log）。
- 结构清单现在 100 组中仍有 4 组入口/源/样式/文档缺口（react-component-inventory.log）：MarkdownRender、ModelSelector、RichTextEditor、Sender。所有 behaviorVerified 保持 false。ModelSelector 已重新 graphify 查询并阅读根组件与 Core provider 类型，尚未写 React 实现。已有组件 API/行为/样式的全面核对、全库 E2E/跨浏览器和历史 ColorPicker/Calendar 不稳定项仍未完成。goal 保持 active，未提交或推送。

### 2026-11-08 ModelSelector React 公开实现与共享键盘/ARIA 回归

- 上一 goal turn 为 progress（BasicCrudTable 与三处样式入口的实现及验证）；本轮继续全部 100 组目标，实现 ModelSelector 根组件与 13 个复合子组件，包含同名静态别名、根/子路径入口、公共类型、独立/聚合样式、文档与两组可交互示例。所有 behaviorVerified 继续 false，结构存在不代表全 API 验收。
- 根、输入、分组和选项直接复用 Core Foundation。保留显式 visible=undefined 的受控关闭、动态添加 visible、无回写受控冻结、defaultExpanded 初始值、搜索期间独立折叠、键盘按实时 DOM 顺序导航、禁用值变化、原生 item/root 事件顺序、MutationObserver 文本更新、IME、受控输入、关闭时重置/跨卸载保留查询、焦点恢复、作用域 children、全局快捷键及清理。按 VueUse 当前实现补齐 key/current 与 Meta/Shift/Alt 依赖释放、blur/focus 清理，未引入 Vue 运行时依赖。
- Trigger 合并首个 React 元素的 class/style/事件并保留兄弟内容和原始 ref，纯文本回退到 Button；Content 原生属性落在 Modal 容器，固定组件 class 留在 modalClass。List 使用真实 Scrollbar，分组保留 inert/CSS 过渡。
- 52 份 Vue 原始 SVG 通过 scripts/generate-react-model-selector-logos.ts 生成随 React dist 发布的 data URI；--check 语义比对源图标，包内测试逐字节验证，浏览器实际解码全部 52 份及 unknown/constructor 回退，共 54 张图片通过。生成字典未增加 CDN 或运行时文件路径依赖。
- 发现并修复共享快捷键入口处理 IME 和已消费的 Enter：Core handleShortcut 增加 isComposing/defaultPrevented 保护，避免输入法误选及 closeOnSelect=false 时重复选择。react-model-selector-ime-before.log 保留修复前真实失败；Core 20/20（react-model-selector-core-regression-final.log）、Vue index/robustness/reorder 36/36 Chrome（react-model-selector-vue-final.log）通过。Vue 新例同时验证组合 Enter 不选中、随后正常 Enter 仅选中当前活动项一次。
- 无标题组引用不存在的 headingId，SSR before 日志 react-model-selector-heading-before.log 已复现；Vue/React 都仅在存在标题时输出 aria-labelledby，补两端回归。全部修改维持共享行为一致。
- 最终 React 三个源码 spec 21/21 Chrome（react-model-selector-final-source-browser.log，NativeExit=0），含 11 主流程 + 9 生命周期/键盘边界 + 1 全量 Logo。最初空状态测试写错语言包文案、Logo 测试把 raw Element 当作 JQuery、文件名排序与去后缀键排序不同，均已按真实契约修正断言，未删测或跳过。输入法测试使用真实 KeyboardEvent，并明确窗口级快捷键不会消除已经发生的 React 父级冒泡记录。
- 最新全包 301/301（react-model-selector-package-final.log），包含公开/compound/SSR/图片字节/按键追踪测试和独立样式依赖检查；React 源/浏览器类型（react-model-selector-types-acceptance.log）、React docs 类型（react-model-selector-docs-types-final.log）、定向 lint（react-model-selector-lint-final.log）、图标 --check、diff check 通过。生产文档最新 211 页（react-model-selector-docs-build-acceptance.log），公开 compound 与独立 Dialog、筛选选中后触发文案、SVG 和行内布局生产交互 3/3（react-model-selector-docs-browser.log）。
- 当前 100 组结构清单仅余 MarkdownRender、RichTextEditor、Sender 三组缺口（react-component-inventory.log）；仍需继续已有组件完整 API/样式/行为核对、全库 E2E、跨浏览器，以及历史 ColorPicker 间歇失败/Calendar renderer 崩溃边界，不能以本轮定向测试外推全部组件。未提交或推送，goal 保持 active。
- 下一组 MarkdownRender 已 graphify 查询并阅读当前 Vue wrapper、节点映射与类型：Vue 锁定 markstream-vue 2.0.18，并公开六个虚拟状态/测量/滚动方法及相关事件。已查官方 React README 与 npm 元数据，确认存在同族 markstream-react@2.0.18；只读 npm pack 工件保存在 .local/markstream-react-2.0.18/package，未安装依赖或改锁文件。其发布声明当前未看到 Vue 六方法/虚拟状态回调，不能直接替换为薄包装并宣称 1:1；下一轮需核实并补齐差异。证据 react-markdown-upstream-metadata.log、react-markdown-upstream-pinned.log、react-markdown-package-inspection.log；官方说明 https://github.com/Simon-He95/markstream-vue/blob/main/packages/markstream-react/README.md。另注意发布 d.ts 的相对路径无扩展名，需在仓库 NodeNext/TNB 真实消费者里验证类型解析，不能凭 skipLibCheck 的绿灯判定类型完整。

### 2026-11-08 MarkdownRender 依赖与内部节点适配

- 目标继续覆盖全部 100 组公共组件，包含已有组件的 API、行为与样式核对。当前新增的 Markdown 节点均为内部实现，未公开 MarkdownRender 根组件，所有 behaviorVerified 保持 false。
- 安装精确 markstream-react@2.0.18。真实 NodeNext/TNB 消费者发现发布声明的无扩展名相对路径让 numeric content 错误静默通过；Bundler 对照拒绝该值。pnpm patch 仅修正 57 份 d.ts 的相对路径，不修改运行时；新增类型探针并纳入 React typecheck。修复前后证据 react-markdown-upstream-types-before.log、react-markdown-upstream-types-bundler.log、react-markdown-upstream-types-after.log。冻结锁文件安装通过（react-markdown-lock-verification.log），补丁维护说明位于 patches/README.md。
- Core 新增共享链接安全属性与加载动画参数，Vue Link 改用该逻辑；原 SD Markdown SCSS 提取到 Core，Vue 保留 upstream.css 入口，React 单独引用共享样式。React 内部标题、引用、链接、行内代码、任务勾选、提示块及图片均使用真实 SD 组件。保留子节点上下文与调用方 renderer，未注册 paragraph。
- 图片复用 Core MarkdownImage Foundation，包含安全地址、单次回退、终态错误、源切换重置、caption、placeholder/error render props、lazy/eager、真实 Image 预览及原生点击载荷。React commit 后报告高度并结算 pending，清理时释放等待；StrictMode 浏览器验证实际加载解码、回退、双失败、危险源、流式占位与预览。
- 最终 markdown-nodes Chrome 10/10（react-markdown-image-browser-final.log，NativeExit=0）、Core Markdown 32/32（react-markdown-core-regression.log）、React 全包 302/302（react-markdown-package-regression.log）通过。前两轮失败来自 Cypress 16 属性断言改变 subject 和 Checkbox aria-label 位于 label，已修正测试而未删除覆盖；保留失败日志。
- 随后补齐不安全图片地址的 SSR 初始错误插槽，避免仅在浏览器 effect 后显示错误。新增两项服务端安全地址/回退/占位状态测试；最新全包 304/304（react-markdown-package-acceptance.log）、Chrome 10/10（react-markdown-image-browser-acceptance.log，NativeExit=0）、React 三段类型和定向 lint（react-markdown-image-final-types.log、react-markdown-image-final-lint.log）通过。
- React 三段类型检查（react-markdown-types-acceptance.log）、Vue 源类型（react-markdown-vue-types.log）、定向 oxlint（react-markdown-lint.log）及直接启动 stylelint（react-markdown-stylelint-direct.log）通过。pnpm exec stylelint 未解析命令，使用现有 node_modules/stylelint/bin/stylelint.mjs 验证，未安装替代工具。
- Vue Markdown styles/nodes/compatibility 28/28（react-markdown-vue-direct.log，NativeExit=0）通过。此前 shim 启动虽全绿但 NativeExit=3，保留 react-markdown-vue-regression.log，不作为通过证据。Vue 日志仍有组件实例枚举警告，其来源尚未定位，不能声称运行零警告。
- 尚未实现 MarkdownRender 根组件、六个虚拟状态/测量/滚动方法及事件、流式协调、局部自定义映射、HTML 节点与 trusted style 规范化、上游公开兼容入口、生产文档和全量节点验收。RichTextEditor、Sender、全部已有组件核对、全库 E2E/跨浏览器及历史 ColorPicker/Calendar 不稳定项继续未完成。未提交或推送，goal 保持 active。

### 2026-11-08 Markdown HTML、样式与原生事件边界

- 上轮为实际实现与验证进展；本轮继续全部 100 组目标，补齐内部 HTML 节点和默认节点映射。HTML 复用 Core 清洗、分词、树和宿主分类：普通标题、段落、按钮、链接、图片使用 SD 组件，自定义/非结构标签及未完成 HTML 继续交给原节点，safe/trusted/escape 保持各自策略。未公开 MarkdownRender 根组件，不将默认映射存在视为局部上下文和动态注册表已经交付。
- trusted 字符串样式使用 css-tree@3.2.1 的 parser 子路径（不加载完整 lexer/语法数据）转为 React style，保留带引号的分号、大小写敏感自定义属性、vendor 属性、重复声明及 !important 优先级；非法声明后继续保留有效 CSS。仅声明 css-tree 未提供类型的 parser 子路径，引用其公开 parse 类型；浏览器检查显式包含该声明，发布的组件声明不依赖内部 ambient 文件。精确 @types/css-tree@3.2.0 仅用于开发类型检查。冻结锁安装通过（react-markdown-html-lock.log）。
- React style 直接赋值无法应用 !important，节点 ref 在 DOM commit 后设置声明优先级，同时保留 SSR style 序列化；后续普通优先级更新正确清除旧 important。Heading AST 的 style/class 也复用规范化。HTML 的 class/for/布尔和常用属性名适配 React，保留 false 布尔和 hidden=until-found，过滤事件字符串及 React 保留属性。
- 真实发现并修复原生 button type 被当作 SD 外观类型：按 Vue 将 type/disabled 从普通属性中拆出，绑定 htmlType 与显式 disabled 规则。首次 SSR 两项失败中，另一项是测试把包含 script 的回退路径当作 SD 适配路径，已拆分安全清洗与普通映射断言；后续属性顺序测试改为不依赖 SSR 属性顺序。
- HTML input 保持原生可编辑，源码 value/checked 变化才同步；无关 HTML 更新保留用户输入与勾选。修复前 react-markdown-html-browser-before.log 复现 React 受控输入将 Edited 还原为 First。修复后覆盖 label 聚焦、文本/checkbox 编辑、无关样式更新与真正源码值更新，file input 不写入禁止的非空 value。
- HTML 图片预览关闭额外触发 Markdown click 的失败保留在 react-markdown-html-browser-css-specs.log（3 次而非 2 次）；节点事件桥现在只转发 DOM 后代事件，排除 Portal 通过 React 组件树冒泡的预览事件，保留 native MouseEvent 及恰好一次转发。
- 默认节点映射涵盖 Vue 当前全部 SD 节点及 checkbox_input 别名，Divider 使用薄节点适配避免 node/ctx 属性泄露 DOM；paragraph 保留上游轻量路径。7 项 Markdown SSR/属性/局部映射测试已纳入包套件，验证嵌套真实 Link、Divider/任务勾选、调用方覆盖及不写全局注册表。空注册表 getter 每次可返回新对象，测试比较内容而非对象身份。
- 最终 React 全包 309/309（react-markdown-html-package-acceptance.log）、三段类型（react-markdown-html-types-clean.log）、定向无警告 lint（react-markdown-html-lint-clean.log）、样式 lint（react-markdown-html-stylelint-final.log）通过。HTML 5 + 既有节点 10 共 15/15 源码 Chrome（react-markdown-html-browser-final.log，NativeExit=0）通过。
- 两个专用测试页面真实 Vite 生产构建成功（react-markdown-production-build.log），独立 5193 静态服务上相同 15/15 Chrome 通过（react-markdown-production-browser.log，NativeExit=0）。这是内部节点测试页面的生产交互，未替代文档站构建或 Markdown 根组件验证；构建仍有上游大块体积提示，未做体积优化或宣称发布性能验收。
- 下一步继续 Markdown 根组件、六方法与虚拟事件/状态、流式/批处理协调、作用域自定义映射与动态注册、上游兼容入口、文档及全节点验收。RichTextEditor、Sender、已有全部组件核对、全库 E2E/跨浏览器和历史不稳定项不变，goal 保持 active，未提交或推送。

### 2026-11-08 Markdown 虚拟快照规则与动态局部注册

- 上轮为 HTML 节点实现及生产验证进展；本轮继续全部 100 组目标，实现 Core 虚拟状态公共数据/六方法契约，以及真实快照恢复所需的签名、内容哈希、32px 宽度桶、会话/线程/测量键兼容筛选、非法高度过滤和限量缓存选取。六方法目前仅有共享契约，尚未接入 React 根渲染器，未宣称虚拟化或状态恢复已经可用。
- 签名/恢复规则按实际安装的 markstream-vue@2.0.18 发布运行时提取，包含循环/深度边界、超过 160 子节点时的全数组哈希、结构字段和运行时引用排除。补齐 Core THIRD_PARTY_NOTICES.md 中原始 MIT 许可。真实 pnpm pack 后 tar 内容验证模块 JS/d.ts 与许可均入包（react-markdown-core-pack.log、react-markdown-core-pack-contents.log）。
- Core 新增 5 项规则测试，覆盖大数组中部修改、属性顺序、循环、运行时字段、兼容键/宽度、局部内容变化、非法高度、无元数据缓存拒绝及附近优先/均匀采样。最新 Markdown Core 37/37（react-markdown-state-core-regression.log）通过。
- Vue 新增 virtual-state-foundation.cy.ts，真实挂载/settle/capture 三个实测节点（含 180 个子节点），逐项验证 Core 签名与整个内容哈希和 Vue 导出一致；修改一个节点后仅其余两项缓存兼容，改变宽度拒绝恢复。最终 1/1 Chrome（react-markdown-virtual-state-vue-fixed.log，NativeExit=0）。首次选择器命中高度估算探针而失败，保留 react-markdown-virtual-state-vue.log，后改为实际 node-slot 内的 SD 标题，未跳过真实节点验证。
- 新增 React 内部 MarkdownComponentsContext/useMarkdownComponents，按 defaults → parent → 上游 global/scoped 的顺序合并。useSyncExternalStore 订阅真实上游注册表，原始 setCustomComponents/removeCustomComponents/clearGlobalCustomComponents 即时生效；不安装全局 SD 默认映射、不创建临时 customId。StrictMode 卸载/重挂载与 SSR 上下文也覆盖。
- 上游已有 subscribeCustomComponents/getCustomComponentsRevision 实现与类型，但根入口未导出。现有 pnpm patch 增加私有 markstream-react/sd-internals 子入口，仅重导出这两个现存函数；保持原运行时实现及根入口不变。patches/README.md 记录精确块绑定升级复核要求，类型探针覆盖回调参数。TNB 对 Context 推断提示内部类型路径不可移植，已通过显式公共 Context/CustomComponentMap 类型解决，未使用抑制或更换编译器。
- 新增 2 项注册表包测试与 2 项实际浏览器用例，验证原始单例通知/取消订阅、SSR 无全局污染、父映射、作用域隔离、全局优先级、动态移除及卸载后读到最新映射。最新 React 全包 311/311（react-markdown-registry-package.log）、源/浏览器/上游类型探针（react-markdown-registry-types-final.log）、Vue 源类型（react-markdown-state-vue-types.log）、定向 lint（react-markdown-state-registry-lint.log）、冻结锁安装（react-markdown-registry-lock-final.log）通过。
- registry 2 + HTML 5 + nodes 10 共 17/17 源码 Chrome（react-markdown-registry-all-browser.log，NativeExit=0）通过；三个测试页面真实生产构建（react-markdown-registry-production-build.log）后，相同 17/17 Chrome（react-markdown-registry-production-browser.log，NativeExit=0）通过。独立生产预览 5193 已停止，原用户服务未停止。这仍是内部节点/注册上下文的生产验证，不是完整根组件或文档站验收。
- 清理本轮误建的空 packages/web-core/.local/markdown-core-pack 目录时，自动审批拦截命令，仅给出 blocked by policy；未绕过执行，空目录保留。实际包产物位于根 .local/markdown-core-pack，不影响测试或发布输入。
- MarkdownRender 根组件及六方法的运行时、虚拟测量/滚动/锚点/事件、流式/批处理协调、递归上下文接入、兼容入口与文档仍未交付；RichTextEditor、Sender、已有全部组件验收和全库/跨浏览器边界继续未完成。所有 behaviorVerified 保持 false，goal active，未提交或推送。

### 2026-11-08 Markdown 私有根视图与六方法运行时

- 上轮为快照规则/动态注册的实现与验证进展；本轮继续全部 100 组目标，新建 Core virtual-controller 浏览器驱动和 React 私有 renderer.tsx。它们接入真实 DOM，不以空方法满足类型。仍未创建公共根入口/子路径或文档，不将此阶段视为 MarkdownRender 全量交付，所有 behaviorVerified 保持 false。
- 控制器使用 ResizeObserver、实际 node-slot offsetHeight、滚动根几何及字体加载事件更新测量；维护估计/实测高度、前缀位置、可见范围和上下留白。六方法已接线到 React ref：getVirtualMetrics、captureVirtualState、restoreVirtualState、forceMeasure、settle、scrollToNode。区分输入 final、异步节点 pending、实测就绪与稳定状态；支持手动 settle、超时、commit/帧等待、卸载释放等待任务与重挂载。
- 支持显式/祖先/viewport 滚动根、column-reverse 负 scrollTop 归一化、start/center/end/nearest 定位、节点/底部锚点、带 token 的显式锚点恢复以及缓存恢复不默认滚动。真实节点高度变化后修正定位，用户滚动意图解除跟随；禁止浏览器原生 overflow-anchor 与控制器同时校正。恢复缓存继续使用上轮的身份/签名/宽度规则。图片子节点报告按所属完整 slot 测量，避免用图片局部高度覆盖整段高度。
- 私有根视图复用 Core parser 导出与模式默认值，接现有 SD 节点、局部注册上下文、主题模式、基础 smooth stream 和批量计数。docs/chat/minimal 的默认参数与测量键已提取到 Core；Vue 真实快照测试增加 measurementKey 对照并通过。共享许可说明补齐 render-options 来源。React 样式以显式 layer 引入 markstream-react 原样式，coordinated/virtual slot 使用 flow-root，保留共享 SD 样式。
- 首轮 6 项中 3 项失败保留在 react-markdown-root-browser-before.log：测试将容器外宽 600 当作扣除原生滚动条后的内容宽；虚拟定位受原生滚动锚定重复校正；图片用例需要固定网络完成顺序。定位修复后 5/6（react-markdown-root-browser-fixed.log）；最后发现异步按钮未返回时读到旧输出，fixture 在开始调用时清空输出并等待新结果，图片请求由测试显式释放，实际验证 pending 状态后再解码。6/6（react-markdown-root-browser-async.log）通过，未缩短等待或跳过断言。
- 根 Markdown 运行发现 Checkbox 图标 div 进入原生 p 导致 React HTML 嵌套警告。已核对引用及共享 SCSS后，两端图标均改为 span，保留类和 flex 内实际尺寸；补 Vue 段落内尺寸/标签测试、React SSR 与根浏览器断言。Vue checkbox index/indeterminate/disabled-style 加虚拟快照对照共 25/25（react-markdown-root-vue-regression.log，NativeExit=0）通过，Vue 源类型（react-markdown-root-vue-types.log）通过。
- 根用例扩为 8 项：真实解析/无嵌套渲染器、80 节点全测量及高度变更、滚动/捕获/仅缓存恢复/锚点恢复、手动稳定及跨会话拒绝、200 节点受限 live DOM 与初始未挂载节点定位、真实未完成图片、反向滚动、三次真实卸载重挂载。和 registry/HTML/nodes 及 components-04 的 40 项既有交互合跑 65/65（react-markdown-root-source-acceptance.log，NativeExit=0）。覆盖 Slider/Rate/Checkbox/Radio/Form/Watermark/TagGroup/Progress 等本 spec 原有行为，不等于全库回归。
- 随后补控制器边界防护：忽略负数、越界、非整数/NaN、外国前缀和空索引（md--1 不能转换成 0），保留带子节点后缀的合法 key；修复前测试失败保留 react-markdown-root-core-safety.log，最终 Core Markdown 40/40（react-markdown-root-core-safety-fixed.log）通过。虚拟状态事件的 metrics 现在保留与 height-change 相同的原因，新增行高度变化后的实际事件对照。
- 最终八项根源码 8/8（react-markdown-root-final-browser.log，NativeExit=0），源/浏览器/探针三段类型（react-markdown-root-final-types.log）、定向 lint（react-markdown-root-final-lint.log）、样式 lint（react-markdown-root-stylelint-final.log）通过。全包 315/315（react-markdown-root-package-final.log）含新增 3 项根 SSR 和 Checkbox 段落 SSR；该全包记录在最后索引/事件防护之前，之后以 Core 40 与根实际交互定向验证，没有重复全包。
- 四个测试页面真实生产构建（react-markdown-root-final-production-build.log）后 root 8 + registry 2 + HTML 5 + nodes 10 共 25/25 Chrome（react-markdown-root-production-browser.log，NativeExit=0）通过，包含最后的事件原因对照与防护代码；构建仍有上游大 chunk 提示，未做体积优化。独立 5193 预览已停止，用户 5187/5188 服务未动。
- 尚需继续对齐：根 DOM 原生属性透传、referenceId/fragment 节点事件、domMode、deferNodesUntilVisible/viewportPriority、parseCoalesceMs、批处理预算/idle/重置、光标与精细 typewriter、standalone heightCache props/restore 排队、emitInterval、上游异步图表 pending 生命周期、长文档估高/性能及 Vue 全行为矩阵；现有基础流式/批处理尚无完整验收。根六方法的定向通过不能替代这些未实现或未验证面。
- Markdown 公共兼容入口、文档、RichTextEditor、Sender、已有全部组件 API/样式/行为验收、全库 E2E/跨浏览器及历史不稳定项继续未完成；goal active，未提交或推送。

### 2026-11-08 Markdown 根属性、原生事件与 Fragment 边界

- 上轮为私有根六方法的实现和实际交互进展；本轮继续全部 100 组目标，补根宿主属性透传、referenceId 及无宿主 Fragment 事件。MarkdownRenderer 仍为内部组件，未加入根/子路径导出，不以这些用例替代全 API 验收，所有 behaviorVerified 保持 false。
- 新增 dom-attrs.ts，以上游 NodeRendererProps 和 SD 自有属性的类型键约束过滤表；编译时会检查新渲染器属性是否漏列。其余 HTML/aria/data 属性与 React 原生事件继续落在实际根 div；解析、协调和业务回调不落成 DOM 字符串。动态 title/data 属性、tabIndex、键盘回调及 SSR 覆盖已验证。
- 普通根和 Fragment 统一使用原生监听器，回调得到实际 currentTarget 和原事件对象；普通模式 mouseover/out 只转发实际 node-slot 内事件，Fragment ref 直接绑定首层宿主，无额外 wrapper。通过最新回调 ref 保持属性更新，清理/重新监听覆盖 StrictMode、真实卸载重挂载和四次普通/fragment 切换。Portal 预览关闭不成为正文点击；preventDefault 和显式 React capture 取消已有用例。手工派发的 Event 不因不是 MouseEvent 实例而被吞掉。
- 已安装 React/ReactDOM 19.3 与对应类型提供 Fragment ref/addEventListener。将 web-react peer 与类型包下限由 ^19.0.0 同步为 ^19.3.0，并在 README.md、QUICK-START.md、ARCHITECTURE.md 标明；没有为较早 React 19 声称支持，也未添加隐藏 wrapper 降级。冻结锁安装通过（react-markdown-events-frozen-lock.log），TNB 配置未改。
- markstream-react 2.0.18 的 reference 节点缺少 Vue 已有的 data-reference-id/data-markstream-reference-id。pnpm patch 补齐两项 DOM 属性；Enter/Space 由直接把 KeyboardEvent 传进鼠标回调，改为 preventDefault 后触发原生 click，保留根委托和原生 MouseEvent，避免 Space 滚动。patches/README.md 已更新，不再声称全部上游运行时实现完全不变；根导出和原注册表实现仍未改变。SSR 验证安装后的 ReferenceNode 标记，浏览器覆盖两模式的引用 ID、Enter、Space 恰好一次。
- 首轮 19 项为 15/19（react-markdown-events-browser-before.log）：两项真实复现键盘不触发根点击；两项图片用例使用被现有安全规则拒绝的 SVG data URI，改用受控 HTTP 图片并真实解码，未放松 sanitizeImageSrc。修正后 19/19（react-markdown-events-browser-fixed.log）。随后增加手动 Event、模式切换和渲染范围边界，最终事件 spec 24 项。
- Vue 新增 fragment-contract.cy.ts，实际确认 renderAsFragment 会绕过虚拟窗口/延迟批次，60 个节点完整渲染；完成且非协调的内容也不等待 10 秒批次。2/2 Chrome（react-markdown-fragment-vue-final.log，NativeExit=0）。React fragment 旧实现只渲染 2/60 的 SSR 失败保留 react-markdown-fragment-range-before.log；现在显式禁用 fragment 的虚拟/分批路径，SSR 和浏览器均完整输出 60 个节点，且无 root/slot/spacer 宿主。
- 同步校正分批启用门槛：仅客户端、非 fragment/virtual、maxLiveNodes<=0、有效正 batchSize 时考虑分批，并排除已完成且未启用协调的全量路径及平滑连续流；初始批数允许 0，非有限值按锁定上游规则处理。此前“SSR 只输出初始 40 个 slot”的测试假设不是正确上游契约，已移除，改为明确的 nodes 优先级及 docs/chat 非延迟 SSR 60 节点断言。真实上游 SSR 对照位于 .local/markdown-vue-ssr-oracle.mts，输出 react-markdown-vue-ssr-oracle-fixed.log；首次对照未关闭 defer 导致占位，失败日志 react-markdown-vue-ssr-batch-oracle.log 保留，不能把占位误判为分批。
- 最终 React 包 319/319（react-markdown-events-package-final.log）、三段源/浏览器/探针类型（react-markdown-events-types-final.log）、定向 lint（react-markdown-events-lint-final.log）通过。Vue 源类型通过直接启动 vue-tsc（react-markdown-events-vue-types-direct.log）；pnpm exec 尝试失败日志保留，未替换工具或编译器。
- events 24 + root 8 + registry 2 + HTML 5 + nodes 10 共 49/49 源码 Chrome（react-markdown-events-source-final.log，NativeExit=0）通过。五个页面真实生产构建（react-markdown-events-production-final-build.log）后相同 49/49 Chrome（react-markdown-events-production-browser.log，NativeExit=0）通过，独立 5193 预览已停止。上游大 chunk 提示仍在，未据此宣称性能/发布验收。
- 下一步继续普通模式 defer/viewportPriority 的占位和激活、parseCoalesceMs、有效分批的完整 slot/占位/预算/idle/重置语义、精细 typewriter/光标、standalone 缓存与排队恢复、emitInterval、嵌套根属性/生命周期继承和异步图表 pending；新启用门槛不等于这些流程已完成。domMode、公共兼容导出/文档及完整节点矩阵仍未完成。
- RichTextEditor、Sender、已有全部组件完整 API/样式/行为验收、全库 E2E/跨浏览器与历史不稳定项继续未完成；goal active，未提交或推送。

### 2026-11-08 Markdown 普通模式占位与视口激活

- 范围仍是全部 100 组 Vue 公共组件；本轮是 Markdown 私有实现的一段交付，不代表全部组件或 Markdown 已完成。没有新增公共 Markdown 导出，没有提交或推送。
- 普通模式现在为全部节点保留 node-slot；延迟和未到批次的节点输出 node-placeholder，不再直接截断后续槽位。fragment 仍完整渲染且不添加槽位。Core 控制器接收内容是否已经渲染的判定，跳过占位测量，并阻止未渲染内容借用旧高度而被标成 stable。
- 新增 Core viewport.ts 浏览器调度与 React use-viewport.ts 适配：按最近滚动父元素共享 IntersectionObserver，默认 rootMargin 400px，可见后一次激活；空闲回调逐个补渲染，缺少 idle API 时使用真实 16ms 定时器。卸载和上下文变化清理观察与空闲任务；无 IntersectionObserver 或无效 rootMargin 时直接渲染。节点超过 900、viewportPriority=false、defer=false、fragment、虚拟窗口或 maxLiveNodes<=0 时绕过普通延迟；超过 maxTargets 时关闭本上下文的延迟。对应归属加入 Core THIRD_PARTY_NOTICES.md。
- viewportPriorityOptions 类型补齐 maxTargets/heavyBlockMargin；本轮仅接入普通节点 rootMargin/maxTargets，重型代码/图表的提供者及 heavyBlockMargin 仍待实现，不能据类型存在宣称行为完成。
- 真实锁定 Vue SSR 对照确认 60 槽位、1 内容、59 占位（.local/markdown-vue-viewport-oracle.mts，react-markdown-viewport-vue-ssr.log）。React 新增同义 SSR 断言。Vue 新增 viewport-contract.cy.ts，最近滚动父元素真实滚动激活及禁用路径 2/2 Chrome 通过（react-markdown-viewport-vue-browser.log）。
- 新增 React 11 项浏览器用例：真实 IO 滚动激活、占位不计为 measured、idle 补渲染、session 重置、卸载取消、禁用/cap/大节点列表/无效 margin、fragment、缺少 IO、真实定时器降级及批次保留槽位。手动空闲测试先等待挂载及任务入队，避免在模块尚未执行时空跑；首轮失败日志保留。settle 不会展开离屏节点，未测量完成保持 stable=false；核对上游后撤回曾加入的强制展开，测试显式等待异步输出。
- 原根控制器夹具要求完整缓存，现显式关闭延迟渲染；延迟行为由独立夹具覆盖。首次生产复测的 57/60 失败保留在 react-markdown-viewport-production-final.log，暴露夹具依赖即时全量内容及异步输出等待不足，不能把该次结果算通过。修正后六页生产构建（react-markdown-viewport-production-acceptance-build.log）与六组 Chrome 共 60/60（react-markdown-viewport-production-acceptance.log）通过。
- React 包 320/320（react-markdown-viewport-package-final.log）、Core Markdown 40/40（react-markdown-viewport-core-tests.log）、源/浏览器/上游探针三段类型（react-markdown-viewport-types-acceptance.log）、定向 lint（react-markdown-viewport-lint-acceptance.log）通过。graphify update 完成；仍提示旧图 104 节点缺 source_file，没有宣称图结构完整。
- 后续仍需精确占位高度估计、可见性兜底/移动根处理、完整批处理预算/idle/重置、parseCoalesceMs、typewriter/光标、standalone 缓存/恢复队列/emitInterval、嵌套继承和重型异步节点 pending、domMode、公共入口及文档。RichTextEditor、Sender、所有已有组件的完整 API/样式/行为验收、全库 E2E/跨浏览器及历史不稳定项保持未完成，goal active。
- 源码验收须保留退出状态区别：react-markdown-viewport-source-acceptance.log 汇总 60/60，但工具进程返回 1；随后显式记录 NativeExit 的 react-markdown-viewport-source-certified.log 为 59/60、NativeExit=1，根渲染第一例 cy.visit 的页面 load 事件等待 60 秒超时，其余 59 项通过。5191 仍监听且夹具 HTTP 200，并不能据此证明浏览器加载正常。生产 acceptance 60/60 正常退出不等于这个源码加载问题已经修复；没有增大 pageLoadTimeout、屏蔽错误或删除用例。
- 随后根渲染单独复核 8/8、NativeExit=0（react-markdown-viewport-root-recheck.log），未改实现、未增加等待上限。此结果仅确认单独运行可通过，源码整组间歇加载超时原因继续未解决。

### 2026-11-08 Markdown 流式解析合并与自适应批次

- 全量目标继续覆盖全部 100 组组件，本轮没有把范围缩成 Markdown，也没有标记任何组件整体验收完成。Markdown 仍是私有实现，未新增公共根/子路径导出；RichTextEditor、Sender、其余全部组件的完整 API/样式/行为验收继续待完成。
- Core 新增 parse-coalescer.ts，React use-parse-content.ts 接入真正的解析输入：仅平滑流中的普通长文本追加合并，默认 80ms；连续追加沿用从上次提交计算的截止时间，不是尾随 debounce。短文本、替换/缩短、结束、解析器配置变化、标题/列表/引用/围栏/表格分隔线及空段等结构边界立即解析。禁用平滑流和 0ms 不延迟。卸载取消未完成计时器，settle 的既有 flushPendingTimers 路径同步刷新可见流及解析输入。
- Core 新增 batch-scheduler.ts，React use-batch.ts 替换固定 setTimeout 步长。前台优先 idle，缺少 idle 时采用 RAF 再延时，后台直接计时器；提交后等待 React 实际提交，以 RAF/超时结束测量，根据耗时将批次缩至 80% 或恢复至 120%，最小批量为上限的四分之一。追加保留进度；会话/索引/相关配置重置初始批次，缩短列表限制数量；flush 与卸载取消排队、测量帧、超时和旧 generation 回调。普通延迟占位、fragment 和完成且非协调的全量路径继续独立保留。
- 新增 3 项 Core 解析测试和 4 项批处理测试，实际控制计时器/时钟/idle/RAF，覆盖固定截止时间、相同文本的配置重置、结构边界、最终提交、取消、批量增减、前后台降级、追加/缩短、配置和上下文变化、过期回调与提交后释放。Core Markdown 共 47/47（react-markdown-scheduling-core-certified.log）。新增 React stream spec 9 项，viewport spec 增至 12 项，包含真实流、真实解析器、实际 DOM 和真实 RAF/计时器路径。
- 锁定 Vue 对照 stream-coalescing.cy.ts 2/2（react-markdown-coalesce-vue-browser.log），batch-scheduling.cy.ts 1/1（react-markdown-scheduling-vue-final.log）正常退出。Vue 协调模式存在 9 个隐藏测量 node-content，测试改为只统计 node-slot 直属内容。进一步对照发现：相同节点内容的 session 切换后，Vue metrics.renderedCount 重置为 1，但 DOM 仍保留此前第二个已挂载节点；React 当前会收回该节点。Vue 对照明确保留“逻辑计数 1、DOM 内容 2”的断言，失败探针记录在 react-markdown-scheduling-vue-session-oracle.log。这个 DOM 保留差异仍未完成，不能据逻辑计数相等宣称 1:1。
- 首次七页源与生产各 70/70（react-markdown-scheduling-source-browser.log、react-markdown-scheduling-production-browser.log，NativeExit=0）后，继续增加首批测量断言，真实复现“只显示 1 个内容却 measuredCount=60”（react-markdown-scheduling-initial-measure.log，11/12、NativeExit=1）。根因是挂载过渡帧全量内容被提前测量。现批次配置切换在提交前派生正确初始数量，并将控制器内容测量推迟到挂载配置就绪；既保留 SSR 全量/占位契约，也避免过渡 DOM 污染缓存。该断言保留在 viewport spec，没有删除或放宽。
- 最终七页生产重新构建（react-markdown-scheduling-measure-production-build.log）后 70/70、NativeExit=0（react-markdown-scheduling-production-final.log），其中首批 renderedCount=1、measuredCount=1、stable=false。React 包 320/320（react-markdown-scheduling-package-certified.log）、三段 React 类型（react-markdown-scheduling-measure-types.log）、Vue 源类型（react-markdown-scheduling-vue-types.log）、定向 lint（react-markdown-scheduling-lint-acceptance.log）通过。Core THIRD_PARTY_NOTICES.md 补充解析/批次适配归属；graphify update 完成，旧图 source_file 警告仍在。
- 上一轮源码整组加载超时尚无根因修复；本轮成功不作为它已修复的证明。仍需处理会话 DOM 保留差异、协调宽度变化的批次上下文重置、精确占位估计与测量探针、完整流式增量解析/节点复用、typewriter/光标、缓存/排队恢复/emitInterval、嵌套属性/生命周期及重型异步节点、domMode、公共兼容出口与文档。完整文档构建、全库 E2E/跨浏览器和历史不稳定项未在本轮验收，goal active，未提交或推送。
- 首批测量修正后的最终源码七组 70/70、NativeExit=0（react-markdown-scheduling-source-final.log）通过；独立 5193 生产预览已停止。此结果与生产 final 70/70 一同覆盖本轮最终实现，不替代全库/完整文档/跨浏览器验收。

### 2026-11-08 Markdown 嵌套生命周期与等价图片节点

- 全部 100 组组件的 1:1 目标继续 active。新增私有 Markdown 根的父生命周期转发：本层控制器与父层均收到原始 key 的 reportHeight、markPending、markSettled；未增加节点包装或全局注册。fragment 子根即使自身没有 DOM 根，也会向父根转发 pending/settled。key 和 session 的校验仍由各自控制器完成。
- 重启前 5191 的已转换模块确实没有 parentLifecycle（react-markdown-nested-runtime-before.log），在这份旧运行实例上新增测试为 1/4：三项均复现图片尚未加载而父根 stable=true（react-markdown-nested-before-restart.log，NativeExit=3）。重启后转发实现的首轮 4/4（react-markdown-nested-after.log）通过。没有把文件已改但仍缓存旧模块的实例当成新实现验证。
- domMode 核对确认：锁定 Vue 的 minimal DOM 路径要求自定义节点映射为空，SD 默认映射始终非空，因此 SD 封装在 minimal 请求、fade/batch/defer/virtual 均关闭时仍保留 node-slot/node-content。新增 Vue 实际组件与 React SSR/浏览器同义断言，未为不可达的 SD 空映射路径添加额外包装分支；原始上游兼容出口仍待独立核对。
- 新增 markdown-nested 真实浏览器夹具：页面就绪后手动挂载子根，HTTP 图片响应由测试显式释放，每个用例使用独立 URL 并断言请求确实已被截获，避免固定延时和浏览器缓存假阳性。覆盖普通/fragment 子根在加载前阻止父层稳定、加载后恢复、子根中途卸载解除 pending、图片 AST 克隆后保持稳定。所有 afterEach 均释放未完成响应。
- Vue 对照初轮固定 1.2 秒响应不能排除时序/缓存干扰；改为门控和独立 URL 后，仍稳定复现图片加载后父根重新 pending（react-markdown-nested-vue-unique.log，2/4，NativeExit=2）。祖先生命周期探针记录 pending/settled/height 及多余 pending，定位到 SD image.vue 的单 getter 返回新数组：父节点对象等价替换也触发 reset，已加载 img 不再发 load，造成 pending 悬挂。改为 watch 的多个独立 getter，仅在 src/loading/fallback/indexKey 实际改变时重置，源码只改 1 行。新增直接图片克隆 AST 回归，既有 loading/key 切换和卸载用例继续通过。
- Vue nested-lifecycle 5 + image-lifecycle 2 + nodes 5 共 12/12、NativeExit=0（react-markdown-nested-vue-regression.log），包含祖先收到 pending/height/settled 的断言。React 包增至 321/321（react-markdown-nested-package.log）；源/浏览器/上游探针类型（react-markdown-nested-types-certified.log）、Vue 源类型（react-markdown-nested-vue-types.log）、定向 lint（react-markdown-nested-lint-certified.log）、7 文件格式检查（react-markdown-nested-format.log）通过。
- 八页生产构建（react-markdown-nested-production-final-build.log）后 74/74 Chrome、NativeExit=0（react-markdown-nested-production-browser.log）通过。graphify update 完成，旧图 104 个 source_file 警告仍在。未重跑完整文档构建/文档 E2E、全库浏览器矩阵或跨浏览器，未提交或推送。
- 后续仍需会话 DOM 保留差异、协调宽度变化的批次重置、精确占位/测量探针、增量解析/节点复用、typewriter/光标、缓存及恢复队列/emitInterval、重型异步节点与完整嵌套属性/解析配置、公共兼容出口和文档。RichTextEditor、Sender、已有全部组件完整行为与 API/样式核对、历史不稳定项继续未完成；本轮不是全量对齐完成声明。
- 最终源码八组 74/74、NativeExit=0（react-markdown-nested-source-browser.log）通过；独立 5193 生产预览已停止。上轮间歇页面加载超时没有专门根因修复，本轮正常退出不作为该问题已修复的证明。

### 2026-11-08 Markdown 已挂载节点保留与宽度批次上下文

- 目标仍覆盖全部 100 组组件，未缩成 Markdown，也未新增公共 Markdown 导出。本轮解决此前反复保留的两个明确差异；typewriter/淡入仅完成上游代码核对，光标实现尚未开始。
- 核对 Vue 根模板发现，它显式采用“已经挂载的 vnodeKey 或当前应渲染”条件保留内容，并非会话变化后的偶然缓存残留。vnodeKey 由线程（缺省为 indexKey/customId/实例）、索引和类型组成，不直接包含 session。React 原本以 session 作为 slot key 并只看逻辑批次数，导致逻辑重置时实际回收已挂载节点；新增会话断言在旧运行实例复现 11/12（react-markdown-materialized-before.log，NativeExit=1，实际 1 个而期望 2 个内容）。
- React 按相同身份规则记录客户端已实际提交的内容；session 或逻辑批次重置时保留它们，线程/节点身份改变、退出虚拟窗口或卸载时清理。挂载前的 SSR/过渡内容不进入此记录，保留首批 renderedCount=1、measuredCount=1 的已有回归。新断言确认会话重置后逻辑计数 1、实际内容与 measuredCount 均 2；线程切换及再切回均从 1 开始，未复活旧缓存；实际卸载重建也不继承前次缓存。未新增包装节点或自定义全局注册。
- 进一步补齐协调模式的批次 datasetKey：在 session/thread/measurementKey 之外包含 Core 已有的 32px 宽度分桶，使用控制器真实测量事件更新，不在 render 中读取布局。大幅缩窄容器会重置逻辑批次并保留已经挂载的两个内容。初次测试把 CSS width 240 误当作内容宽度，实际滚动条占用后 clientWidth=225；已改为读取真实 clientWidth。正确夹具在宽度实现前复现 renderedCount=2 而非 1（react-markdown-batch-width-baseline.log，11/12、NativeExit=1），实现后 12/12（react-markdown-batch-width-after.log，NativeExit=0）。
- Vue batch-scheduling 对照追加同义宽度与线程往返断言，1/1、NativeExit=0（react-markdown-materialized-vue-final.log）。React 相关夹具仍通过真实 IO、held idle、实际宽度、真实测量和真实 RAF/计时器执行，没有用纯结构断言替代逻辑和 DOM 状态验证。
- 八页生产重新构建（react-markdown-materialized-final-build.log）后 74/74、NativeExit=0（react-markdown-materialized-production.log）通过；React 包 321/321（react-markdown-materialized-package.log）、三段 React 类型（react-markdown-materialized-types-final.log）、Vue 源类型（react-markdown-materialized-vue-types.log）、定向 lint（react-markdown-materialized-lint.log）、格式（react-markdown-materialized-format.log）通过。graphify update 已执行，旧图 source_file 问题仍未修复。
- 会话 DOM 保留和协调宽度批次重置这两项不再作为缺口。后续仍需 typewriter/光标、淡入完整行为、精确占位/测量探针、增量解析/节点复用、缓存及恢复队列/emitInterval、重型异步节点、完整嵌套属性/解析配置、公共兼容出口与文档。RichTextEditor、Sender、已有全部组件完整 API/样式/行为核对、全库/文档/跨浏览器验证、既有加载超时等历史不稳定项保持未完成，goal active，未提交或推送。
- 最终源码八组 74/74、NativeExit=0（react-markdown-materialized-source.log）通过，独立 5193 生产预览已停止；源码间歇加载超时的历史问题仍不因本次成功而被标记修复。

### 2026-11-08 Markdown simple/precise 光标

- 全部 100 组组件仍在目标内。本轮新增 Core cursor.ts 的模式/尾部资格、反向文本查找和实际 Range 定位；React use-cursor.ts 负责活动计时、提交后的 DOM 适配和嵌套独占上下文。未发布 Markdown 公共入口，也没有宣称整体 typewriter/流式排版已完成。
- 模式按锁定 Vue 归一：true（运行时也兼容字符串 true）为 precise，simple 保留独立模式，其他值关闭。只有根渲染器拥有光标，内部子根总是继承已有 owner；fragment、supplied nodes、final、关闭模式均停止。raw/visible 内容增长触发，3 秒无增长后停止；代码块、提示块、表格、块数学、块 HTML、图片和分隔线作为尾部时不显示，并在文本查找中排除这些节点、script/style、测量探针及光标本身。
- simple 在末尾有效文本宿主（优先 text-node）添加唯一目标 class，使用 2px 伪元素光标，随新段落迁移；precise 使用末字符原生 Range 的最后一个 rect，换算 renderer 的边界及自身 scrollTop/scrollLeft，RAF 合并定位并读取最新提交配置，避免旧排队回调用旧节点。光标 aria-hidden、pointer-events:none，不进入正文复制内容。结束/禁用/模式切换/真实卸载取消计时器、定位帧和目标 class，StrictMode 重挂载也会重新建立活动期限。
- React 既有上游 CSS 提供 precise 外观与 blink keyframe，新增 simple 伪元素样式并在 reduced-motion 下关闭闪烁。pnpm exec stylelint 本次无法解析命令（失败日志保留），改用本地 .bin/stylelint.cmd；修正新增规则的 currentcolor 大小写后通过（react-markdown-cursor-stylelint-final.log）。没有更换工具链或编译器。
- 新增 2 项 Core 规则测试，Markdown Core 共 49/49（react-markdown-cursor-core-tests.log）。Vue cursor-contract 4/4、NativeExit=0（react-markdown-cursor-vue.log）实际确认 simple→precise、末字符坐标、true 归一、重型尾部/supplied nodes、final、3 秒过期及 fragment。React 新增 cursor spec 最初 8 项在确认为旧模块的运行实例全部失败（react-markdown-cursor-runtime-before.log、react-markdown-cursor-before.log，NativeExit=8），重启后 8/8（react-markdown-cursor-after.log）；随后补充真实 60 字/秒平滑流与实际 DOM Range 一致性用例，增至 9 项。
- React 浏览器用例覆盖两种 precise 输入、换行/追加、滚动容器坐标、simple 伪元素迁移、模式切换、重型尾部、supplied nodes、final/resume、真实 3 秒过期与卸载重挂、fragment/嵌套 owner/独立实例、CDP reduced-motion，以及平滑流可见内容追赶后的定位。几何断言独立遍历真实 DOM 文本并创建原生 Range，未用实现内部计算值作为预期。测试复用项目已有 CDP 媒体模拟方式，afterEach 清除模拟。
- 九页生产重新构建（react-markdown-cursor-production-certified-build.log）后 83/83、NativeExit=0（react-markdown-cursor-production.log）通过。React 包 321/321（react-markdown-cursor-package.log），三段 React 类型（react-markdown-cursor-types-certified.log）、Vue 源类型（react-markdown-cursor-vue-types.log）、定向 lint（react-markdown-cursor-lint-certified.log）与格式（react-markdown-cursor-format.log）通过。Core THIRD_PARTY_NOTICES.md 已加入光标规则与定位适配归属，graphify update 完成，旧图缺 source_file 仍未处理。
- 光标基础路径已有实现及浏览器证据；淡入的完整挂载/增量行为、精细流式文本状态/节点复用、可选重型节点及上游递归自定义节点的完整矩阵仍待验收。其余还包括精确占位/测量探针、缓存及恢复队列/emitInterval、完整嵌套属性/解析配置、公共兼容出口/文档、RichTextEditor、Sender、全部已有组件的完整 API/样式/行为核对、全库和跨浏览器验证及历史不稳定项。goal active，未提交或推送。
- 最终源码九组 83/83、NativeExit=0（react-markdown-cursor-source.log）通过；独立 5193 生产预览已停止。本轮没有重跑完整文档构建/文档 E2E或完整跨浏览器矩阵，也未据此宣称历史间歇加载超时已修复。

### 2026-11-08 Markdown 节点进入与增量文本淡入

- 目标仍覆盖全部 100 组组件。本轮新增 Core enter-fade.ts 与 React use-enter-fade.ts，在原有 node-content 的真实单元素根上管理进入动画，不增加包装 DOM。首次是否进入取决于 requested final，之后新增块及自定义组件根替换仍可进入；fragment、fade=false、代码块跳过，已有节点不重放。卸载清除动画帧、计时器和事件监听，StrictMode 重挂载可重新进入。
- Vue oracle 最初被 Vue Test Utils 默认的 transition-stub 影响；明确 global.stubs.transition=false 后才测真实过渡，未修改 parser 或生产 Vue 行为。真实测试确认：关闭 fade 不会中断正在运行的进入动画，final=true 仍允许后续自定义组件根替换进入。Vue fade 8/8 加 cursor 4/4，共 12/12、NativeExit=0（react-markdown-fade-vue-final.log）。
- React 初版出现已插入节点从 opacity=1 反向过渡到 0 的问题，首轮 9/10；改为先设置 from 并提交布局，再启用 transition，双帧切到 to 后才监听结束事件，修正后 10/10。另补原生 animationstart 的 CSSOM 断言，将增量文本默认 duration/ease 对齐 Vue 的 0.2s/cubic-bezier(0.2,0,0.4,1)，新 fade spec 共 11 项。代码保留可配置 CSS 变量，节点进入仍使用原有 0.28s 默认。
- 生产十页重新构建后，十组 Markdown Chrome 测试 94/94、NativeExit=0（react-markdown-fade-production.log）。React 包 321/321（react-markdown-fade-package.log），Core Markdown 50/50（react-markdown-fade-core-certified-tests.log）。React 三段类型、Vue 源类型、定向 lint/格式及 Markdown 样式检查通过。
- 单独执行 Core build 时发现上一轮组合命令的末尾成功状态掩盖了前置 TS2322；cursor.ts 将遍历变量明确标为 Node|null，独立 Core build 已确认 exit=0（react-markdown-fade-core-certified-build.log）。保留失败日志，未替换 TNB 或压制诊断。THIRD_PARTY_NOTICES.md 补充进入动画规则归属，graphify update 完成；原有 104 项 source_file 缺失警告仍在。
- 尚未完成文本选择期间冻结、精细流式文本状态/节点复用、重型节点完整矩阵、精确占位/测量探针、缓存及恢复队列/emitInterval、完整嵌套属性/解析配置、公共兼容出口/文档。RichTextEditor、Sender 和所有已有组件完整 API/样式/行为核对仍在总目标内；未重跑全库、完整文档构建/E2E或跨浏览器矩阵，未据此认定历史不稳定项已修复。goal active，未提交或推送。
- 最终源码十组同样 94/94、NativeExit=0（react-markdown-fade-source.log）；独立 5193 生产预览验证后停止，5191 源码服务保留供后续验证。定向文件和本次记录格式检查通过，git diff --check 无空白错误。

### 2026-11-08 Markdown 流式文本选区与分段状态

- 全部 100 组组件仍在目标内。本轮对锁定 Vue TextNode/Bn 状态实现建立真实 Selection/Range 对照：选区覆盖活动 delta 时暂存后续内容；动画结束仍保留选中的 delta DOM，释放选区后才提交暂存内容并顺序收敛已结束片段。选区仅覆盖稳定正文时继续追加，同时保留原始文本节点和选区。
- 新增 Core text-stream.ts，按 Vue 规则在 50ms 内合并尾片段、最多保留四段活动片段、从首个连续 finished 片段开始收敛，并使用文本缓存支持重挂载仅动画新增后缀。新增 4 项规则测试，Markdown Core 共 54/54（react-markdown-selection-core-tests.log），独立 Core build exit=0（react-markdown-selection-core-build.log）。
- React 默认节点映射加入私有 MarkdownTextNode，复用 Core 状态；稳定初始快照与后续追加使用两个 span，追加原生 Text 节点保持已选 DOM；追加超过四个节点时仅在选区不覆盖它们时压缩。selectionchange 仅在实际暂停时监听，释放/卸载移除，现有 StrictMode fixture 覆盖重挂载。原有自定义组件覆盖顺序保持，未增加公共出口。
- 首个选区用例曾因早于 React native click 提交而误判通过；加入提交等待后旧实现稳定 11/12、NativeExit=1（react-markdown-selection-before-certified.log）。新实现最初漏掉上游 CSS 动画名 class，导致动画不结束及 CSSOM 断言失败；补全 class 后 14/14。追加其他块时保留同一 delta DOM，不再因全局 streamRenderVersion 改变而提前结束原动画。
- 补充已稳定追加节点的选区及压缩测试，Vue fade 12/12 + cursor 4/4，共 16/16、NativeExit=0（react-markdown-selection-vue-compaction.log）。首轮扩展 React 生产回归 97/98，发现每次提交都压缩比 Vue 的 settledContent watch 提前一次，最终多留一个节点；改为仅在稳定内容变化时执行 DOM 同步，保留失败记录（react-markdown-selection-production-certified.log）。
- 本轮仅确认上述文本分段与选区路径；完整递归/重型节点组合、精确占位与测量探针、缓存恢复队列/emitInterval、完整嵌套属性与解析配置、公共兼容出口和文档仍待完成。RichTextEditor、Sender、其余已有组件完整 API/样式/行为核对及全库/文档/跨浏览器验证仍未完成；goal active，未提交或推送。
- 最终源码十组 98/98、NativeExit=0（react-markdown-selection-source.log），最新十页生产构建后同样 98/98、NativeExit=0（react-markdown-selection-production-final.log）。React 包 321/321（react-markdown-selection-package-final.log），React 三段类型、Vue 源类型、定向 lint/源文件格式和 git diff --check 通过；graphify update 完成，既有 source_file 警告仍在。5193 生产预览已停止，5191 源码服务保留。
- Core 与 React 均补齐上游归属说明，React package files 加入 THIRD_PARTY_NOTICES.md。实际 pnpm pack exit=0，tar 列表确认包含文本节点 JS/声明与归属说明（react-markdown-selection-pack.log）；未发布。未为格式检查调整现有 package.json 的无关 key 顺序。

### 2026-11-08 Markdown 自定义节点递归与配置继承

- 全部 100 组组件仍在目标内。本轮确认 React 原有 legacy custom component 路径只传 node，缺少锁定 Vue 为非内置自定义节点提供的递归默认插槽。旧 React 两项对照全部失败、NativeExit=2（react-markdown-custom-before.log）；新增私有 custom-children.tsx 后，优先使用非空 children AST，否则解析 node.content，final 取 !node.loading，文本路径关闭 smoothStreaming，内部渲染为 fragment 并关闭 batch/defer，保持 Vue 的节点及 indexKey 协议。
- 根渲染器提供锁定 Vue Dn 对应的 27 项嵌套配置，覆盖 customHtmlTags、parseOptions/customMarkdownIt、htmlPolicy、模式/主题、代码块/图形节点配置、光标/淡入和平滑参数；根 content/nodes、virtualScroll、final、宿主属性与回调不复制。已有节点映射按原优先级合成，自定义非内置组件按原组件 WeakMap 缓存适配器，保留 markstreamDisplay，不反复包裹已有适配器，不改变内置节点替换路径或写全局注册表。
- 新增 Core custom-node.ts，复用锁定 parser 的属性清洗和 prop 值转换，支持 tuple、具名条目及 record 三种 attrs，true 按 Vue 转为空字符串，普通数字属性保持字符串，false 经 parser 转为 false。新增 3 项 Core 测试，Markdown Core 57/57（react-markdown-custom-core-tests.log），独立 Core build exit=0（react-markdown-custom-core-build.log）。React 新增配置投影与组件身份/显示元数据 2 项测试，包测试 323/323（react-markdown-custom-package.log）。Core/React notices 已补齐归属。
- Vue oracle 初版错误假定 md.options.breaks 会产生 br；实际 parser 节点不支持该断言，改用真实 heading rule 的启停验证 customMarkdownIt 继承及更新。同时移除把所有 div 都当成宿主污染的错误断言（SD 标题合法包含 div），保留 fragment 无 node-slot/markdown-renderer 与 escape 字面文本断言。Vue 三项实际用例通过（react-markdown-custom-vue-recursive.log），未为测试改动 Vue 生产行为。
- 新用例验证 supplied AST 优先于 content、属性清洗、两层解析自定义标签、SD 标题/strong 子节点、escape 文本、继承主题、父配置更新后重解析且 AST 标题保持不变。最终源码十一组 101/101、NativeExit=0（react-markdown-custom-source.log），十一页生产构建后同样 101/101、NativeExit=0（react-markdown-custom-production.log）。React 三段类型、Vue 源类型、定向 lint、12 个相关文件格式及 git diff --check 通过，graphify update 完成；原有 source_file 警告与构建大块提示保留。5193 预览已停止，5191 源码服务保留。
- 本轮仅确认这些自定义递归路径，不代表任意 HTML/重型节点/流式组合的完整矩阵已通过。精确占位/测量探针、缓存恢复队列/emitInterval、可选重型节点完整协议、公共兼容出口和文档仍待完成；RichTextEditor、Sender、全部已有组件完整 API/样式/行为核对及全库/文档/跨浏览器验证仍在总目标内。goal active，未提交或推送。
- Vue 最终合并 custom-children/fade/cursor 三组 19/19、NativeExit=0（react-markdown-custom-vue-combined.log），确认这些测试按同一单 tab 流程运行时没有遗留 heading rule 配置污染。

### 2026-11-08 Markdown 静态占位估高与偏移

- 全部 100 组组件仍在目标内。React 原先将每个 node-placeholder 固定为 32px，协调偏移也统一使用已测平均值。本轮将锁定 Vue 的 sr/Mo 静态回退规则提取为 Core fallback-height.ts，覆盖标题层级、段落换行、列表长度与折行上限、表格行/列与 inline code、普通代码和 Mermaid/Infographic 预估、图片、数学块、关闭的 details、提示块/HTML 及其他节点。
- 标题及没有自定义 paragraph 的短简单段落不受偏大的平均值抬高，其余节点取静态值和当前平均值的较大者；已测高度优先。协调滚动使用同一套回退值建立偏移，保留未协调路径的平均值偏移；平均值按测量失效批次缓存并保留 Vue 的最小 12px。内容签名、布局/会话和自定义 paragraph 状态变化均使缓存失效，React 同步 paragraph 映射变化。没有将占位本身录入实测高度。
- 新增 3 项静态规则测试与 1 项 controller 集成测试，覆盖宽度变化、特殊节点、列表上限、diagram clamp、测量优先、协调总高度及自定义 paragraph/内容变更后的失效；Core Markdown 61/61（react-markdown-height-core-certified-tests.log），独立 Core build exit=0（react-markdown-height-core-integrated-build.log）。归属说明补充静态及 diagramHeight 规则来源。
- Vue 实测澄清：普通 deferral 未启用协调时，已有 40px 可见自定义节点不会改变占位使用的默认平均值，因此 thematic-break 占位为 32px；初版错误预期 40px 的失败日志保留（react-markdown-height-vue.log），修正后 1/1、NativeExit=0（react-markdown-height-vue-fixed.log）。该用例同时核对 10 个不同占位、600→320 宽度变化，以及未协调时没有高度探针。
- React 旧运行实例的新占位用例稳定失败、NativeExit=1（react-markdown-height-before.log）；重启最新源码后，十二组 Markdown 浏览器回归 102/102、NativeExit=0（react-markdown-height-source.log）。React 包 323/323（react-markdown-height-package.log），React 三段类型、Vue 源类型、定向 lint、11 个文件格式与 graphify update 通过。
- 本轮接通静态回退，不代表字体探针、精细文本/代码估高、独立缓存和恢复队列/emitInterval、完整重型节点协议或未协调模式的全部指标已对齐。公共兼容出口/文档、RichTextEditor、Sender、全部已有组件完整 API/样式/行为核对及全库/文档/跨浏览器验证仍待完成；goal active，未提交或推送。
- 最终十二页生产构建后的浏览器回归同样 102/102、NativeExit=0（react-markdown-height-production.log）；Vue placeholder-height/viewport/custom-children/fade/cursor 合并五组 22/22、NativeExit=0（react-markdown-height-vue-combined.log）。git diff --check 无空白错误，5193 预览已停止，5191 源码服务保留。

### 2026-11-08 RichTextEditor 正式 React 适配

- 本轮从其余缺失组件推进全部 100 组目标，新增正式 RichTextEditor React Adapter、类型、内置节点视图、根/子路径导出、节点类/工厂与全部公开类型。复用现有 Core Lexical Foundation 的编辑、历史、插件、格式化、HTML/Markdown/JSON、原生命令及组件节点协议，没有复制 Lexical 状态机或新增编辑器依赖。复用共享 SCSS，独立样式包含 JsonForm 全部控件与 Tag；README、QUICK-START 和 ARCHITECTURE 同步接线说明。
- value/modelValue、defaultValue、onValueChange/change/update/ready/focus/blur/error、语义样式、autoSize、禁用/只读和初始化配置均已接入。ref 在 mount/ready 前建立，所有编辑方法和原生 editor/state/rootElement/history 句柄转发共享 Foundation。Portal 保留 React 上下文，使用只读节点快照；全部 26 个 JsonForm 节点与 Tag、未知节点回退、具名 slots、fitWidth 默认与单节点退出均有入口，ConfigProvider 复用 JsonForm 控件映射。
- 首轮 4/6 后修正测试的等待方式和 Input 原生 class 假设；扩展用例真实发现输入 Changed 变为 Cagd。原因是 Portal 的快照回显晚于 Input 的受控 DOM 恢复，节点交互更新现在定向同步提交快照。初始化保持普通调度，卸载清理插件、根绑定及 Portal；不是以调慢输入或修改期望规避丢字。
- 生产文档最初 1/2，出现 React hydration #418。限制初始化同步刷新后仍有失败，未将该尝试当成修复证据。直接断言首次交互的受控内容确认当时仍是空 SSR 宿主，测试曾在 Lexical 挂载前直接写入原生 contenteditable。宿主现在在挂载前不可编辑；生产测试通过 MutationObserver 记录 SSR 属性，并延迟真实模块响应 1500ms，验证 false→已挂载 true 后编辑，未拦截或忽略 hydration 异常。文档 custom Input 的 aria-label 改为 inputAttrs 绑定到真实 input。
- 源码 Chrome 9/9、NativeExit=0（react-rich-text-browser-certified.log），覆盖 StrictMode ready/ref/清理、真实输入、受控导入导出、选区格式与历史、节点更新/删除/带 Portal 卸载重挂、自定义节点、禁用/只读、无监听不序列化、原生命令与监听、错误恢复、全部内置节点及 14 项 fitWidth selector、真实 DatePicker 浮层选择。错误恢复采用 Vue 现有 malformed JSON 同义案例；缺少 root 的合法 JSON 可能由共享 Core 报告两个不同错误，不宣称该输入只有一次通知。
- Vue 原有 index/html-fragments/combined-decoration/robustness/component-spacing 五组 45/45、NativeExit=0（react-rich-text-vue-baseline.log）。React 包 326/326（react-rich-text-package-ready.log），含新增 SSR、公开节点常量及实际独立样式构建检查。发布声明的根入口补齐 SerializedInlineComponentNode，新增使用实际包入口的类型消费及 readonly/状态负例；独立 build、React 三段类型与全部 React 文档 TSX 类型检查通过。
- 完整文档生产构建 212 页通过（react-rich-text-docs-final-build.log），本组件生产文档 3/3、NativeExit=0（react-rich-text-docs-final.log），覆盖编辑/只读、受控模型、自定义节点读写与延迟 hydration。文档开发服务的一次请求超时保留（react-rich-text-docs-diagnostic.log），没有计为验证通过。实际 pnpm pack 成功，tar 检查包含组件 JS、声明及独立样式；未发布。
- 定向 lint、stylelint、格式、git diff --check 和 graphify update 已执行，原图 source_file 警告仍在。更新后的 100 组结构清单仅剩 MarkdownRender 的公开入口/文档和 Sender 的交付链路缺口（react-rich-text-inventory-final.log）；它仅检查存在性，所有 behaviorVerified 仍为 false，不能据此声明 98 组或全部组件行为已经完成。Markdown 精细测量/重型节点/缓存恢复、Sender、其余组件完整 API/样式/行为及全库/文档/跨浏览器矩阵仍待验收。goal active，未提交或推送。

### 2026-11-09 Sender 正式 React 适配

- 接通 Sender、SenderHeader、SenderSwitch、RecorderCore 的根入口、sender 子路径、声明、独立 SCSS 与 React 文档。Sender.Header/Switch 与独立导出保持同一组件身份。React 连接共享模型/动作、结构化内容/技能节点、插入/焦点、Header/Switch/SkillTag 和录音 Foundation；自定义节点使用 RichTextEditor Portal，不引入第二套编辑器。
- 修复共享录音控制器 dispose 后重新 mount 仍被 disposed 标志拦截的问题：先新增可复现失败用例（react-sender-recorder-before.log），再在 mount 恢复生命周期标志；过期会话继续通过 recorder 实例身份过滤。recorder-base 显式保留 SDK 声明的 default 类型，避免 NodeNext 将 SDK 推断成不可调用的命名空间；运行时 ESM 引擎顺序不变。
- React Sender Chrome 8/8 通过（react-sender-browser-extended.log）：连续文本、受控/显式 undefined、ShiftEnter、加载取消、readonly/disabled、内容空白聚焦、结构化配置与保留编辑、自定义节点/技能删除、运行时插入、Header 卸载/forceRender、Switch、StrictMode 模拟录音启停与禁用清理、输入法/修饰键/按键拦截、文件粘贴、命名插槽聚焦及只读保护。RichTextEditor 回归另 9/9 通过（react-sender-browser-certified.log）。录音使用 RecorderCore 原型模拟，不代表真实麦克风验收。
- React 包测试 329/329（react-sender-package.log），Sender Core 39/39（react-sender-core-certified.log），Vue Sender 的 recorder-boundaries/model-binding/foundation-flow/header-toggle/readonly-newline 五组 Chrome 基线 15/15（react-sender-vue-baseline.log）。React 包与根/子路径消费端的 bundler/NodeNext 类型均通过（react-sender-public-nodenext.log），React 文档 TSX 类型通过（react-sender-docs-types.log）。
- 全文档站 213 页构建通过（react-sender-docs-build-final.log），生产产物 Sender 文档交互 2/2（react-sender-docs-e2e.log），验证受控发送、Header/Switch 与真实结构化输入读取。首次构建因 MDX 参数花括号被当作表达式失败，已改为代码文本并重新完成构建。保留用户 5187/5188 服务；本轮生产产物由独立静态服务验证。
- 定向 lint、Sender SCSS stylelint、格式、diff 检查通过。graphify update 已执行，仍报告原有 104 个 source_file 缺失警告且未检测到拓扑变化。本地打包 .local/react-sender-pack/sdata-web-react.tgz 已确认 Sender JS、声明与独立样式存在；没有发布、提交或推送。
- 100 组组件结构清单现在只报告 MarkdownRender 的根导出、子路径与文档缺口（react-sender-inventory.log，退出 1 是此剩余缺口）。behaviorVerified 仍全部为 false；Sender 定向证据不替代所有 props/事件/样式组合、真实音频设备、完整库/文档和跨浏览器矩阵。Markdown 精细测量、重型节点、缓存恢复及全部已有组件完整行为核对继续在总目标内，goal active。

### 2026-11-09 Markdown 独立缓存、恢复队列与事件节流

- 全部 100 组目标不变。补齐原先仅有类型声明的 virtualScroll.heightCache/heightCacheWidth/emitIntervalMs。Core 复用统一缓存条目校验，独立缓存必须匹配宽度分桶、合法索引/高度与每个节点的签名；不接受仅有 nodeType 的无签名条目。兼容缓存用于占位及偏移，真实 DOM 高度优先；缓存输入未变时跳过重复校验，已应用指纹不反复覆盖实测值，宽度分桶变化后允许重新应用。
- restoreVirtualState 在节点为空或宽度尚不可用时保留请求，布局和节点更新后重试；禁用协调、切换 session/thread、卸载会丢弃不适用请求。异步锚点回填校验请求代次与布局身份，避免旧回填覆盖新请求；React 声明式恢复同步增加节点数、session/thread 和 enabled 依赖。关闭 restoreAnchor 的完整声明式交互矩阵仍需继续核对，未据此宣称所有恢复组合完成。
- 普通高度/状态事件按 emitIntervalMs（默认 32ms）合并，使用单调时间；forceMeasure/settle 立即发送并取消延迟重复。卸载前保留 Vue 的最后快照与异常保护，再释放 observer/事件和 timer。故障注入证实消费者卸载回调抛错会使未保护版本失败（react-markdown-unmount-before.log，3/4）；恢复保护后该路径纳入最终回归。
- 新增真实 Vue oracle：独立缓存 4 项、显式滚动容器下的空节点/零宽/跨会话恢复 3 项、手动稳定模式下节流/强制测量/卸载/消费者抛错/单独线程切换 5 项。初版断言误将未协调自定义节点占位写成 32px，实际为 40px；Core 静态规则已是 40px，仅修正测试预期。初版恢复 oracle 自动识别滚动容器时结果不同，改为显式指定同一容器验证队列；不宣称该自动识别差异已解决。自动 final 稳定通知可强制发送，节流 oracle 使用 manual 模式隔离该路径。
- 修改前恢复两项失败、一项通过（react-markdown-restore-before.log）；独立缓存也有实际占位不匹配记录，最早 min-height 断言无效的日志不作为缺陷证据。新增 helper 的首轮 Core 测试因缺少导出失败，仅作为未实现记录。最终 Markdown Core 62/62（react-markdown-cache-core-certified-tests.log），React 包 329/329（react-markdown-cache-package-certified.log）。
- 首轮完整源码回归 110/111，HTML 首次访问在断言前发生 60 秒 load 超时（react-markdown-cache-all-source.log）。保留该记录，不将重跑视为根因修复。复核后为控制器更新 effect 补齐 threadKey/enabled 依赖，防止只有线程或协调开关变化时遗漏更新；新增同内容/同宽度仅替换 threadKey 的通知检查。最终十五组源码 113/113、exit 0（react-markdown-thread-all-source.log），最新十五页生产构建与同组生产回归 113/113、exit 0（react-markdown-thread-build.log / react-markdown-thread-all-production.log）。Vue 新增三组与 placeholder/viewport/custom-children/fade/cursor 合并八组 34/34、exit 0（react-markdown-thread-vue.log）；已有 Vue 组件枚举及 ResizeObserver 通知警告仍在。
- React 四段类型检查和实际 Vue vue-tsc 均通过（react-markdown-thread-types.log / react-markdown-cache-vue-tsc.log）。全仓 TypeScript-only 源码检查失败于本轮前已有的 calendar/date-picker/regex-vis 等未跟踪 .cy.js 文件（react-markdown-cache-vue-types.log）；没有删除这些来源未核明的文件，也不把该门禁记为通过。定向 lint、16 个相关文件格式和 git diff --check 通过；线程复核四个文件的 lint/格式再检查同样通过。无新增样式修改。
- Core 归属说明已补充，实际本地 pack 确认包含两个虚拟状态模块的 JS/声明及 notices（react-markdown-cache-pack.log）。graphify update 执行成功，既有 104 个 source_file 缺失警告和拓扑未变化提示仍在。未发布、提交或推送，未操作用户 5187/5188 服务。
- 独立缓存、基本恢复排队及通知调度不再仅为声明；字体探针/精细估高、恢复与通知完整组合、重型异步节点和嵌套 API、MarkdownRender 公共入口/文档，以及全部 100 组组件完整 API/样式/行为和全库/跨浏览器验收仍未完成。结构清单的 behaviorVerified 继续全部为 false，goal active。

### 2026-11-09 Markdown 字体探针与简单文本精细估高

- 全部 100 组目标不变。本轮对照当前锁定的 markstream-vue 2.0.18，新增 Core markdown/text-height：段落、标题、单段落列表项及简单列表可使用真实字体布局；叶子仅接受 text/emoji/hardbreak，其余继续静态回退。复用已经安装的 @chenglou/pretext，浏览器按需加载，prepared/text-height 缓存分别限 240/4000；SSR 不加载浏览器布局引擎，无 Canvas 时返回静态估高。没有新增依赖或替换上游解析器。
- React height-probes 在协调模式挂载后渲染隐藏的段落、列表项、列表和六级原生标题，共 9 个探针。通过原生计算样式、包装高度与内容宽度形成字体 profile，观察尺寸和字体加载事件；探针隔离正文 textStreamState。SSR 和 fragment 不创建探针，公开 handle 中的 measuredCount 不包含这些隐藏节点。正文槽位数量测试同步限定为 .node-slot > .node-content。
- Core 协调偏移按实测高度、精细文本估高、静态回退依次选择；自定义 paragraph 时，paragraph/list_item/list 维持 Vue 的静态回退规则。宽度即使仍在同一 32px 分桶，也使估高和前缀偏移失效，保留仍兼容的实测高度；profile 身份变化也触发重新估算。
- 实际 DOM 对照发现 React 原生 paragraph/list-item/heading 的工具类默认值不同：例如段落 profile 额外高度约 35px，Vue 为 16px；React 首轮精细对照 2/4 通过，宽屏估高为 [123,79,28,176,141,80,57,24,79]，未匹配 Vue。已让真实可见原生节点消费同一组 Vue 样式变量，保留 SD 标题适配；六级原生标题规则限定 heading-node 类。原生列表使用锁定的 --ms-space-1_5 变量名，单行 stylelint 例外只用于该上游命名。没有仅给隐藏探针补偿偏差。
- Vue oracle 的初版将外层 320px 当作内容宽度，但实际滚动条占用 15px；外层字体也被上游根样式覆盖。修正测试为实际 585/305/590px 内容宽度和显式根字体，并用 measurementKey 标记字体变化；保留初始失败记录。真实 Vue 捕获宽屏、窄屏、同分桶变化、Courier New 与自定义 paragraph 五组估高。临界文本在 585→590px 时由 60px 降到 38px；自定义 paragraph 的富文本短段落由 28px 回退到 80px，均在 React 对照中匹配。
- 继续核对 1000/1280px 视口后，桌面简单列表在 React 为 135px、Vue 为 123px，新增桌面用例先失败（react-markdown-probe-desktop-before.log）。已让真实 list-node 使用 Vue 的列表变量；1023px 及以下仅无序列表使用移动间距，有序列表维持基础间距。React 新增桌面估高和四种真实列表间距对照，定向 7/7；Vue 两种视口估高与四种真实列表基准 6/6。Vue 测试初版误用了协调模式的槽位选择器，改为检查唯一真实列表，未修改 Vue 产品实现（react-markdown-probe-final-targeted.log / react-markdown-probe-final-vue-targeted.log / react-markdown-probe-final-vue-targeted-fixed.log）。
- 最初十六组源码与生产各 118/118；补充全部 9 个探针的精确 profile、桌面估高及有序/无序列表对照后，最终源码与生产各 120/120、exit 0（react-markdown-probe-final-all-source.log / react-markdown-probe-final-all-production.log），十六页生产构建通过（react-markdown-probe-final-production-build.log）。测试还覆盖无 Canvas 回退、隐藏可访问性、真实可见段落边距和原生列表间距。
- Vue 新探针 oracle 与原有缓存/恢复/节流、占位、视口、递归、fade、cursor 合并九组最初 35/35；补充桌面和列表矩阵后最终 40/40、exit 0（react-markdown-probe-final-vue-combined.log）。Markdown Core 65/65（新增简单文本、列表和 SSR 三项，react-markdown-probe-core-certified.log），React 包 330/330（新增协调 SSR 不创建探针，react-markdown-probe-package.log）。最终 React 四段类型、实际 Vue vue-tsc、定向 lint、SCSS stylelint、格式及 diff 检查通过。未重跑全库浏览器与文档站矩阵，也未清理前轮已经报告的 .cy.js 源码门禁问题。源码浏览器日志还出现自定义递归 fixture 的 section 嵌套 p 警告；120 项通过不能证明自定义块级内容的 SSR hydration 正确。
- README、QUICK-START、ARCHITECTURE 与两个包的第三方说明已同步。实际本地 pack 确认包含 Core text-height、React height-probes 的 JS/声明、SCSS 和 notices；最终列表样式已重新 pack 并核对（react-markdown-probe-final-react-pack.log）。graphify update 已执行，原有 104 个 source_file 缺失警告和拓扑未变化提示仍在；未提交、推送或发布，已停止本轮 5193/5194 服务，未操作用户 5187/5188 服务。
- 原生字体探针与上述简单文本估高不再缺失；代码块精细估高、真实字体下载/完整字体矩阵、恢复/通知的完整组合、重型异步节点及完整嵌套属性、MarkdownRender 公共入口/文档、其余全部组件的完整 API/样式/行为与全库/跨浏览器验收仍待完成。结构清单的 behaviorVerified 继续全部为 false，goal active。

### 2026-11-09 Markdown 协调代码块估高

- 全部 100 组组件目标保持不变。新增 Core markdown/code-height，按当前锁定的 markstream-vue 2.0.18 实现流式代码和 pre 的几何估高：保留 final/loading 尾部换行差异、split/unified diff 行计数、行号占宽、tab 停靠、宽字符换行、padding、字号/行高、滚动与换行模式、内容高度上限及标题高度。模块不依赖 React、DOM 或 Canvas，没有新增依赖。
- React markdown-render/code-height 按原生代码组件、语言覆盖、代码覆盖和 pre 配置选择估高器，图表与未知自定义渲染器保留回退。递归自定义包装使用 WeakMap 记录原始组件，使显式指定 PreCodeNode/CodeBlockNode 的语言覆盖仍能识别。Core controller 保留实测高度优先级；估高器身份变化使前缀偏移失效，React 同步触发 update，代码选项则继续参与 measurementKey。
- 新增共享代码 AST 和 Vue 实机 oracle，分别捕获流式、pre、scroll、无标题/行号、自定义字号与 unified diff 五种配置在 585/305px 内容宽度下的结果，随后增加未知自定义代码组件回退，共 6 项。React 对照固定的真实 Vue 数组，并验证 resize、代码选项更新、安装/移除自定义代码组件；原始 6/7 的失败来自测试漏算 raw diff 和末尾空行，Vue 新 oracle 确认回退为 [96,96,96,96,96,112,96,2032]，修正后新增 7/7（react-markdown-code-browser.log / react-markdown-code-vue-oracle-custom.log / react-markdown-code-all-source.log）。
- Markdown Core 68/68，React 包 332/332，均 exit 0；React 四段类型、实际 Vue vue-tsc、定向 lint、格式与 diff 检查通过（react-markdown-code-core-suite.log / react-markdown-code-package.log / react-markdown-code-react-types-final.log / react-markdown-code-vue-types.log）。
- 十七组源码回归 126/127、exit 1：HTML 首项的 cy.visit 再次等待 load 事件 60000ms 超时，其余 126 项通过，保留本次失败（react-markdown-code-all-source.log）。十七页生产构建通过，同组生产回归 127/127、exit 0（react-markdown-code-production-build.log / react-markdown-code-all-production.log）。生产通过不证明源码首次加载的间歇超时已修复。
- 新代码估高 oracle 与字体探针、缓存、恢复、节流、占位、视口、递归、fade、cursor 合并十组 Vue 组件测试 46/46、exit 0（react-markdown-code-vue-combined.log）。该基准只覆盖上述合同，不代替完整 Vue 测试或跨浏览器验收。
- README、QUICK-START、ARCHITECTURE 和两个包的第三方说明已同步。本地两个包 pack 并核对新增 code-height JS/声明、递归包装和 notices（react-markdown-code-core-pack.log / react-markdown-code-react-pack.log）。graphify update 执行成功，既有 104 个 source_file 缺失警告和拓扑未变化提示仍在。
- 该交付是协调估高，不是完整代码渲染 API 验收：实际上游 React pre 对代码选项、标题和图表语言的处理仍需与 Vue 逐项核对/适配；普通批处理估高也需单独对照。此前自定义块内容 SSR 嵌套警告、源码首次加载超时、字体下载矩阵、恢复/通知组合、重型异步节点、完整嵌套 API、MarkdownRender 公共入口/文档及全部组件完整验收仍待完成。结构清单仍为 100 组、Markdown 一组存在入口/子路径/文档缺口，behaviorVerified 全部为 false；goal active。

### 2026-11-09 Markdown 默认 pre 的实际渲染

- 继续全部 100 组目标。对照锁定的 Vue PreCodeBlock，而不是将公开 PreCodeNode 等同于内部外壳。Core 新增 markdown/pre-code，管理主题、代码样式、fence 文件名标题、复制边界和 80/120ms 提示延迟；code-height 与实际 pre 复用规范化视觉选项，SCSS 位于 Core。没有新增依赖。
- React nodes/pre-code 补齐默认 pre 的标题/副标题、语言图标、复制按钮与成功反馈、异步 clipboardWriter、原始复制文本、失败不发成功事件、showHeader/showCopyButton/showLineNumbers/showTooltips，以及 loading 尾部换行和普通代码逻辑行。复制成功后反馈持续 1000ms；卸载清理计时器和订阅，忽略卸载后的复制反馈与事件。提示内容按 hover/focus 时的状态取值，维护 aria-describedby 并按 Vue 的 80ms 显示、120ms 隐藏。
- pre 模式下 mermaid、infographic、d2/d2lang 的默认分派均进入代码外壳，保留显式语言/代码组件覆盖。代码上下文沿现有嵌套渲染上下文传递；SSR 验证五种语言和嵌套节点的标题、样式、行号配置，既不创建字体探针，也不挂载异步图表。
- 修正前轮估高中的一个错误判断：Vue 公开 PreCodeNode/CodeBlockNode 与内部 pre/deferred 组件不是同一对象。新增真实 Vue 原生组件覆盖 oracle，8/8 确认公开组件覆盖仍回退到 [96,96,96,96,96,112,96,2032]（react-markdown-pre-vue-native-oracle.log）。React 已同步修正并删除无用的 sources WeakMap/getMarkdownSourceComponent，检索源码和测试无剩余引用；递归包装本身继续保留。
- Vue 首轮样式捕获碰到了异步组件的临时 pre 回退，随后改为等待 data-markstream-code-theme，避免将加载占位当作最终结果。五组实际样式覆盖 default/configured/scroll/bare/plain-title，记录 16 项 CSS、代码高度、逻辑行、主题与标题几何。React 首轮 5/9 暴露真实差异：标题区 57px 对比 Vue 52.6875px，配置后代码高度 150px 对比 136px。已修正标题行高、重复内容缩进、无副标题时的最小高度，以及暗色标题背景；最终普通标题 39px、有副标题 52.6875px 与 Vue 一致（react-markdown-pre-browser-before-css.log / react-markdown-pre-browser-fixed-css.log / react-markdown-pre-browser-header-fixed.log）。
- 提示 oracle 初版被 cy.clock 暂停了 Vue 的 80ms 显示计时，补充时钟推进后 Vue 7/7。React 扩展测试首次 137/138，唯一失败来自直接 trigger('mouseenter')，未进入 React 由 mouseover 合成的 onMouseEnter；改用 mouseover/mouseout 后 pre 定向 11/11（react-markdown-pre-vue-tooltip.log / react-markdown-pre-vue-tooltip-timing.log / react-markdown-pre-all-source-final.log / react-markdown-pre-tooltip-react-events.log）。保留失败记录，未改低几何或时序断言。
- Markdown Core 71/71，React 包 334/334（包含新增 SSR 两项），均 exit 0；最终 React 四段类型、实际 Vue vue-tsc、定向 lint、共享 SCSS stylelint、格式及 diff 检查通过。两个包实际 pack 核对包含 pre-code JS/声明、共享 SCSS、节点视图及 notices（react-markdown-pre-core-certified.log / react-markdown-pre-package-final.log / react-markdown-pre-types-certified.log / react-markdown-pre-vue-types.log / react-markdown-pre-core-pack.log / react-markdown-pre-react-pack.log）。
- 最终十八组源码 138/138、exit 0；十八页生产构建通过，同组生产 138/138、exit 0（react-markdown-pre-all-source-certified.log / react-markdown-pre-production-build-final.log / react-markdown-pre-all-production.log）。Vue 新旧十一组合同合并 55/55、exit 0（react-markdown-pre-vue-combined.log）。README、QUICK-START、ARCHITECTURE、两个包的 notices 与当前迁移记录已同步；graphify update 执行成功，原有 104 个 source_file 缺失及拓扑未变化提示保留。未提交、推送或发布；已停止本轮 5193/5194 服务，未操作用户 5187/5188 服务。
- 默认 pre 的上述能力已实现；详细 diff 折叠/行同步、reservedHeight 与 loading 的完整组合、异步重型代码交接、流式性能/完整字体和浮层视觉矩阵仍需进一步对齐。源码首次加载的历史间歇超时没有根因修复，自定义内容 SSR 嵌套警告仍在。Markdown 公共入口/文档与全部 100 组组件的完整 API/样式/行为及全库/跨浏览器验收仍未完成，behaviorVerified 全部保持 false，goal active。

### 2026-11-09 Markdown 默认 pre diff 对照

- 全部 100 组目标继续有效。默认 diff 视图改用与 Vue 相同的 markstream-core 2.0.18 数据构造和增量缓存，删除对上游 React 旧 pre 视图的运行时依赖；Core 直接声明已锁定、已安装的精确依赖，offline frozen install 通过，没有升级依赖。共享代码负责行号宽度、折叠标记、成对行高测量和观察清理；React 保留 DOM 与生命周期适配，样式放在 Core。
- 补齐 split / inline、未修改区域折叠与展开、补丁 metadata、空行、CRLF、loading、行号宽度增减、暗色和 reservedHeight。45 份期望捕获来自真实 Vue Chrome DOM，包括 600/320px 宽度及字体变化；没有用 React 输出生成期望。React 首轮 1/10 揭示 diff 前景色差异，补齐原生 Vue 配色后 3/11 又揭示旧 rich 容器变量污染，恢复默认 pre 的继承语义后 11/11。保留各轮失败日志，未放宽几何断言。
- 严格等待当前同步行高后，Vue 首轮 6/9 揭示 capped pre 在字体变化时尺寸不变，原生 ResizeObserver 不会重新测量。Vue 适配层增加 post-flush 的可取消单帧刷新，复用 Core 测量，不修改用户组件 props；最终新 oracle 10/10。Core 测试覆盖增量缓存、折叠/inline、宽度回退与卸载后帧取消。
- Markdown Core 74/74、React 包 336/336、React 四段类型检查及实际 Vue vue-tsc 通过；十九组源码与十九页生产浏览器各 149/149，生产 HTML 构建通过。Vue 合并十二组第一轮在四组测试开始前失败，均为 component.ts 动态导入失败（46 通过，4 个框架生成失败）；无构建并行的第二轮 65/65、exit 0。后者不证明前者的间歇加载问题已经修复，两轮日志均保留。
- Vue 主 ESM 构建与声明构建通过，未执行图标再生成及完整发布任务。Core / React 实际 pack 核对新增 pre-diff JS、声明、共享 SCSS、notices 和 Core 精确依赖；定向格式、lint、stylelint、diff 检查通过。README、QUICK-START、ARCHITECTURE 和 notices 已同步。graphify update 成功，既有 104 个 source_file 警告和拓扑未变化提示仍在。
- 这批仅验收上述默认 pre diff 合同。fragment 根节点下字体刷新、reservedHeight/loading 的完整浏览器组合、重型异步代码交接、完整嵌套 API、字体/性能与跨浏览器矩阵仍需覆盖；历史源码首次加载超时和自定义内容 SSR 嵌套警告保留。结构清单仍为 100 组、MarkdownRender 公共导出/子路径/文档缺口一组，behaviorVerified 全部为 false，goal active；下一步扩大到全组件浏览器回归。

### 2026-11-09 扩大全组件验收

- 继续覆盖全部 100 组。重新直接构建当前 Astro 文档站，213 页通过（react-all-docs-build.log）；运行时演示使用独立 5195 静态服务，源码使用独立 5194。Astro preview 因检测到既有 5188 服务而拒绝另起实例，未使用 force 或停止原服务；改用 Vite preview 托管独立构建目录。ignored 的 Cypress 配置只将测试 visit 中的 5188 地址映射为 5195，不修改正式 spec 的断言和交互。
- Core 全量首轮 1628/1629：旧样式门禁禁止所有 driver.js 引用，误伤已共享的 tour/style/vendor.scss。仅为这个精确文件校验唯一上游导入，并实际从 Core 的声明依赖编译、检查 overlay/popover CSS；其他 Sass 路径的限制保留。修正后全量 1629/1629、exit 0（react-all-core-tests.log / react-all-core-tests-fixed.log）。
- 样式、主题与类型文档合同首轮 39/40，Grid ColProps 期望仍指向迁移前的 Vue interface；核对 Vue 入口已 re-export Core 类型后更新其精确来源。最终 40/40、exit 0（react-all-foundation-contracts-fixed.log）。当前文档 Vue / React 类型检查通过；React / Core / React 文档组件范围 oxlint exit 0，仍有 8 个 warning；两个包全部 SCSS 的 stylelint exit 0。
- 源码门禁发现 38 份不在正式 Cypress specPattern 中的旧 JS spec。检索源码/配置无文件名引用，逐测试体比对正式 TS 用例：35 份全部相同，另三份只有更新后的 ColorPicker listener/卸载断言及 TimePicker 卸载断言差异，均逐项核对。已删除这 38 份重复文件，没有删除正式 TS 用例；源码门禁通过，覆盖 1370 个 Vue 文件（react-legacy-spec-audit.json / react-all-source-gate-fixed.log）。
- 全部 145 个 React Chrome spec 的基线扫描在完成前 33 组后主动停止，以先处理已发现的 ColorPicker 失败；这 33 组为 412/413，不是完整全量通过（react-all-browser.log）。原始 ColorPicker 为 41/42，色相调整后实际仍为 0.00，期望 0.75；调查和修复证据见下节。此前 Markdown 十九组两种构建的通过不覆盖未运行的其余组件合同。
- 附加声明盘点使用已构建 Vue/React 类型和 Bundler 解析模式；初版 NodeNext 无法解析 Vue 的无扩展路径，返回空字段，已弃用该结果。当前采集 107 个名称以 Props 结尾的导出及 214 个构造组件/别名，其中 41 项尚不能据此解析出两端完整 props；这只是缺口筛查，不是类型兼容或行为验收。已核对明确缺口：React TreeSelect 缺少 Vue 顶层 ellipsis 及其 popup 宽度联动；ConfigProvider 缺少 cascaderSpinProps / treeSelectSpinProps，消费端也未合并这些专用配置。需在基线终态后补相关 Vue / React 回归并修复。其他 modelValue、原生属性及事件命名差异仍需按框架映射逐项核对。

### 2026-11-09 全组件扫描发现的 ColorPicker / 下拉配置修复

- ColorPicker 的独立 25 次首次点击复现为 23/25。失败帧记录显示 mousedown 已调用共享控制器并排入 RAF，随后 React StrictMode 的 disappearLayoutEffects 调用 dispose，取消了该帧，颜色因此保持旧值；不是忽略一次失败后的单次绿灯。新增测试先保留 RAF 队列，等待两次 StrictMode 布局连接后再刷新队列，旧适配稳定失败（react-color-deterministic-before.log，41/43）。
- Vue 的既有合同要求真实卸载取消待发送颜色更新，因此没有将共享初始点击改成同步通知，也没有改变 Core 算法。React useColorControl 改用仓库 Calendar 已有的生命周期代次 + 微任务销毁模式：StrictMode 在该微任务前重连，真实卸载仍在下一帧前清理。固定时序回归、真实卸载取消及原有 ColorPicker 用例修复后 43/43；同样的独立点击复现后 25/25，原始失败帧另存保留（react-dropdown-fixed.log / react-color-debug-fixed.log）。
- React TreeSelect 增加公开 ellipsis，按顶层、本地 treeProps、true 的顺序取值，同时用于选项渲染和 autoFitPopupWidth；false 时按原生 Vue 合同释放弹层宽度。ConfigProvider 增加 cascaderSpinProps / treeSelectSpinProps；两消费端把专用配置与局部对象逐字段合并，Spin 再继承全局 spinProps。新测试初版 0/2，分别暴露 plain 宽度与专用 Spin 未生效，修复后 2/2；随后扩展 Cascader 普通列/搜索两条加载路径。
- Vue 对照覆盖上述默认值、顶层优先、省略模式切换、宽度、全局/专用/局部 Spin 继承及运行时撤销配置；扩展后合并既有 TreeSelect 和 ColorPicker 卸载回归，44/44、exit 0（react-dropdown-vue-oracle-final.log）。React 包重新构建并测试 336/336，四段类型检查、实际 Vue / 文档 Vue / 文档 React 类型检查通过。React 实际 pack 核对新属性声明和 ColorPicker 微任务销毁实现；定向 lint/格式及源码门禁通过。
- React ConfigProvider 与 TreeSelect 文档已同步；最新独立 Astro 生产构建再次通过 213 页（react-all-docs-final-build.log）。24 组 Cascader / TreeSelect / ColorPicker 源码回归最终 153/153、exit 0，包含新增两条 Cascader 加载路径（react-dropdown-all-source.log）。全部 103 个浏览器 HTML 页面也已实际生产构建通过（react-all-pages-build.log）。完整全组件扫描还需继续，不以该子集替代全部 100 组的验收。
- 全部 146 个 React spec 的第一轮生产 Chrome 扫描已收齐，17 分 13 秒，1416 项中 1407 通过、9 失败，5 个 spec 失败（react-all-production-browser.log，exit 1）。失败定位及校准如下，不能将首轮记成全绿。

### 2026-11-09 全量生产扫描的测试校准

- RichTextEditor / Sender 的五个文档用例使用相对 /react/components 路径，实际打开了浏览器测试页服务的 SPA 回退。现改用与其他文档 spec 相同的文档站地址，本轮仍由 ignored support 映射至独立 5195。RichTextEditor 的另一项要求生产模式也挂载插件两次；夹具增加 Vite 构建模式标记，断言开发态严格为两次挂载/一次清理，生产态严格为一次挂载/零次清理，真实卸载仍检查清理数等于挂载数，没有改编辑器实现。
- Tree 键盘夹具把原始节点数组写在每次 render 中，异步 loader 更新计数时替换了同 key 的 raw node，触发 Core 已有的旧请求失效规则。核对 tree-model 的 replacement-node 回归后，仅让夹具按 removed 状态 memoize 数据，不削弱 Core 的节点身份保护；六项键盘用例均重新验证。
- 真实上传接收器只允许旧 5190/5191 Origin，新生产 5193 与源码 5194 的预检因此被拒绝。测试服务明确允许既有入口 5187、5190、5191 及本轮 5193、5194；没有使用通配 Origin。实际 OPTIONS 校验两个新来源允许、外部来源无 CORS 允许头。原先仅看 error UI 的 HTTP 失败用例可能被 CORS 误判通过，新增对真实 POST 响应 500 的只读拦截断言；没有 mock 响应或改 Upload 实现。核对 PID/脚本身份后重启 workspace 的 serve-upload-test.ts，原有 5187/5188 页面服务未操作。
- 原失败五组共 23 项，在源码和独立重建的生产页面分别 23/23、exit 0（react-all-calibration-source.log / react-all-calibration-production.log），涵盖真实 multipart 字段/头/响应、HTTP 500、进行中取消及后续服务器释放。React 四段类型、上传接收器独立 TNB 类型、定向 lint/格式、源码门禁和 diff 检查通过。全部 103 个测试 HTML 已按最新夹具再次生产构建通过（react-all-pages-build-certified.log）。
- 第二轮完整 146 spec 生产回归已收齐：16 分 34 秒，1415/1416，唯一失败是 components-07 的嵌套 Popover 交互后 scrollY 增加 1px（react-all-production-browser-certified.log，exit 1）。上一轮的九项校准均在本轮通过；不能将这一轮记成一次全绿。滚动问题的独立复现和修正见下节。
- 下一阶段的入口兼容盘点另存 .local/markdown-upstream-export-audit.json：Vue upstream 清单有 279 个名称，93 个在 React 引擎存在同名导出，121 个可在已安装 parser 找到同名导出，另有 Core 候选；同名不代表语义已验证，不能直接星号转发后宣布 1:1。公开 Markdown 入口/子路径/文档、重型异步与剩余嵌套合同、历史源码加载间歇、SSR 嵌套警告，以及全部组件的跨浏览器验收仍待完成，goal active。

### 2026-11-09 嵌套浮层滚动基准校准

- 第二轮唯一失败的独立生产复现为 8/12；保留原始帧、focus 和滚动轨迹（react-popover-scroll-debug.log / react-popover-scroll-*.json）。失败时基准 scrollY 为 15422、文档高度为 20474，随后二者分别变成 15423、20475；变化发生在子按钮 focus 之前，字体已经 loaded，focus 调用也使用 preventScroll。
- 增加真实 ResizeObserver 采样后定位到上方共享 Menu 夹具的初始展开：menu-basic 从 184px 到 272px，menu-dynamic 从 52px 到 96px，共增加 132px；最后一帧使基准采样之后仍有不足 1px 的布局变化，Chrome 的滚动锚定调整了 scrollY（react-popover-observed-*.json）。没有改 Popover / Menu 实现，也没有把精确滚动断言改成容差。
- 仅为该用例先等两个已展开的菜单 inline-content 清除过渡 height，再打开父浮层并记录基准；没有固定 sleep。相同长页面独立 12/12，通过且十二份前后采样的文档高度、scrollY 都相同（react-popover-ready.log / react-popover-ready-*.json）。正式 components-07 全部四十项在生产 40/40、源码 40/40，均 exit 0（react-popover-regression-production.log / react-popover-regression-source.log）。原来的全量失败日志保留；以上是有因果定位的定向验收，未另跑第三轮全量。

### 2026-11-09 Markdown 阈值与安全帧工具共享

- 新增 Core markdown/katex-threshold 和 markdown/safe-raf，承接 recommendWorkerThreshold、estimateRByFormula、defaultRByClass、recommendNForSamples、safeRaf、safeCancelRaf，以及 ThresholdInput 类型。Vue 根 upstream 清单与两个 compat/utils 旧深入口改为同一 Core 绑定；React 新增内部 upstream 清单，当前只接这六个函数和一个类型，仍未开放完整 Markdown 公共入口。没有新增依赖。
- 对照锁定 markstream-vue 2.0.18 的实际独立工具模块，检查公式长度/反斜杠边界、UTF-16 长度、零/负预算、缓存极值与 NaN/Infinity，以及原生 RAF 优先、缺失/抛错时的定时器回退、null/零句柄和真实 Node 定时器取消。初稿单反斜杠计数转义错误被对照抓出，首轮 2/3；修正后 3/3，失败日志另存（react-markdown-utils-core-oracle-before.log / react-markdown-utils-core-oracle-final.log）。保留上游 safeRaf 的 any 句柄签名，以免改变浏览器/Node 公共类型契约，仅为这一行设置有说明的 no-explicit-any 例外。
- Core 全量 1632/1632、exit 0（react-markdown-utils-core-full.log）；新增 Vue 根/深入口共享绑定及真实浏览器 RAF/取消验证 8/8、exit 0（react-markdown-utils-vue-browser.log）。实际编译的 React 内部桥接模块通过 Node ESM 导入、六个函数身份及真实定时器取消自检（react-markdown-utils-react-smoke.log）。这些检查不代表剩余上游注册表、加载器、工作线程或虚拟时间线已经实现。
- React 构建与四段类型、实际 Vue 类型、文档 Vue 类型、Vue 主 ESM 与声明构建通过。三个包实际 pack 并核对 Core 两模块 JS/声明、Vue 根与兼容深入口声明、React 内部桥接 JS；ThresholdInput 也指向 Core（react-markdown-utils-_-pack_.log）。定向 lint、工具源码格式、源码门禁、diff 检查和 graphify update 通过；graphify 原有 104 个 source_file 警告与拓扑未变化提示仍在。没有执行图标再生成或完整发布任务。
- README / QUICK-START / ARCHITECTURE 与第三方说明已同步，也修正旧 2.0.13 版本描述和 README 中不存在的兼容清单链接。文档 vendor 已实际重建同步，随后完整 Astro 构建 213 页通过、exit 0（react-markdown-utils-docs-vendor.log / react-markdown-utils-docs-build.log）。本轮所有 Chrome 进程已收齐；自建 5192/5193/5194/5195 测试服务已停止，原有 5187/5188 服务未操作。未提交、推送或发布；全部 100 组目标保持不变，goal active。

### 2026-11-09 CDN Worker API 与真实引擎验证

- Core 新增 KaTeX / Mermaid CDN Worker 的四个源码生成/工厂函数、六个原生类型，以及共享 Blob URL 生命周期；Vue 根与 compat/workers 旧深入口、React 内部 upstream 模块转发同一实现。保留默认模式、JSON 编码、配置覆盖、SSR 空句柄、debug 消息、构造失败回收及幂等 dispose。dispose 不 terminate，Worker 仍归调用方。React 类型用例将十个函数/类型签名逐项与锁定原生声明比较，TNB 四段类型检查通过。
- 对照 markstream-vue 2.0.18 的四项 Core 测试通过（react-markdown-cdn-core-oracle.log）。KaTeX 源码逐字节一致；Mermaid 除下述首次导入等待外逐字节一致，工厂边界矩阵保留此单一差异后比较真实调用顺序。Core 全量 1636/1636、exit 0（react-markdown-cdn-core-full.log）。这些边界测试本身不代表真实 Worker 或引擎验证。
- 浏览器页面实际加载文档依赖中的 KaTeX 0.19.0 / Mermaid 12.1.0，经 React 原生 worker 客户端完成计算。classic Mermaid 仅将真实 IIFE 的命名空间映射为其 CDN global，没有替换解析器。第一轮因 spec 引入 React 时缺少 process，在执行用例前失败；将运行时 API 放入真实页面后进入六项测试，首次 5/6（react-markdown-cdn-browser-first.log / react-markdown-cdn-browser-second.log）。
- 真实 Mermaid module 首个请求复现上游冷启动竞态：listener 已注册而异步 import 尚未完成，回复 Mermaid is not available in worker。共享源码现在在处理请求前 await loadMermaid；同一 loadPromise 合并并发等待，加载失败仍按原协议回传。module 回归额外以 200ms 延迟加载真实引擎稳定覆盖该窗口，没有重试解析请求、就绪等待或宽松断言。源码与真实生产 bundle 各 6/6、exit 0（react-markdown-cdn-browser-source.log / react-markdown-cdn-browser-production.log），覆盖两模式真实公式/化学式渲染、错误公式、Mermaid 解析/前缀恢复、未知 action、真实缺失资源错误与请求身份。
- Vue 根/旧深入口浏览器回归 9/9、exit 0（react-markdown-cdn-vue-browser.log）；实际 Vue 类型、主 ESM/声明、React 构建与四段类型、脚本类型、文档 Vue/React 类型、定向 lint、源码门禁与 diff 检查通过。三个包实际 pack 并核对新增 JS/声明与 Vue 兼容深路径。测试静态服务通过真实健康身份、方法/CORS、编码路径越界与缺失资源自检（react-markdown-cdn-assets-check.log）。
- README / QUICK-START / ARCHITECTURE 与第三方说明同步，文档 vendor 实际重建，Astro 213 页构建通过（react-markdown-cdn-docs-build-final.log）；pnpm exec 未找到 astro 的尝试保留，随后直接运行安装的 Astro CLI。更新后的清单仍为 279 项，React 私有桥接从 7 项增至 17 项；这不表示公共 Markdown 根/子路径/文档已交付，更不表示其余组件行为完成。完整 Vue 套件、其他浏览器、外部 CDN/CSP 及完整发布未验证；全部 100 组目标与 goal active 保持不变。

### 2026-11-09 KaTeX 客户端状态与取消合同

- 锁定 React SDK 缺少 Vue 的 getKaTeXWorkerLoad / isKaTeXWorkerBusy / setKaTeXWorkerMaxConcurrency；clearKaTeXWorker 只 terminate，没有拒绝或清理 pending。依赖补丁通过已有 sd-internals 暴露原客户端状态与 setter 别名，React 内部 upstream 直接转发，不创建第二个注册表。三个声明签名与原生 Vue 声明逐项 IsEqual，四段 TNB 类型通过。
- 同一补丁同步 Vue 队列合同：取消只拒绝调用方，实际计算仍占槽直至回复或超时；迟到成功仍写缓存；clear/error 清除定时器和 abort listener、拒绝未取消请求并唤醒全部等待者；容量唤醒、无效并发设置和等待超时错误元数据对齐。保留原 React clearKaTeXCache 和渲染组件的同一客户端绑定；KaTeX loader 开关尚未适配。
- 使用真实 SDK 的协议边界对照共七项（与锁定 Vue 客户端逐项比较），覆盖负载快照、忙碌元数据、归一化缓存、取消后的在途统计、回包写缓存、零等待/超时/预取消、postMessage 抛错、clear/error 清理、容量和背压重试。等待者测试初稿未先排空注册时的 microtask，与原生实际唤醒行为不符；修正夹具时序后通过，未改变原生唤醒策略。
- 初版 clear 回归只等待两次 microtask，不足以证明异步 Promise 已结算，修正为等待一个事件循环轮次。随后用 Node load hook 仅恢复保存的旧 KaTeX 客户端源码，并保留新观察入口，让正式回归对旧实现稳定失败（react-markdown-worker-client-before-certified.log）；当前实现通过，不能把初版微任务断言失败单独当作修复证据。
- React 包全量 343/343、exit 0（含七项新测试，react-markdown-worker-client-full.log）。源码与真实生产 bundle 各 38/38、exit 0，覆盖 CDN Worker 8 项、SD 节点 10 项、根渲染器 8 项和视口 12 项（react-markdown-worker-browser-source.log / react-markdown-worker-browser-production.log）。新增真实 Worker 用例确认取消后负载保持、实际回包后归零与缓存可用，以及 clear 立即拒绝挂起渲染；渲染由原 SDK 根入口调用，观测经内部桥接读取，证明两者使用同一状态。
- pnpm patch-commit 更新既有补丁及锁文件，随后 frozen-lockfile / ignore-scripts 安装通过（react-markdown-worker-frozen-install.log），没有添加依赖。README / QUICK-START / ARCHITECTURE / patches README 与第三方说明同步；源码门禁、定向 lint/格式、声明、构建与 pack 通过，包内桥接指向 SDK 私有入口。Astro 213 页构建通过（react-markdown-worker-docs-build.log）。清单仍为 279 项，私有桥接已接入 20 项；公共 Markdown 入口、其余运行时 API、全部组件的完整行为验收与其他浏览器仍未完成，goal 保持 active。

### 2026-11-09 KaTeX 加载器与实际数学节点

- React SDK 只有内部固定 getKatex，缺少 Vue 的 setKatexLoader / enableKatex / disableKatex / isKatexEnabled 及 KatexLoader；新增回归在旧版本因函数缺失失败（react-katex-loader-before.log）。依赖补丁接入原数学节点 getter，SD 内部 upstream 转发上述四个控制函数和类型；SDK 内部 getter 只在私有桥接中提供，不计作 Vue 公共 API。五个声明签名与锁定 Vue 逐项 IsEqual，TNB 四段类型通过。
- Loader 状态沿用锁定 Vue 规则：global 优先、同步/异步归一化、并发 single-flight、失败/空结果仅尝试一次、重设后允许重试、旧 Promise 结果失效。默认 loader 加载真实 katex 并容忍可选 mhchem 导入失败；自定义 loader 不会自动添加扩展。Worker 的直接和背压渲染在读取缓存前检查同一 enabled 状态，禁用时返回 KaTeXDisabled / KATEX_DISABLED，不能用缓存绕过开关。
- 加载器五项和前轮队列七项对照通过（react-katex-loader-oracle.log）；React 包全量 348/348、exit 0（react-katex-loader-full.log）。对照加载器 getter 使用锁定 Vue chunk 中经根导出映射核实的真实绑定，包含并发与重置时序；不是独立模拟的 Vue 实现。
- 浏览器通过本地 MarkdownRenderer 挂载真实行内和块级数学节点。自定义 loader 动态导入已安装的 KaTeX 0.19.0，两个节点共用一次加载；禁用后按原行为显示源码，重新启用后恢复真实公式。源码和生产同组回归各 39/39、exit 0，覆盖 Worker、节点、根渲染器与视口（react-katex-loader-browser-source.log / react-katex-loader-browser-production.log）。
- 追加默认 loader 用例后，源码与生产 Worker/数学组各 10/10、exit 0（react-katex-loader-default-browser-source.log / react-katex-loader-default-browser-production.log）：disable 后无参数 enable，真实默认 KaTeX 与 mhchem 成功渲染化学式和平方根。实际解析 SDK 的 pnpm 链接核实存在 katex peer；生产构建也包含真实 katex / mhchem chunk。没有将首次基于相对链接的错误 Test-Path 结果当作缺失依赖证据。
- 冻结锁文件安装、定向 lint/格式、源码门禁、React 构建与 pack 通过；包内 JS/声明转发原 SDK 私有入口。README / QUICK-START / ARCHITECTURE / patches README 和第三方说明同步，Astro 213 页构建通过（react-katex-loader-docs-build.log）。清单仍为 279 项，私有桥接已接入 25 项；Mermaid / Infographic loader 等运行时 API、完整 Markdown 公共入口及所有组件完整行为验收尚未完成，其他浏览器和外部 CDN/CSP 未验证。goal 保持 active。

### 2026-11-09 Mermaid 加载器与实际 SVG 渲染

- SDK 补齐 setMermaidLoader / enableMermaid / disableMermaid / isMermaidEnabled、MermaidLoader 与 MERMAID_DISABLED_CODE，由 SD 内部 upstream 转发。旧版本六项新增测试因 API 缺失失败（react-mermaid-loader-before.log）。原图表节点与 Worker action 复用同一 registry；没有新增一个仅供测试读取的状态。六个声明签名与锁定 Vue 逐项 IsEqual，四段 TNB 类型通过。
- Loader 归一化、嵌套 mermaidAPI receiver、initialize 的 suppressErrorRendering 默认值、global/缓存优先级、single-flight、重设 epoch 与自定义失败传播按真实锁定 Vue chunk 对照。原图表 getter 保留源码降级，私有 raw getter 保留自定义异常传播。两个 Worker action 在初始化错误/队列访问之前检查 enabled，返回 MermaidDisabled / MERMAID_DISABLED。Mermaid 的失败策略与 KaTeX 不同，没有共用不符合合同的泛化 loader。
- 最终七项对照通过（react-mermaid-loader-oracle-final.log）；新增模块解析故障注入，真实阻断 mermaid import，确认默认缺失依赖只警告/尝试一次，重新 enable 后可再尝试。React 全量 355/355、exit 0（react-mermaid-loader-full-final.log）。这些协议/状态检查本身不代表图表交互已经完整验收。
- 页面通过本地 MarkdownRenderer 实际加载 Mermaid 12.1.0 并生成 SVG，覆盖自定义 loader、禁用后的源码视图、重新启用恢复、拒绝 loader 后重设恢复和安装的默认引擎。首轮 11/13 的两项失败来自断言将按钮图标 SVG 当作图表；已限定到真实 ._mermaid 容器，保留原 SVG 文本与源码断言。修正命令一度因 cwd 路径错误未执行，随即停止该无效重跑；没有据它声明实现已修复。保留首轮日志（react-mermaid-loader-browser-source.log）。
- 源码与真实生产 bundle 四组各 43/43、exit 0（react-mermaid-loader-browser-source-certified.log / react-mermaid-loader-browser-production.log）：Worker/引擎 13、SD 节点 10、根渲染器 8、视口 12。定向 lint/格式、源码门禁、冻结锁文件安装、React 构建/pack 通过；包内六个 API/类型转发经核对。README / QUICK-START / ARCHITECTURE / patches README / 第三方说明同步，Astro 213 页构建通过（react-mermaid-loader-docs-build.log）。
- 清单仍为 279 项，内部桥接已接入 31 项；Infographic loader、其余注册表/运行时 API、Mermaid 全部交互/事件细节、完整公共入口与全部组件行为验收仍未完成。依赖补丁当前由仓库的 pnpm 安装应用；pack 文件存在不证明独立消费端可安装使用，私有 SDK 桥接的独立安装/发布交付仍需专门验证并处理。没有发布或推送；其他浏览器与外部 CDN/CSP 未验证，goal 保持 active。

### 2026-11-09 独立安装与 SDK 运行时交付

- 在 D:/Temp/sd-design-react-consumer-20261109 建立仓库外消费者，使用实际 React / Core tarball，未配置 SDK 补丁。首个离线安装因元数据缺失失败；在线解析又确认 Core 7.8.1 在 registry 不可用，因此仅将本地 Core tarball 加入 override 来模拟同版本共同交付。随后导入包内 Markdown 桥接真实失败：ERR_PACKAGE_PATH_NOT_EXPORTED，公开 SDK 没有 sd-internals（react-portable-consumer-probe-before.log）。这证明前轮仓库内 pack 检查不足以支持可独立使用的结论。
- 试验标准 bundledDependencies 后 pnpm 明确拒绝 isolated nodeLinker（react-portable-bundled-pack.log）。已撤销该字段，未更改工作区 nodeLinker。最终 build / prepack 通过受限的生成目录复制锁定修补 SDK 的 dist、原包元数据与第三方说明，并将本包 JS / 声明的 SDK 导入改为相对入口。SDK 转为开发依赖；其四个既有依赖显式声明，可选引擎保留 peer 合同。重建只删除经绝对路径检查的私有生成目录，保留其他 dist 内容。
- 独立安装后的私有控制 API、共享 enabled 状态、SD Markdown SSR、公共根 Button SSR 与 NodeNext 类型检查通过（react-portable-consumer-probe-final.log / react-portable-consumer-types-final.log）。消费者不需要 SDK 补丁或 postinstall 修补，检查使用仓库锁定 Node / pnpm；早期外部目录默认 Node22 / pnpm11 的复现不混作最终工具链验收。发布 registry 安装尚未进行，Core 仍是本地联合交付替代。
- 真实浏览器第一次 0/2 暴露另一交付缺陷：SCSS 中原 SDK CSS 包名导入被重定位后不可解析，页面脚本没有完成加载（react-portable-consumer-browser.log / react-portable-consumer-server.log）。已把原 SDK CSS 随包复制为 styles/markdown-render/vendor.css，并从本地 layer 入口导入；仅此第三方生成文件排除格式和 stylelint。独立安装包的 dev 与真实 production bundle 各 2/2、exit 0（react-portable-consumer-browser-final.log / react-portable-consumer-browser-production.log），覆盖 SD 标题、默认 KaTeX/mhchem、Mermaid SVG、禁用源码降级、错误码与重新启用，不依赖仓库源码别名。
- 新增两项正式包级回归：编译输出的 SDK 导入与声明、包内状态绑定，以及和原上游 global component store 的订阅/释放。一次测试强化中误将 CSS class 字符串 markstream-react 当成包导入，导致 356/357；已改用 TNB 的模块预处理接口检查真实 import，未改动产品 class。最终全量 React 357/357、exit 0（react-portable-full-certified.log），两项包级回归单独通过（react-portable-runtime-test-final.log）。这不证明外部另装 SDK 的模块级 Worker/loader 状态互通。
- React 四段类型、脚本类型、定向 lint / stylelint / 格式、源码门禁、冻结锁文件安装、build / prepack / pack 通过。README / QUICK-START / ARCHITECTURE 和第三方说明同步，Astro 213 页构建通过（react-portable-docs-build.log）。清单仍 279 项 / 私有桥接 31 项；完整 Markdown 公共入口、外部 SDK 模块级配置互通、其余组件与运行时的完整合同仍需继续验收。未发布、提交或推送，goal active。

### 2026-11-09 Infographic opt-in 与实际节点降级

- 对照 Vue 2.0.18 确认 Infographic 默认关闭，enableInfographic 必须有函数参数，setInfographicLoader 可省略或传 null 清除；React 原 SDK 会自动 import 引擎。现通过同一私有桥接补齐四个控制函数与递归 InfographicLoader 类型，原节点 getter 使用该 registry，不保留自动导入或 global 引擎兜底。旧版本五项测试因 API 缺失失败（react-infographic-loader-before.log）；五个类型/函数签名与 Vue 声明 IsEqual，另有无参数 enable 的负向类型断言。
- 五项真实 Vue getter 对照通过（react-infographic-loader-oracle.log）：构造器/namespace 归一化、无效模块的重试、enable 参数验证及保留旧状态、缓存、并发合并、同步/异步失败传播与重试、旧加载结果失效，以及读取模块 getter 过程中重设 loader 后的二次 epoch 校验。首次局部源码替换误删分号被 node --check 抓出，修正并重新生成补丁后才继续浏览器验证（react-infographic-loader-syntax-before.log）。
- 首轮真实引擎组 15/15，但扩大回归后出现源码 44/45、生产 43/45，不能将首轮绿灯视为完整行为证据。实际节点在禁用后仍以预览模式开始，异步进入红色错误面板；检查锁定 Vue 节点确认禁用初始为源码、预览按钮不可用。已对齐初始模式及按钮 guard。另确认已启用 loader 失败时原生行为是错误预览加源码切换，已纠正过宽的“所有加载失败直接显示源码”断言。错误对象也改为由 AUT 的 Error 构造器创建，避免 Cypress realm 差异将消息变为 Unknown error（早期 14/16 日志不作为产品缺陷证据）。
- 随后正式用例在旧错误显示逻辑稳定复现 HTML 元素注入：错误字符串中的 img 实际进入 DOM，结果 15/16（react-infographic-loader-error-html-certified-before.log）。React 错误显示现以 textContent 写入同样样式的 div，保留错误状态及源码切换。回归检查字面消息、无注入元素、无事件执行；此项是有意安全修复，不复制上游 raw innerHTML 行为。没有宣称 Vue 侧该原生行为已经修复。
- 最终源码与真实生产四组各 46/46、exit 0（react-infographic-loader-browser-source-final.log / react-infographic-loader-browser-production-final.log）：Worker/引擎 16、SD 节点 10、根渲染器 8、视口 12。Infographic 使用已安装 AntV 0.2.20，实际 SVG 含两条预期标签，覆盖默认关闭、显式启用、禁用、错误预览/源码切换和重设恢复，没有用假渲染器替代。React 全量 362/362、exit 0（react-infographic-loader-full-final.log），包级回归亦核对编译后控制 API 与交付 getter 的同一状态。
- 新 tarball 在仓库外消费者安装，无 SDK 补丁配置；提供真实 AntV 引擎后构建并运行生产浏览器 3/3、exit 0（react-infographic-consumer-browser-production.log），覆盖本次 opt-in、SVG、错误文本安全，以及既有 KaTeX / Mermaid。consumer 仍用本地 Core 联合交付 override，不代表 registry 发布验收。类型、定向 lint/格式、源码门禁、冻结锁文件安装、build/prepack/pack 通过，文档 213 页构建通过（react-infographic-loader-docs-build.log）。README / QUICK-START / ARCHITECTURE / patch 及第三方说明同步。
- 清单仍为 279 项，私有桥接增至 36 项。完整公共入口、其余运行时/注册表、图表完整交互/事件、SSR/水合细节、外部 SDK 模块级配置互通及所有组件完整行为仍需验收；其他浏览器、外部 CDN/CSP 未验证。全部 100 组目标不变，未发布/提交/推送，goal active。

### 2026-11-09 显式解析器与上游组件清单

- 重新按真实符号种类分类，不能将解析器 CodeBlockNode AST 类型误作同名组件值。Core markdown/parser 显式转发锁定解析器运行时及相关类型；React 内部 upstream 明确列出匹配的 SDK 原生组件、工具和 props 类型，并保留 UpstreamMarkdownRender、MarkstreamTooltip 与内部原生 default。没有用星号导出放行未来新符号；框架/运行时缺口仍保留待适配。
- 声明全对照初稿抓出 CustomComponents 同名差异：Vue 是可选组件映射，解析器则是必填 unknown AST 表。已将 React 兼容项映射至 SDK CustomComponentMap，Core parser 保留原解析器类型；新增可赋值与拒绝数字条目的类型用例。最终 86 项纯解析器签名和类型逐项 IsEqual 通过，转发 NodeRendererProps 保持强类型并拒绝数字 content（react-markdown-manifest-types-browser-final.log）。SmoothMarkdownStreamController 等同名框架类型未直接冒充 Core 控制器。
- 新增五项实际绑定/状态测试：Core 全部运行时导出与 parser 原绑定一致；插件影响解析并可清除；兼容项与对应 SDK 原组件/工具身份一致；HTML policy / sanitizer 可用；经 facade 注册的插件影响真实 SD Markdown SSR。Core 全量 1638/1638、React 全量 365/365、exit 0（react-markdown-manifest-core-full.log / react-markdown-manifest-react-full.log）。源码/生产各 27/27、exit 0，覆盖引擎/Worker 17、注册表 2、根渲染器 8（react-markdown-manifest-browser-source.log / react-markdown-manifest-browser-production.log）；新增浏览器用例检查插件配置与实际 SD 标题以及清除后的新实例。
- 运行时配置共享的是解析器依赖模块与全局注册表，不要求不同 msgId 的 MarkdownIt 对象相同。SDK 透明转发仍需继续验收各自语义，组件/工具身份检查不能替代完整交互、事件、实例方法或 hook 合同检查。
- 实际 Core / React tarball 联合安装到仓库外消费者，更新本地 Core override，不配置 SDK 补丁；NodeNext 声明、SSR、生产构建通过，生产浏览器 4/4、exit 0（react-markdown-manifest-consumer-types.log / react-markdown-manifest-consumer-probe.log / react-markdown-manifest-consumer-browser-production.log）。消费端通过交付 facade 注册/清除插件并检查实际 SD 标题变化，同时保留真实 KaTeX、Mermaid、Infographic 和错误安全检查。仍不是 registry 发布验收。
- 定向 lint/格式、源码门禁、冻结锁文件安装、build/prepack/pack 通过，README / QUICK-START / ARCHITECTURE / Core 第三方说明同步；Astro 213 页构建通过（react-markdown-manifest-docs-build.log）。清单匹配从 36 增至 218/279；61 项未匹配与已转发项的完整合同均仍需处理。完整 Markdown 公共入口、其他组件完整验收、外部 SDK 配置互通及其他浏览器仍未完成，全部 100 组目标及 goal active 保持不变，未提交/推送/发布。

### 2026-11-09 语言图标主题与订阅

- 按锁定 Vue 对照主题注册/切换、resolver 优先级、core/extended/fallback、异步扩展 single-flight、失败缓存、加载期间切换、receiver 及语言标签别名。沿用 SDK 现有图标资源，新增私有主题桥接与 IconTheme；React revision 提供可读写 value 和原订阅接口，不伪造 Vue shallowRef。6/6 原生差分与订阅测试通过（react-icon-theme-oracle-final.log），4 组类型检查通过（react-icon-theme-types-final.log）。
- 真实浏览器首次 20/21：SDK 标题在父 layout effect 切换主题、子 passive effect 订阅前漏掉通知，保留旧图标（react-icon-theme-browser-before.log）。SDK 和 SD 标题改为 useSyncExternalStore 读取修订快照。新增两种标题的实时切换、异步扩展和挂载间切换；源码与 production 各 44/44（CDN/引擎/图标 23、pre 11、root 8、registry 2），exit 0（react-icon-theme-browser-source.log / react-icon-theme-browser-production.log）。这次修复有确定复现，不能仅以重跑通过认定。
- React 全量 371/371，exit 0（react-icon-theme-full.log）。生产 tarball 在仓库外消费者无 SDK 补丁安装，NodeNext 类型、SSR、生产构建通过，浏览器 5/5（react-icon-theme-consumer-types.log / react-icon-theme-consumer-probe.log / react-icon-theme-consumer-build.log / react-icon-theme-consumer-browser.log），含实际代码标题图标切换及原引擎/插件用例。仍使用本地 Core tarball override，不是 registry 发布验收。
- 显式清单 223/279，尚有 56 项未映射；已转发项仍需完整语义验收。graphify update 完成但保留既有 104 项 source_file 警告，不作为覆盖证据。所有 100 组目标不变；全局全组件/文档完整回归、其他浏览器、外部 SDK 模块级状态互通尚未完成。未提交/推送/发布，goal active。
- 收尾门禁：冻结锁文件安装、定向 lint、格式与 diff 检查通过；完整 Astro 文档构建 213 页通过（react-icon-theme-docs-build.log）。已停止本轮自建测试服务，保留用户原 5187/5188 服务。

### 2026-11-09 代码块运行时与共享 diff Worker 池

- 补齐 set/get/clear/terminateStreamDiffsWorkerPool、syncStreamDiffsWorkerTheme、preloadCodeBlockRuntime、isCodeBlockRuntimeReady 与 StreamDiffsWorkerPoolLike。原 SDK code renderer 的 workerManager 采用单块配置优先、共享池回退；创建编辑器和应用主题前同步共享池，themes 成对时传 dark/light 对。没有创建脱离实际代码渲染路径的独立运行时。入口清单 231/279，仍有 48 项未映射（react-diffs-export-audit.log）。
- 新增 6 项测试；未实现时 0/5（react-diffs-before.log）。Native Vue 对照注册身份、clear 与 terminate、receiver、同步/异步失败和 getter 边界；Node module hooks 注入 import 缺失、无效模块和 preload 失败，验证 single-flight、重试、可选 preloader 与 ready 时机。实际安装 stream-diffs 0.0.2 预加载也通过（react-diffs-oracle-final.log）。8 项同名类型/函数签名 IsEqual 与四组类型检查通过（react-diffs-types-final.log）。
- 真实浏览器用 stream-diffs 0.0.2 + @pierre/diffs 1.6.2 和实际 module Worker，检查真实 file/diff success 消息、可见 Shadow DOM、共享主题同步、单块池覆盖、clear 不终止及 SD wrapper 的同份 readiness。第一次新增 SD 用例因 Vite 关闭 watch 保留旧 fixture，报 renderSD 不存在（react-diffs-browser-source.log）；重启 fixture server 后新代码加载，不把该重跑视作产品缺陷修复。最终源码与生产各 48/48，exit 0（diffs 4、CDN/图标/引擎 23、pre 11、root 8、registry 2；react-diffs-browser-source-release.log / react-diffs-browser-production-release.log）。
- React 全量 377/377，exit 0（react-diffs-full-release.log）。最终 tarball 在仓库外消费者无 SDK 补丁安装：无可选引擎时 preload false/ready false（react-diffs-consumer-missing.log）；安装真实引擎后 preload true/ready true（react-diffs-consumer-runtime-final.log）。NodeNext 类型、SSR、生产构建通过（react-diffs-consumer-types-release.log / react-diffs-consumer-probe-final.log / react-diffs-consumer-build-final.log），生产浏览器 6/6 包含安装包 SD wrapper 的实际 Worker 高亮（react-diffs-consumer-browser-release.log）。消费者仍用本地 Core tarball override，不是 registry 发布验收。
- 预加载成功标志同时作为 readiness，避免重复状态。冻结锁安装、定向 lint/格式/diff、build/prepack/pack 通过，README / QUICK-START / ARCHITECTURE / 第三方说明同步；Astro 文档 213 页构建通过（react-diffs-docs-build.log）。graphify update 保留既有 104 项 source_file 警告。全 100 组目标保持；尚未完成完整公共入口、其他上游合同、全组件 API 核对、完整多轮/其他浏览器与外部 SDK 模块级状态互通。未提交/推送/发布，goal active。
- 已启动全部 React 浏览器 spec 的源码回归：148 个 spec，日志 react-all-after-diffs-source.log，进程会话 17535；仍在运行，不计为通过。使用本轮源码服务 5194 / 会话 41710、引擎资源服务 5197 / 会话 54300，需待回归结束再停止；用户原文档 5188 已验证页面标题为 Button 按钮（React） | SD Design，未操作原 5187/5188 进程。
- 重新生成当前 Vue dts 后完成只读 API 名称扫描（react-all-vue-dts-current.log / react-all-public-props-current.log / react-all-public-audit-summary.log）。214 个导出组件含上游 Markdown 子组件；173 项可解析，41 项 Markdown 公共入口及上游子组件因尚未公开而 unresolved。该脚本是名称和 ref 方法扫描，会包含 modelValue/value、class/className、大小写和 Vue 生命周期差异，不作为全部语义完成证据。后续需逐项映射和实际行为核验。

### 2026-11-09 手动性能监控与已有虚拟化类型（浏览器验收待执行）

- 检查锁定 Vue 的 performance-monitor 模块及全部运行时代码：monitor 是手动 recordRender 工具，没有数学渲染自动记录连接。Core 新增共享 monitor，保留样本身份、成功/失败分类、cache hit 统计、推荐阈值、数字/字符串报告形状、1000 条历史、reset/disable 区别、浅拷贝导出及 console grouping；React 薄适配注册 __katexPerfMonitor / __katexPerfReport，SSR 不访问 window，并将源/产物适配模块列入 sideEffects。
- 新增 Core 原生差分 6 项，缺失时导入失败（react-perf-before.log），实现后 6/6（react-perf-oracle.log）；Core 全量 1644/1644，React 全量 378/378，exit 0（react-perf-core-full.log / react-perf-react-full.log）。React 新测试验证服务器导入与 Core singleton/控制函数 identity。
- 显式导出已有的 11 项 Core 虚拟化缓存/指标/状态/renderer handle 类型及 mode/domMode/typewriter 三个别名；不为导出另造控制器。14 项逐一 IsEqual 与锁定 Vue 一致，monitor 的公开方法形状及三个函数签名也对照通过；四组类型检查通过（react-perf-types.log）。清单匹配 249/279，仍有 30 项未映射（react-perf-export-audit.log），不能据此判定已映射项完整合同通过。
- Core / React build、pack、冻结锁、定向 lint/格式通过。新 tarball 在仓库外消费者无 SDK 补丁安装，Core override 同步到新 tarball；NodeNext 类型、SSR 同一 monitor 实例及生产 bundle 构建通过（react-perf-consumer-types.log / react-perf-consumer-probe.log / react-perf-consumer-build.log）。尚未执行新 monitor 的浏览器测试；源码新增 markdown-performance.cy.ts 两项、独立消费端新增一项，需在当前 Chrome 批次结束后执行源码/生产和安装包浏览器测试，尤其检查 tree shaking 后的 window debugger helpers。消费端仍非 registry 发布验收。
- 全组件 post-diffs 源码回归进程 17535 仍存活，日志 react-all-after-diffs-source.log，目前第 34/148 spec，未得出全量结论；选中的 148 项在新增 monitor fixture 之前生成，不包含新 fixture。新增 API 不自动修改渲染行为，需独立验收，不拿当前基线批次充作新功能证据。服务 5194/41710 与 5197/54300 继续保留，回归结束后再停止；用户原 5187/5188 不动。Astro build 会话 92328、日志 react-perf-docs-build.log 仍需获取最终退出状态。
- 继续保留的实际缺口已写 .local/react-markdown-next-gaps.md：原 React SDK CodeBlockNode 忽略 explicit theme，而 Vue 支持；React virtualScroll 类型缺少 enabled/sessionKey 与 heightCache/heightCacheWidth 的约束。后续需真实复现及同步行为/类型测试，不能用名称转发绕过。全部 100 组目标、公共入口、上游节点合同、完整多轮/跨浏览器及外部 SDK 状态互通仍待验收。未提交/推送/发布，goal active。
- 文档构建已完成：会话 92328 exit 0，Astro 213 页通过（react-perf-docs-build.log）。全组件浏览器会话 17535 继续运行；新增 monitor 浏览器验收仍待该批次结束。

### 2026-11-09 虚拟滚动配置与滚动根类型（浏览器验收待执行）

- 已用类型红灯复现：enabled true / 动态 boolean 不带 sessionKey、heightCache 不带 heightCacheWidth 原先被接受（Unused @ts-expect-error），而 undefined React ref 被错误拒绝（react-scroll-types-before.log）。配置现按锁定 Vue 的组合/联合约束实现；React ref 用 current 并允许尚未赋值，resolver 将 undefined current 归一为 null，保留 Core 原有祖先/文档滚动根回退。
- 新增或显式导出 scroll root / ref / resolver、cache/shared/virtual scroll 选项、viewport priority 共 8 项。用 DistributedOmit 排除两框架 ref 载体差异后逐项 IsEqual，同时保留负例和合法默认/禁用/缓存/ref 用例。四组 React 类型检查、双框架文档类型检查、React 全量 378/378 通过（react-scroll-types-fixture.log / react-scroll-docs-types.log / react-scroll-react-full.log）。内部清单 257/279，仍有 22 项未映射（react-scroll-export-audit.log）。
- 实际 tarball 独立安装后的 NodeNext 正/负类型用例和 SSR 通过（react-scroll-consumer-types.log / react-scroll-consumer-probe.log）；最终 notice 包位于 .local/react-scroll-pack-final，保持本地 Core override，不是 registry 发布。源码/生产 bundle 构建与 pack、定向 lint/格式/diff 通过，README / QUICK-START / ARCHITECTURE / 第三方说明同步。新增 markdown-scroll-root.cy.ts 两例使用未赋值 ref/resolver 检查真实祖先滚动、锚点与缓存，尚未执行。必须在全量批次结束并重启 watch=null 的 5194 后验证，避免旧 fixture 缓存。监控两例及独立消费者监控一例也仍待浏览器验证。
- 全组件源码回归 17535 在 components-05 的第 4 例 beforeEach cy.visit('/') 超时 60s，截图为空白页、未触及该组件断言；该 spec 40 例为 3 passed / 1 failed / 36 skipped（react-all-after-diffs-source.log 及其 screenshots/components-05.cy.ts）。保留原始失败，当前批次继续收集其他结果；尚无根因证据，不把以后重跑通过当作修复。
- 失败后通过 CDP 附加只读网络观察，没有改页面；最初观察会话 70862 随 target 更换正常结束，现会话 7672 会跨 target 重新附加，日志 react-all-network-observer.ndjson。观察开始在原失败之后，不能据此反推原请求。待全量 17535 结束后停止 7672，记录结果并单独复验 components-05。保留源码服务 5194/41710、资源服务 5197/54300；用户原 5187/5188 不动。
- 额外通过真实 Vue/React SSR 证实显式 code-block theme 缺口：isDark=false + github-dark 时 Vue 带 is-dark 而 React 不带，isDark=true + github-light 时反之（code-theme-ssr-before.txt / code-theme-ssr-probe.log）。SDK patch 尚未改动，避免在全量运行中更换依赖；后续需先补回归，再同步 theme 优先级、声明与实际引擎表现。全部 100 组目标仍 active，未提交/推送/发布。

### 2026-11-09 用户要求撤销第三方修改

已按当前范围完成上述两项依赖补丁回滚。SD 自有实现保留，官方 SDK 不可用或与 Vue 不同的功能不再补齐。所有本轮自建测试服务已停止，用户原 5187/5188 服务未操作；目标状态为 paused。
