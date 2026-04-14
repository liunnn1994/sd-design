## Why

当前仓库把组件库构建、测试、类型生成、图标生成、样式入口生成和部分文档相关逻辑集中在 packages/sd-vue-scripts，导致开发流程必须先构建一个共享工具包，再由根脚本和 web-vue 间接调用它，架构层级过深。现在文档站已经迁移到 packages/sd-vue-docs，仓库实际只需要维护“组件库”和“文档站”两条主流程，应当把工具职责收回拥有源码的包内，并尽量改用 Vite、TypeScript 与包内原生命令替代定制 CLI。

## What Changes

- 删除 packages/sd-vue-scripts 包及其在根目录、web-vue、CI、文档流程中的调用。
- 将组件库开发、打包、样式构建、测试与仍然必要的生成脚本迁移到 packages/web-vue，自身直接维护配置与脚本入口。
- 将可由通用工具替代的能力切换为生态原生命令，例如使用 Vite 负责开发与产物构建，使用 TypeScript 或 vue-tsc 负责声明产物输出，而不是继续走共享 CLI 包装层。
- 将无法直接由通用工具覆盖、但仍然是组件库私有资产的生成逻辑改为 packages/web-vue 内部脚本，例如图标组件生成、样式入口聚合、编辑器元数据生成。
- 调整根目录脚本与发版/CI 流程，只保留组件库开发/打包/测试以及文档开发/打包两类工作流，不再存在“先构建工具包再继续”的步骤。
- **BREAKING** 删除 @sd-design/sd-vue-scripts workspace 包与相关命令，所有依赖 sd-vue-scripts 的命令入口都会改名或改为直接调用包内脚本/原生命令。

## Capabilities

### New Capabilities

- `component-library-tooling`: 组件库包直接提供开发、构建、测试和必要生成能力，并为每类现有脚本定义最通用的替代方式。
- `workspace-package-workflows`: 仓库根脚本与 CI 只编排 web-vue 和 sd-vue-docs 两个包的开发/构建/测试流程，不再依赖独立工具包引导。

### Modified Capabilities

- `docs-tooling-simplification`: 文档工作流继续保持简化，但其开发与构建前置条件需要进一步收敛为仅依赖文档包和组件库产物/源码，不再依赖共享脚手架包。

## Impact

- 受影响包：packages/web-vue、packages/sd-vue-docs、packages/sd-vue-scripts、仓库根目录。
- 受影响脚本：根目录 package.json、packages/web-vue/package.json、GitHub Actions release 流程，以及 README/CONTRIBUTING 中的开发命令说明。
- 受影响构建能力：组件库的 Vite 构建配置、声明文件生成、样式产物输出、测试入口、图标生成、JSON 元数据生成。
- 受影响依赖：删除 sd-vue-scripts 独有依赖后，相关依赖将迁移到 web-vue 或直接被 Vite/TypeScript 原生命令取代。
