# @sd-design/sd-vue-docs

基于 VitePress 的中文组件文档站。

## 目录说明

- `guide-source/*.zh-CN.md`：指南原始文档，迁移脚本会生成到 `guide/*.md`
- `components/`：迁移后生成的组件文档，请勿手工维护
- `.vitepress/theme/generated/`：从 `__demo__` 提取出来的 Vue 示例文件，请勿手工维护
- `scripts/migrate-docs.ts`：文档迁移与页面生成脚本

## 组件文档怎么写

组件文档统一从组件包内的中文 README 和 demo 源文件生成。

1. 在 `packages/web-vue/components/<component>/README.zh-CN.md` 中维护组件说明、API、使用注意事项。
2. 在 `packages/web-vue/components/<component>/__demo__/*.md` 中维护示例。
3. 每个 demo 文件必须包含一个 ` ```vue ` 代码块，迁移脚本会把它提取成可运行示例。
4. demo 的中文说明请写在 `## zh-CN` 段落中；如果存在英文段落，当前站点会自动忽略。
5. 不要手工修改 `packages/sd-vue-docs/components/**` 和 `.vitepress/theme/generated/**`，这些文件会在 `docs:prepare` 时被重建。

## 指南文档怎么写

指南文档统一维护在 `guide-source/` 下，目前保留：

- `start.zh-CN.md`
- `theme.zh-CN.md`
- `dark.zh-CN.md`
- `faq.zh-CN.md`

修改后执行一次生成命令即可同步到最终页面。

## 常用命令

```bash
# 根目录：同时运行组件 watch 和文档站
pnpm run dev

# 根目录：显式全量开发入口
pnpm run dev:all

# 根目录：只启动文档站
pnpm run dev:docs

# 根目录：CI 构建文档站所在的全量构建流程
pnpm run build:ci

# 根目录：发版前全量校验
pnpm run release:check

# 包目录或根目录 filter 调用：生成文档页面
pnpm --filter @sd-design/sd-vue-docs run docs:prepare

# 包目录或根目录 filter 调用：启动文档站
pnpm --filter @sd-design/sd-vue-docs run docs:dev

# 根目录：仅构建文档站
pnpm run build:docs

# 包目录或根目录 filter 调用：构建文档站
pnpm --filter @sd-design/sd-vue-docs run docs:build
```
