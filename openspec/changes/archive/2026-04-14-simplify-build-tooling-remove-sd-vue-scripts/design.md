## Context

当前仓库存在三层工具链关系：根目录脚本编排 packages/sd-vue-scripts，后者再封装 Vite、Jest、TypeScript、Less 和若干定制生成逻辑，最终服务 packages/web-vue 与部分文档流程。这个结构带来了几个直接问题：

- 开发前需要先构建一个 workspace 工具包，根目录 README 甚至把“先构建工具包”作为日常前置条件。
- web-vue 的 start、build、test、dtsgen、icongen、lessgen、jsongen 都经由 sd-vue-scripts 间接调用，职责边界与源码归属分离。
- sd-vue-scripts 中混合了两类完全不同的能力：一类只是对 Vite/Jest/TypeScript 的包装，另一类是图标、样式入口、编辑器元数据这类组件库私有生成逻辑。
- 文档站已迁移到 sd-vue-docs，仓库目标工作流实际上只剩“组件库开发/打包/测试”和“文档开发/打包”，共享 CLI 包已经不再提供清晰的架构收益。

同时，当前仓库还有两个约束：

- web-vue 仍需要保留图标组件生成、聚合 less 入口、Vetur/Web Types JSON 生成等业务特有产物。
- 文档站的 vendor 同步和样式消费应直接依赖 web-vue 源码或构建产物，不应再被一个额外工具包阻断。

## Goals / Non-Goals

**Goals:**

- 删除 packages/sd-vue-scripts，并移除其在根目录脚本、web-vue、CI 和文档工作流中的调用。
- 让 web-vue 直接拥有自己的开发、构建、测试与必要生成脚本，避免“工具逻辑在别处，业务逻辑在本包”的拆分。
- 为每个现有 sd-vue-scripts 命令定义最通用的替代方式：能用 Vite、TypeScript、Jest、Playwright 等原生生态能力解决的，直接切换；不能通用替代的，降级为 web-vue 包内脚本。
- 把根目录工作流简化为仅编排 web-vue 与 sd-vue-docs 两个包，不再存在 build:tools 这类中间阶段。
- 保持文档站工作流简洁，确保 docs 的 dev/build 只依赖文档包自身逻辑和 web-vue 产物/源码。

**Non-Goals:**

- 不在本次设计中重写组件库的公开 API 或目录结构。
- 不把图标生成、文档元数据生成等业务私有逻辑抽象成对外复用的通用工具。
- 不顺手替换测试框架、打包器或文档框架，只做职责收口与命令替换。
- 不修复与本次迁移无关的历史构建差异，除非它们阻塞 sd-vue-scripts 的移除。

## Decisions

### 1. 删除共享 CLI 包，按“生态通用能力”和“业务私有能力”拆分职责

决定：完全移除 packages/sd-vue-scripts，而不是把它重命名或降格为内部 utils 包。

理由：

- 当前它的主要价值不是复用，而是转发。build:component、dev:component、test、dtsgen 等命令本质上只是包了一层 Vite/Jest/TypeScript。
- 唯一真正带有业务知识的是 icongen、lessgen、jsongen，这些脚本与 web-vue 的目录结构强耦合，继续放在独立包中只会增加维护距离。

备选方案：保留 sd-vue-scripts，但只收缩内容。

- 未采用原因：这仍然保留了第三层架构和“先构建工具包”的运行前置条件，不能解决复杂度根因。

### 2. 用包内配置直接承接 Vite 构建与开发监听

决定：将 sd-vue-scripts 下现有 Vite 配置与必要插件迁移到 web-vue 包内，由 web-vue 自己的脚本直接调用 Vite CLI 或 Node API。

替换矩阵：

- dev:component -> web-vue 包内直接执行 Vite watch/dev 构建。
- build:component / build:module -> web-vue 包内直接执行 Vite 生产构建。
- build:style -> web-vue 包内样式构建脚本，内部可继续调用 Vite 处理 style 入口，但不再经由共享 CLI。

理由：

- 构建配置天然属于产物拥有者；把 Vite 配置迁回 web-vue 后，修改构建行为不再需要跨包跳转。
- docs 已经直接依赖 web-vue，后续若需要共享少量构建辅助函数，也应以内聚方式放入 web-vue/scripts 或 utils，而不是恢复一个全包 CLI。

备选方案：在根目录维护统一 Vite 配置后供多个包继承。

- 未采用原因：当前只有 web-vue 真正使用这套组件构建语义，抽到根目录会重新制造共享抽象。

### 3. 用 TypeScript 或 vue-tsc 直接承担声明文件输出

决定：废弃自定义 dtsgen 命令，优先采用 vue-tsc 或 TypeScript 原生命令输出声明文件；如需保留少量补丁逻辑，应在 web-vue 内通过独立 tsconfig/build 脚本承接，而不是保留自定义 CLI 语义。

替换矩阵：

- dtsgen -> vue-tsc --declaration --emitDeclarationOnly 或等价的 TypeScript 构建配置。
- dtsgen:icon -> 统一并入组件库声明产物流程，不再单独暴露一个“图标特供 CLI”。

