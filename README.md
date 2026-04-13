<div align="center">
  <h1>SD Design</h1>
</div>

<div align="center">

基于 [Arco Design](https://arco.design/) 的 Vue UI 组件库。

</div>

## 基础架构

本仓库是一个基于 pnpm workspace 的 monorepo，核心包都位于 packages 目录下。

- packages/web-vue：Vue 组件库本体，包含组件源码、构建脚本、文档元数据生成和测试。
- packages/sd-vue-docs：VitePress 文档站，负责文档迁移脚本、开发调试和生产打包。
- packages/sd-vue-scripts：内部脚手架与构建工具，封装组件库和站点的构建逻辑。
- packages/vite-plugin-sd-vue-docs：将 Markdown 文档转换为 Vue 页面内容的内部 Vite 插件。

根目录脚本主要用于串联这些内部包。第一次运行前，需要先把内部工具包编译出来，否则 workspace bin 无法正确工作。

## 环境要求

- Node.js >= 24.14.1
- pnpm >= 10.33.0

如果 Node 版本低于推荐值，脚本通常仍可运行，但会看到 engine warning。

## 快速开始

首次安装或依赖升级后，建议按下面顺序执行：

```bash
pnpm install
pnpm run init
pnpm run dev
```

其中：

- `pnpm run init` 会先构建内部工具包，再安装依赖，并执行 `@sdata/web-vue` 的初始化流程。
- `pnpm run dev` 会同时启动组件库 watch 构建和 VitePress 文档站开发服务。
- `pnpm run dev:all` 是 `pnpm run dev` 的全量显式入口，适合脚本编排或新同学快速理解流程。
- `pnpm run dev:docs` 只启动文档站；`pnpm run start` 作为兼容别名，行为与 `pnpm run dev:docs` 一致。
- `pnpm run check:ci` 适合作为常规 CI 入口；`pnpm run release:check` 在此基础上再补截图测试，适合发版前全量校验。

## 常用命令

```bash
# 初始化内部工具链和组件产物
pnpm run init

# 同时启动组件库 watch 和文档站开发环境
pnpm run dev

# 与 dev 等价的全量开发入口
pnpm run dev:all

# 仅启动组件库开发构建
pnpm run dev:component

# 仅启动文档站开发环境
pnpm run dev:docs

# 打包整个项目（内部工具包 + 组件库 + 文档站）
pnpm run build

# 与 build 等价的全量构建入口
pnpm run build:all

# 仅构建内部工具包
pnpm run build:tools

# 打包组件库
pnpm run build:component

# 打包文档站
pnpm run build:docs

# 重新生成组件文档元数据
pnpm run docgen

# 格式化整个仓库
pnpm run format

# 与 format 等价的全量格式化入口
pnpm run format:all

# 检查格式是否符合要求
pnpm run format:check

# 运行仓库级代码 lint
pnpm run lint

# 与 lint 等价的全量 lint 入口
pnpm run lint:all

# 自动修复可修复的 lint 问题
pnpm run lint:fix

# 本地快速检查：lint + 单元测试
pnpm run check

# 显式本地检查入口
pnpm run check:local

# CI 安装依赖（锁文件严格模式）
pnpm run install:ci

# CI 检查：格式检查 + lint + 测试 + 全量构建
pnpm run check:ci

# CI 构建入口
pnpm run build:ci

# CI 测试入口
pnpm run test:ci

# 发版前全量校验：CI 检查 + 截图测试
pnpm run release:check

# 运行组件库测试
pnpm run test

# 仅运行组件测试
pnpm run test:component

# 全量测试：组件测试 + 截图测试
pnpm run test:all

# 运行截图测试
pnpm run test:screenshot

# 清理 dist 和 node_modules
pnpm run clean
```

## 文档编写

- 组件文档源文件位于 `packages/web-vue/components/<component>/README.zh-CN.md`。
- 组件示例源文件位于 `packages/web-vue/components/<component>/__demo__/*.md`，其中 ` ```vue ` 代码块会被迁移脚本提取为可运行示例。
- 指南页源文件位于 `packages/sd-vue-docs/guide-source/*.zh-CN.md`。
- 每次修改组件 README、示例或指南后，执行 `pnpm --filter @sd-design/sd-vue-docs run docs:prepare` 重新生成页面。
- 联调时优先使用 `pnpm run dev`；只调文档站可使用 `pnpm run dev:docs`。
- 产线构建验证优先使用 `pnpm run build`；如果只验证站点可使用 `pnpm run build:docs`。
- 日常本地自检优先使用 `pnpm run check`，CI 或发版前验证优先使用 `pnpm run check:ci`。
- 需要带截图测试的发版前校验时，优先使用 `pnpm run release:check`。

## 维护说明

- 如果升级内部工具链后文档站出现启动或打包异常，优先重新执行 `pnpm run init`。
- 根脚本 `upgrade:*` 用于批量升级依赖、engines、browserslist 和技能清单，适合做仓库级维护，不适合日常开发流程。

## 浏览器兼容性

<!-- browserslist:start -->

以下版本号基于当前 [Browserslist 配置](https://web.dev/baseline?hl=zh-cn)自动生成：

- and_chr>=118
- and_ff>=118
- chrome>=118
- edge>=118
- firefox>=118
- ios_saf>=17.0
- safari>=17.0
<!-- browserslist:end -->

# License

[GNU Affero General Public License v3.0](./LICENSE)
