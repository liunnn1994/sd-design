## Context

当前 packages/sd-vue-docs 通过 scripts/migrate-docs.ts 把指南页、组件 README 和 **demo** 示例转换为 VitePress 可消费的 Markdown 与 .vue 生成文件，站点导航也从旧目录与 frontmatter 动态拼装。这个方案已经能覆盖中文文档，但维护依赖“源文件 -> 生成结果 -> 站点渲染”三段链路，导致排障和人工修订都必须理解生成脚本。

仓库中已经存在 packages/sd-vue-docs 的 Astro Starlight 起始骨架，但目前仍是模板内容，没有接入现有组件文档、示例、主题信息或根目录开发命令。此次迁移既要把旧站点内容完整搬到新站点，也要把文档维护模式切换为“最终产物就是 MDX”，从而删除 docgen 风格的中间生成逻辑。

约束如下：

- 文档仅保留简体中文，不再维护多语言目录结构。
- 迁移必须覆盖旧站点已有文档与组件页面，且需要能验证 100% 覆盖率。
- 原有主题切换能力和在线修改代码示例能力必须在 Starlight 中继续可用。
- 仓库当前的根脚本仍指向 packages/sd-vue-docs，需要同步迁移到新站点。

## Goals / Non-Goals

**Goals:**

- 将旧 VitePress 站点中的指南、组件文档、导航和示例完整迁移到 packages/sd-vue-docs。
- 提供一个可重复执行的 Node 迁移脚本，将旧文档源转换为规范化的 MDX 页面和伴随示例资源。
- 在 Starlight 中保留亮暗主题切换，并提供在线查看与修改组件示例的体验。
- 将根目录和文档包脚本切换到 Starlight 工作流，删除不再需要的 docs:prepare、docgen 和相关未使用脚本。

**Non-Goals:**

- 不在本次变更中新增英文文档或新的国际化方案。
- 不在本次变更中重写组件示例的业务逻辑或调整组件 API。
- 不要求保留旧 VitePress 主题实现或继续维护 packages/sd-vue-docs 的运行入口。

## Decisions

### 1. 使用 Node 迁移脚本一次性生成 MDX 目标文件

选择 Node 脚本作为迁移执行环境，直接读取 packages/web-vue/components 下的 README.zh-CN.md 与 **demo**/\*.md，以及 packages/sd-vue-docs/guide-source 下的中文指南，输出到 packages/sd-vue-docs/src/content/docs。脚本需要产出最终可编辑的 .mdx 文件，而不是再生成中间态供二次加工。

原因：

- 仓库已经以 Node/pnpm 为主开发环境，接入成本最低。
- 现有 migrate-docs.ts 已经证明 Node 侧可以正确解析 frontmatter、README 和 demo 文件结构。
- 最终保存为 MDX 能让后续修改直接在目标站点内容层进行，不再依赖 docs:prepare。

备选方案：

- 继续沿用 bun 脚本：可行，但没有明显收益，且仓库主命令体系仍以 Node/pnpm 为主。
- 使用 Python 做迁移：解析能力足够，但会引入额外维护语言，不利于团队后续修改。

### 2. 目标内容结构以 Starlight 文档集合为中心，保留中文信息架构

迁移后的内容统一放入 packages/sd-vue-docs/src/content/docs，按 guides、components 两大分区组织。每个组件目录保留独立 index.mdx 页面，页面 frontmatter 直接声明标题、描述、sidebar 信息和必要元数据。组件总览页、指南页、首页导航由迁移脚本根据现有 frontmatter 与分类信息生成，但生成结果本身仍是可手工维护的 MDX。

原因：

- Starlight 天然以 content collections + 文件系统路由为中心，目录即导航边界。
- 与旧站点“guide/components”结构相近，降低迁移后的认知成本。
- 直接生成 MDX 可以避免再维护自定义 Markdown-to-page 管线。

备选方案：

- 保留运行时扫描 web-vue README 的动态侧边栏：减少一次性生成，但会重新引入隐式内容依赖，和“MDX 直接维护”目标冲突。

### 3. 在线示例使用 Astro 中的 Vue island 包装可编辑 Playground