理由：

- .vue 声明输出属于成熟生态问题，优先用标准工具，减少 ts-morph 维护成本。
- 统一声明生成后，图标目录不需要额外单独跑一套自定义入口，只需要在构建配置里处理输出位置与包含范围。

备选方案：把现有 ts-morph dtsgen 原样搬进 web-vue。

- 未采用原因：这只是迁移代码，不是替换为更通用方案；只有在标准工具无法覆盖当前产物结构时，才应保留最小补丁层。

### 4. 业务特有生成逻辑降级为 web-vue 包内脚本

决定：保留但迁移 icongen、lessgen、jsongen，作为 web-vue/scripts 下的包内脚本，由 web-vue package.json 直接调用。

替换矩阵：

- icongen -> web-vue 内部 Node 脚本，继续从 icon/\_svgs 生成 Vue 图标组件、聚合入口和 icons.json。
- lessgen -> web-vue 内部 Node 脚本，生成 components/index.less 聚合入口。
- jsongen -> web-vue 内部 Node 脚本，生成 vetur-tags、vetur-attributes、web-types。

理由：

- 这三类逻辑都依赖 web-vue 的目录约定和产物结构，不属于 Vite/TS 的通用职责。
- 迁入包内后，仍可单独执行，但不再污染仓库整体架构。

备选方案：完全放弃这些生成逻辑。

- 未采用原因：至少 icons.json、web-types 和聚合样式入口仍然是已发布产物或开发依赖的一部分，直接删除会造成行为回退。

### 5. 测试命令直接由 web-vue 拥有，死链路要么收编要么删除

决定：web-vue 直接维护 Jest 配置与测试脚本；若继续保留截图测试，则改为 web-vue 包内直接使用 Playwright 或等效工具，不再通过 sd-vue-scripts 代理。

理由：

- 当前 test 命令只是读取 jest.config 并转发参数，没有独立抽象价值。
- 仓库中存在对 test:screenshot 的调用，但 sd-vue-scripts 的 CLI 与实现已经脱节，说明该能力必须在迁移时被显式清理，而不能继续隐藏在工具包里。

备选方案：把测试包装保留在一个新的共享 test-utils 包中。

- 未采用原因：仓库只有 web-vue 真实使用这一套测试入口，没有共享需求。

### 6. 根目录与 CI 只编排两个包的工作流

决定：删除 build:tools 和所有“先构建 sd-vue-scripts”步骤，根目录只保留以下两类编排：

- web-vue: 开发、打包、测试、必要生成。
- sd-vue-docs: 开发、打包。

理由：

- 这与用户预期的仓库形态一致，也与当前实际业务边界一致。
- release workflow 只需要构建和发布 web-vue，再触发文档站构建，不需要单独构建一个不会发布给最终用户的中间工具包。

备选方案：保留 init 作为“预生成产物”的统一入口。

- 有条件采用：如果 web-vue 仍需要 icongen/lessgen 之类预生成步骤，可以保留 init，但它应只调用 web-vue 自身命令，而不是先构建工具包。

## Risks / Trade-offs

- [标准声明生成与当前产物布局不完全一致] -> 先用独立 build tsconfig 或 vue-tsc 原型验证 es/types 输出路径；若必须补丁，仅在 web-vue 内添加最小后处理脚本。
- [Vite 配置迁移后可能出现产物路径差异] -> 在实施时以当前 es/lib/dist/json 目录和入口文件为回归基准，逐项比对发布产物。
- [截图测试现状已失效，迁移时容易被遗漏] -> 将其作为显式任务处理：要么迁回 web-vue 并验证可执行，要么从根脚本和文档中删除该入口。
- [文档站依赖的样式或 vendor 产物路径可能受构建迁移影响] -> 在 web-vue 构建迁移后立刻跑 docs dev/build 回归，确保 docs 只依赖稳定的 web-vue 源码或产物入口。
- [删除 sd-vue-scripts 会牵动 release 和文档说明] -> 将 README、CONTRIBUTING、workflow 一并纳入迁移范围，避免仓库说明与真实命令脱节。

## Migration Plan

1. 先在 web-vue 内建立新的 scripts/configs，做到不依赖 sd-vue-scripts 也能独立 dev/build/test/generate。
2. 调整根目录 package.json、README、CI，使所有调用切换到 web-vue 与 sd-vue-docs 的新入口。
3. 跑组件库与文档站回归，确认构建产物、类型产物、样式产物和 docs vendor 同步都正常。
4. 删除 packages/sd-vue-scripts、workspace 依赖引用和锁文件残留。

回滚策略：在迁移完成前保持变更集中在单个 change 内；如果新流程出现阻塞，可临时保留旧脚本文件作为 web-vue 包内兼容入口，但不恢复独立 workspace 工具包。

## Open Questions

- web-vue 的声明产物是否能完全由 vue-tsc 一次性替代，还是需要对图标目录保留少量输出重排步骤？
- release:check 是否要继续保留截图测试；如果保留，采用 Playwright 还是直接移除失效命令更符合当前维护成本？
