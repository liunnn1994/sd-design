## 1. 收回 web-vue 的工具链归属

- [x] 1.1 将 sd-vue-scripts 中仍需保留的 Vite 配置、Vite 插件和构建辅助函数迁移到 packages/web-vue 的包内 scripts/configs 目录。
- [x] 1.2 将 web-vue 的 start、build:component、build:module、build:style 改为直接调用包内 Vite 流程，不再通过 sd-vue-scripts CLI。
- [x] 1.3 用 vue-tsc 或 TypeScript 构建配置替换 dtsgen 与 dtsgen:icon，并验证声明产物路径满足当前发布结构。
- [x] 1.4 将 icongen、lessgen、jsongen 迁移为 packages/web-vue 的包内脚本，并保持 icons.json、components/index.less、web-types/vetur JSON 产物可生成。
- [x] 1.5 将 web-vue 的 test 与 test:update 改为直接调用包内 Jest 配置，并决定 test:screenshot 是迁回为包内显式实现还是从支持工作流中移除。

## 2. 简化仓库级工作流

- [x] 2.1 更新根目录 package.json，使 dev/build/test/check/release 相关脚本只编排 @sdata/web-vue 和 @sd-design/sd-vue-docs。
- [x] 2.2 删除 build:tools 及其他要求先构建 sd-vue-scripts 的根脚本前置步骤，并在必要时将 init 改为只调用 web-vue 自身初始化命令。
- [x] 2.3 更新 .github/workflows/release.yml，移除 sd-vue-scripts 路径监听与独立构建步骤，改为使用迁移后的 web-vue 命令完成发布前构建。

## 3. 对齐文档站依赖边界

- [x] 3.1 审查 sd-vue-docs 的 dev/build/vendor 同步链路，确保其只直接依赖 web-vue 源码或产物，不再通过 sd-vue-scripts 间接获取资源。
- [x] 3.2 回归验证文档站开发与打包流程，确认组件样式、vendor 文件和在线示例能力在新工具链下仍可工作。

## 4. 删除工具包并清理仓库说明

- [x] 4.1 从 packages/web-vue、根目录 workspace 和锁文件中移除 @sd-design/sd-vue-scripts 依赖与引用。
- [x] 4.2 删除 packages/sd-vue-scripts 包及其残留源码、README 和不再使用的脚本入口。
- [x] 4.3 更新 README、CONTRIBUTING 和其他仓库说明，删除“先构建内部工具包”的描述，改写为组件库与文档站两条主工作流。

## 5. 验证迁移结果

- [ ] 5.1 运行 web-vue 的开发、构建、测试和必要生成命令，确认不依赖 sd-vue-scripts 也能独立完成。
- [ ] 5.2 运行根目录的 dev/build/test/check 关键命令，确认支持工作流只涉及 web-vue 与 sd-vue-docs。
- [ ] 5.3 对比迁移前后的关键产物目录与发布入口，确认 es、lib、dist、json 及文档站构建结果没有出现非预期回退。