Starlight 页面通过 MDX 引入自定义 Vue Playground 组件。迁移脚本为每个 demo 产出结构化元数据和源码字符串，Playground 组件负责展示说明、渲染示例，并接入在线编辑能力。优先复用仓库已存在的 @vue/repl 依赖和组件库构建产物，让用户能在文档中直接修改示例代码。

原因：

- 旧站点已经依赖 @vue/repl，迁移可复用现有能力而不是自建编辑器编译链。
- Astro island 只在需要的示例块上启用客户端 JS，较容易控制体积。
- 示例源码与运行容器解耦，迁移脚本只需保证每个 demo 的源码和描述完整输出。

备选方案：

- 仅保留静态代码块：实现简单，但不满足在线更改要求。
- 将整个文档站改为纯 SPA：可复用更多交互逻辑，但会明显增加迁移范围和运行复杂度。

### 4. 主题切换尽量复用 Starlight 内建能力，仅补品牌化配置

亮暗主题切换使用 Starlight 内建的主题机制，迁移时补充站点标题、导航、侧边栏、品牌色和组件文档所需样式扩展。旧站点中与主题切换相关的文档内容继续作为普通 MDX 页面保留，而不是复制 VitePress 主题实现。

原因：

- Starlight 已自带成熟的主题切换与文档布局能力，不需要重复造轮子。
- 本次迁移重点是内容和交互能力迁移，而不是重建底层主题系统。

备选方案：

- 深度定制 Starlight 主题层：可以更贴近旧站点视觉，但不影响核心需求，适合后续迭代。

### 5. 删除旧 docgen 链路，并把仓库级命令切换到新文档包

迁移完成后，packages/sd-vue-docs 中的 scripts/generate-docs.mjs、scripts/migrate-docs.ts 及与 docs:prepare 相关的 package.json 脚本将被删除；根目录的 dev:docs、build:docs、start 等命令改为指向 packages/sd-vue-docs。若 vite-plugin-sd-vue-docs 只服务旧文档链路，也应在任务中评估并移除无用引用。

原因：

- 用户要求放弃原 docgen 逻辑，并删除关联未使用脚本。
- 若根脚本不切换，新旧文档站会并存并继续制造维护歧义。

备选方案：

- 同时维护两套文档站一段时间：风险较低，但会延长双轨维护时间，不符合这次简化目标。

## Risks / Trade-offs

- 迁移覆盖率验证遗漏隐藏页面或未纳入导航的组件文档 → 脚本必须基于实际源目录枚举输入，并输出迁移清单与缺失报告，构建前校验数量一致。
- 在线 Playground 依赖客户端运行时，可能增加页面体积或加载时延 → 仅对示例块启用客户端组件，首页和纯文档页保持静态渲染。
- 旧 Markdown 中可能包含 VitePress 专用语法或内部链接格式 → 在迁移脚本中集中做语法转换和链接重写，并为无法自动转换的片段输出告警。
- 删除旧脚本后若根命令切换不完整，会影响团队日常使用 → 需要同步更新根目录 README、package.json 命令和文档包 README。

## Migration Plan

1. 在 packages/sd-vue-docs 中补齐 Astro/Starlight 运行配置、Vue 集成、自定义组件和内容目录结构。
2. 编写 Node 迁移脚本，扫描旧指南、组件 README 和 demo，生成 MDX 页面、导航元数据与示例源码文件，并输出覆盖率检查。
3. 实现 Starlight 侧边栏、首页、主题配置和 Playground 组件，验证主题切换和在线编辑体验。
4. 将根目录与文档包脚本切换到新站点，删除旧 docs:prepare/docgen 相关逻辑和未使用脚本。
5. 执行全量迁移与构建验证；若结果不符合预期，可回滚到迁移前的脚本与根命令映射，但保留新站点代码分支用于继续修正。

## Open Questions

- 在线示例最终是直接嵌入 @vue/repl，还是在其上封装更轻量的编辑器视图；需要根据包体积与交互体验做取舍。
- 旧站点中若存在少量仅在 VitePress 主题层渲染的自定义组件，是否已有对应 Starlight 版本，还是需要在迁移期重写。
