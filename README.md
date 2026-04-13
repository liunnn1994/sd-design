<div align="center">
  <h1>SD Design</h1>
</div>

<div align="center">

基于 [Arco Design](https://arco.design/) 的 Vue UI 组件库。

</div>

# 基础架构

本仓库是一个基于 pnpm workspace 的 monorepo，核心包都位于 packages 目录下。

- packages/web-vue：Vue 组件库本体，包含组件源码、构建脚本、文档元数据生成和测试。
- packages/arco-vue-docs：VitePress 文档站，负责文档迁移脚本、开发调试和生产打包。
- packages/arco-vue-scripts：内部脚手架与构建工具，封装组件库和站点的构建逻辑。
- packages/vite-plugin-arco-vue-docs：将 Markdown 文档转换为 Vue 页面内容的内部 Vite 插件。
- packages/arco-changelog：变更日志解析工具，供文档和发布流程复用。
- packages/web-vue-storybook：组件 Storybook 工程。

根目录脚本主要用于串联这些内部包。第一次运行前，需要先把内部工具包编译出来，否则 workspace bin 无法正确工作。

# 环境要求

- Node.js >= 24.14.1
- pnpm >= 10.33.0

如果 Node 版本低于推荐值，脚本通常仍可运行，但会看到 engine warning。

# 快速开始

首次安装或依赖升级后，建议按下面顺序执行：

```bash
pnpm install
pnpm run init
pnpm run start
```

其中：

- `pnpm run init` 会先构建内部工具包，再安装依赖，并执行 `@arco-design/web-vue` 的初始化流程。
- `pnpm run start` 会启动 VitePress 文档站开发服务；如果默认端口被占用，Vite 会自动切换到下一个可用端口。

# 常用命令

```bash
# 初始化内部工具链和组件产物
pnpm run init

# 启动文档站开发环境
pnpm run start

# 打包文档站
pnpm run build:site

# 打包组件库
pnpm run build:component

# 重新生成组件文档元数据
pnpm run docgen

# 运行组件库测试
pnpm run test

# 运行截图测试
pnpm run test:screenshot

# 启动 Storybook
pnpm run storybook

# 清理 dist 和 node_modules
pnpm run clean
```

# 文档编写

- 组件文档源文件位于 `packages/web-vue/components/<component>/README.zh-CN.md`。
- 组件示例源文件位于 `packages/web-vue/components/<component>/__demo__/*.md`，其中 ` ```vue ` 代码块会被迁移脚本提取为可运行示例。
- 指南页源文件位于 `packages/arco-vue-docs/guide-source/*.zh-CN.md`。
- 每次修改组件 README、示例或指南后，执行 `pnpm --filter @arco-design/arco-vue-docs run docs:prepare` 重新生成页面。
- 日常开发使用 `pnpm run start`，产线验证使用 `pnpm run build:site`。

# 维护说明

- 如果升级内部工具链后文档站出现启动或打包异常，优先重新执行 `pnpm run init`。
- 根脚本 `upgrade:*` 用于批量升级依赖、engines、browserslist 和技能清单，适合做仓库级维护，不适合日常开发流程。

# License

[GNU Affero General Public License v3.0](./LICENSE)

# 支持版本

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
