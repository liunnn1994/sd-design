## Why

现有文档站仍基于 VitePress，并依赖 docs:prepare 与 docgen 风格脚本把中文源文档和示例转换成站点页面，维护链路长且修改成本高。仓库已经初始化了基于 Astro Starlight 的新站点骨架，现在需要把旧站内容完整迁移过去，统一为可直接编辑的 MDX 文档，同时保留主题切换与在线修改代码示例能力。

## What Changes

- 将 packages/sd-vue-docs 中现有指南页、组件页、示例与导航信息迁移到 packages/sd-vue-docs 的 Astro Starlight 站点。
- 编写一个可重复执行的迁移脚本，基于仓库现有中文文档与示例源，生成 100% 覆盖的 MDX 文档内容，并输出迁移缺失检查结果。
- 在 Starlight 中重建原站点的主题切换能力，仅保留简体中文文档结构与文案。
- 在 Starlight 中重建代码示例的在线修改体验，使组件示例仍可在文档中直接查看并编辑。
- **BREAKING** 删除原有 docs:prepare/docgen 生成链路及相关未使用脚本，文档维护改为直接编辑 MDX 与示例资源。

## Capabilities

### New Capabilities

- `starlight-docs-migration`: 将现有 VitePress 中文文档、组件目录和站点导航完整迁移为 Starlight 可消费的 MDX 内容，并验证迁移覆盖率。
- `interactive-doc-examples`: 在 Starlight 文档中提供可在线修改的组件示例，并保留示例源码展示能力。
- `docs-tooling-simplification`: 移除旧的 docgen 生成逻辑与未使用脚本，建立以 MDX 为主的简体中文文档维护方式。

### Modified Capabilities

无。

## Impact

- 受影响包：packages/sd-vue-docs、packages/sd-vue-docs、packages/web-vue、可能包括根目录文档开发与构建脚本。
- 受影响脚本：packages/sd-vue-docs/scripts 下的迁移脚本、根目录与文档包 package.json 中与 docs:prepare/docgen 相关的命令。
- 受影响站点能力：导航、侧边栏、主题切换、组件文档渲染、在线示例编辑体验。
- 潜在新增依赖：Starlight 集成所需的 Astro/Vue 示例运行或嵌入能力。
