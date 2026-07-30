# @sdata/web-vue-mcp

[SD Design Vue](https://sd-design.js.org) 组件库的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务。安装后，AI 助手可以直接查询 SD Design 组件的分类、Props、Events、Slots、导入方式与文档链接，在帮你写 Vue 代码时给出准确、最新的组件用法。

## 这是什么

[MCP](https://modelcontextprotocol.io/) 是一个让 AI 模型连接外部工具与数据源的开放协议。本服务把 SD Design 组件库的 API 元数据暴露给 AI 助手，使其在编码时无需盲猜组件 Props，而是基于组件库真实导出的接口回答。

服务基于 MCP TypeScript SDK v2，支持当前的 `2026-07-28` 协议，并继续兼容使用 `initialize` 握手的旧版客户端。

数据来源与组件库对外发布的 `web-types` / `vetur` IDE 元数据一致（均由 [`vue-docgen-api`](https://github.com/vue-styleguidist/vue-docgen) 从组件源码提取），覆盖全部文档化组件。

## 安装

### Claude Code

```bash
# 添加到用户级配置（所有项目可用）
claude mcp add sd-design -s user -- npx -y @sdata/web-vue-mcp

# 或仅添加到当前项目
claude mcp add sd-design -- npx -y @sdata/web-vue-mcp
```

也可以使用 JSON 格式：

```bash
claude mcp add-json sd-design '{"command":"npx","args":["-y","@sdata/web-vue-mcp"]}' -s user
```

常用命令：

```bash
claude mcp list            # 列出所有 MCP 服务
claude mcp get sd-design   # 查看服务详情
claude mcp remove sd-design # 移除服务
```

添加后开启新的 Claude Code 会话，使用 `/mcp` 验证连接。

> 参考：[Claude Code MCP 文档](https://code.claude.com/docs/en/mcp)

---

### VS Code (GitHub Copilot)

在项目下创建 `.vscode/mcp.json`：

```json
{
  "servers": {
    "sd-design": {
      "command": "npx",
      "args": ["-y", "@sdata/web-vue-mcp"]
    }
  }
}
```

添加后在 Copilot Chat 的 **Agent 模式** 下即可使用。

> 参考：[VS Code MCP 文档](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)

---

### OpenAI Codex CLI

```bash
codex mcp add sd-design -- npx -y @sdata/web-vue-mcp
```

或编辑 `~/.codex/config.toml`：

```toml
[mcp_servers.sd-design]
command = "npx"
args = ["-y", "@sdata/web-vue-mcp"]
```

> 参考：[OpenAI Codex MCP 文档](https://developers.openai.com/codex/mcp/)

---

### Zed

编辑 Zed 设置文件（macOS：`~/Library/Application Support/Zed/settings.json`；Linux：`~/.config/zed/settings.json`）：

```json
{
  "context_servers": {
    "sd-design": {
      "command": {
        "path": "npx",
        "args": ["-y", "@sdata/web-vue-mcp"]
      }
    }
  }
}
```

> 参考：[Zed MCP 文档](https://zed.dev/docs/ai/mcp)

## 本地开发

直接用 npx 运行（与上文安装方式一致）：

```bash
npx -y @sdata/web-vue-mcp
```

在本仓库内开发：

```bash
# 重新生成组件数据（当 web-vue 组件源码或文档侧边栏变更后执行）
pnpm --filter @sdata/web-vue-mcp run gen

# 构建 dist/index.js
pnpm --filter @sdata/web-vue-mcp run build

# 类型检查
pnpm --filter @sdata/web-vue-mcp run typecheck

# 构建后分别以 2026-07-28 和旧版协议运行 stdio 集成测试
pnpm --filter @sdata/web-vue-mcp run test
```

## 可用工具

| 工具                   | 说明                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `list_components`      | 列出所有组件（分类、双语标题、API 数量），可按分类过滤              |
| `get_categories`       | 列出所有组件分类及各分类组件数量                                    |
| `get_component`        | 获取组件完整信息：描述、导入语句、文档链接、全部 Props/Events/Slots |
| `search_components`    | 跨名称、标题、描述与 Props/Events/Slots 文本搜索（中英文）          |
| `get_component_props`  | 仅获取组件的 Props                                                  |
| `get_component_events` | 仅获取组件的 Events                                                 |
| `get_component_slots`  | 仅获取组件的 Slots                                                  |
| `find_by_prop`         | 查找暴露了某个 Prop 的组件（如「哪些组件有 size 属性？」）          |

## 示例提问

安装后，可以试着这样问 AI 助手：

- "SD Design 的 Button 组件有哪些 props？"
- "帮我用 sd-table 实现一个带分页的表格"
- "哪些组件支持 `size` 属性？"
- "比较一下 Select 和 AutoComplete"
- "日期选择器怎么用？给我一个示例"
- "我想做一个上传组件，需要导入什么？"

## 数据说明

- 组件清单、分类与标题来自文档站侧边栏（`sd-vue-docs/src/generated/docs-sidebar.ts`）与各组件 MDX frontmatter。
- Props / Events / Slots 由 `vue-docgen-api` 从 `packages/web-vue` 组件源码提取，与组件库对外发布的 `web-types` 元数据一致。
- 重新生成：`pnpm --filter @sdata/web-vue-mcp run gen`，产物为 `data/components.json`（`build` 时自动生成并内联进 `dist/index.js`，不提交到版本库）。

### 已知限制

部分组件（如 `select`、`menu`、`cascader`、`typography`）的 Props 文档写在 TypeScript `interface.ts` 中，`vue-docgen-api` 无法追踪到外部接口定义，因此这些组件的 API 字段可能为空——这与组件库自身发布的 `web-types` 表现一致。遇到此类情况，`get_component` 返回的 `docUrl` 指向完整的文档页面，可直接参考。

## 环境要求

- Node.js 20+
- 任一受支持的 AI 工具（Claude Code、Codex、VS Code + Copilot、Zed 等）

## 相关链接

- [SD Design 文档](https://sd-design.js.org)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub 仓库](https://github.com/liunnn1994/sd-design)
- [问题反馈](https://github.com/liunnn1994/sd-design/issues)

## 许可证

AGPL-3.0-only
