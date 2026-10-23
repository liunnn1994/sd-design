---
name: create-component
description: 按 SD Design 的 Foundation + Adapter 架构新增或重构正式组件，覆盖 web-core 共享逻辑与样式、web-vue 适配与视图、公共入口、测试、demo 和文档。用于新增组件、内部组件公共化或补齐组件交付链路；局部修复只采用相关步骤。
---

# Create Component

这个 skill 用于在当前仓库里为组件库实现一个“可以合并”的组件，而不是只生成一个演示性质的 Vue 文件。

目标包和目录是固定的：

- 无框架逻辑和共享类型放在 `packages/web-core/src/<component-name>/`
- 共享 SCSS/token 放在 `packages/web-core/styles/<component-name>/style/`
- Vue Adapter + View 放在 `packages/web-vue/components/<component-name>/`
- 文档页放在 `packages/sd-vue-docs/src/content/docs/components/<component-name>/index.mdx`
- 文档站的 `src/components/generated/` 默认先视为生成目录，但必须先核实它在当前仓库里是否真的由脚本生成、是否受版本控制、是否实际作为 demo 测试输入

在这个仓库里，组件实现风格优先服从现有组件库约定，而不是通用 Vue 最佳实践的默认答案。

目标不是“能跑”，而是“达到组件库可合并、可维护、可发布的基线”。

## Foundation + Adapter 架构

按讨论 `01a15204-3974-7192-9a96-33ee802231af` 确定的分层实现组件：

```text
共享设计 token / SCSS（web-core/styles）
共享 Foundation：规则、计算、交互流程、数据契约（web-core/src）
    ├── Vue Adapter + View（web-vue，当前实现）
    ├── React Adapter + View（未来按需实现）
    ├── Solid Adapter + View（未来按需实现）
    ├── Svelte Adapter + View（未来按需实现）
    └── 原生 DOM Adapter + View（未来按需实现）
```

跨框架复用以 Foundation 和共享样式为边界，不引入 Stencil、Lit 或 Web Components 作为必要依赖。本次组件任务不默认创建其它框架包；原生端可以提供命令式创建、更新、订阅和销毁接口，也不要求 Custom Elements。

### 职责边界

| 层 | 应承担的职责 | 不应放入的内容 |
| --- | --- | --- |
| Foundation | 状态转换、数据处理、校验、选择/展开规则、键盘交互流程、共享类型 | Vue Ref/computed/watch、VNode、插槽、provide/inject、框架生命周期 |
| 原生浏览器驱动（Core） | DOM 测量、观察器、原生监听器与计时器，通过端口接收元素和调度能力 | 模块导入时访问 DOM、依赖 Vue 组件实例或框架渲染器 |
| Adapter（Vue） | 响应式状态、props 回写、emit、上下文、生命周期、渲染后调度与框架专属依赖接线 | 重复实现应由 Foundation 维护的规则和算法 |
| View（Vue） | 模板、slot、VNode、Teleport、Transition、DOM 与可访问性属性绑定 | 独立维护另一套共享业务状态机 |
| 共享样式 | 设计 token、组件 SCSS、主题变量与目录生成输入 | 在 Vue 包复制一份 token 或组件样式实现 |

- Foundation 通过普通数据、getter/setter、回调端口与 Adapter 协作。可变输入使用实时 getter，避免只复制初始化值；状态由哪层持有应沿用现有契约，不重复维护两份真源。
- 保持受控/非受控语义、缓存与对象身份、事件顺序及受控回写时机。不能在父级尚未回写时把受控值当作已提交。
- 浏览器能力通过元素、`afterRender`、动画或计时端口接入；监听器、观察器、定时器与异步任务必须随生命周期释放，避免卸载后的回调继续更新状态。
- Core 不反向导入 web-vue。Vue 通过 `@sdata/web-core/<component-name>/foundation` 等包入口消费，不跨包引用 `src`；Core 内部 ESM 导入沿用 `.js` 扩展名。
- Table 自定义单元格、Form 上下文、Select 自定义内容等由各框架正常渲染。共享数据与交互规则，不设计统一 VNode/slot 桥接协议。
- `@floating-ui/vue`、`motion-v`、`virtua/vue` 等框架专属接线留在 Vue；可独立于框架运行的驱动才归入 Core。
- 纯展示组件可只有 View 和共享样式，不为凑目录创建空 Foundation；有共享行为时，不能仅把 Vue hook 改名为 Foundation。

### 开始实现前

先列清该组件的共享规则、浏览器驱动、Adapter 与 View 各自负责什么，再选择已完成分层的相邻组件作参考。重构时先盘点现有 props、事件、slot、实例方法、深导入和测试；跨框架分层本身不授权废弃、删除或改名现有 API。只有任务明确要求迁移时才实施对应兼容方案。

## 顶层约束

只要进入这个 skill，默认同时记住下面几点：

- 不要只交付一个 `<component-name>.vue` 文件。
- 要定义 name 比如：`defineOptions({ name: 'MyComponent' });` SDVue 插件会尝试注册。
- 在 vue 组件中 props/emit 等要使用新的 ts 写法
  ```ts
  const { propName = "foo" } = defineProps<{
    /**
     * @zh 中文注释
     * @en English comment
     */
    propName: string;
  }>();
  ```

  而不是旧版的：

  ```ts
  const props = defineProps({
    /**
     * @zh 中文注释
     * @en English comment
     */
    propName: {
      type: String,
      default: "foo",
    },
  });
  ```
- 尽量使用 `es-toolkit`，非必要不要自己封装工具函数。
- 尽量使用 `type-fest`，非必要不要自己定义类型工具。
- 尽量创建独立的 `types.ts` 文件，并且导出类型，非必要不要把类型写散在各个文件里。
- 尽可能的使用 Composition API typescript 模式，非必要不使用tsx，严格禁止写成选项式 API，如果存在旧组件尽量先改为 setup script 再进行修改。
- 不要漏掉 `index.ts`、样式入口、总导出入口、测试、文档页。
- 文档的 `demo` 部分至少覆盖基本用法、一个核心变体、一个交互或状态变化场景、一个插槽/自定义内容/组合场景；如果组件比较复杂，还要补尺寸或状态矩阵、受控用法、自定义渲染、边界或异常态等，要优先组件库已有的组件，比如使用 `Button` 组件而不是 `button` 标签。
- 不要漏掉文档导航入口；当前仓库新增组件文档后，还要检查 `packages/sd-vue-docs/src/content/docs/components/index.mdx` 和 `packages/sd-vue-docs/src/generated/docs-sidebar.ts` 是否需要同步。
- 不要手改 `packages/sd-vue-docs/src/components/generated/` 这类目录，除非已经确认它在当前任务里就是人工维护源，或者当前仓库根本不存在对应的 demo 生成脚本而测试又直接消费这些 `.vue` 文件。
- 不要编造仓库命令名、生成链路或目录职责；先查真实脚本和相邻组件。
- 不要把“参考组件长得像”误当成“实现路径相同”；要先判断组件形态。
- 不要因为用户只提到其中一项，就省略其余交付面；新增正式组件默认要覆盖完整链路。
- 不要未经确认就修改公共 API 命名、导出形态、事件语义或文档信息架构。
- 不要在一次改动里顺手重构无关组件，除非当前任务明确要求或这是修复根因所必需。
- 不要只看 DemoEditor / 在线 REPL 里是否可用；凡是文档 demo 依赖浮层、裁剪、懒激活、首次 hover/focus/click 或容器尺寸，必须同时确认 `DemoBlock` 预览里的第一轮交互也有可见效果。
- 文档页里的 `*Source` 变量默认应直接使用对应 demo 文件的 `.vue?raw` 导入，不要在 MDX 里再手写一份重复源码字符串。
- 根目录下的 `vendor` 文件夹默认视为“外部依赖的本地化产物”，里面的内容仅供参考，不要默认它们在当前任务里就是需要维护的输入或输出。要实现的是把它们的能力内化到组件库源码里，而不是给组件库加外部运行时依赖。
- 如果任务明确要求迁移或废弃 API，先确认替代入口、库内调用方和兼容方式，再同步文档与测试；不要把 F/A 分层重构自动视为废弃组件或删除 render API 的授权。

执行结束前，至少自查一次：源码、样式、导出、测试、文档、验证 6 个面是否都已覆盖。

## 严格禁止

下面这些行为默认禁止：

- 只创建组件目录，不接导出入口。
- 只补功能，不补文档和测试。
- 只补文档，不核实现有 API 与实现是否一致。
- 直接复制参考组件后仅做字符串替换，不重新审视 API 与结构是否合理。
- 在样式里堆魔法值，跳过 token 层。
- 用快照测试替代关键行为断言。
- 为了让测试通过而降低组件 API 的可用性或可读性。
- 未确认生成链路就手改生成产物或把未知脚本写进流程。

## 执行模式

默认把任务分成两个层级推进：

### 1. 必达基线

这部分必须完成：

- 组件源码
- 样式 token 与样式入口
- 总导出入口
- 插件注册入口
- 行为测试
- demo 测试
- 文档页
- 文档和示例内容注释等必须使用简体中文
- 至少一轮有效验证
- 必须使用 typescript，且类型不能随手放宽成 any 或不写

### 2. 进阶优化

这部分在时间和上下文允许时追加，但不要先做它们、后漏掉基线：

- 尽量使用 vue composition API，不要写过多选项式 API
- a11y 细化
- 文案与命名收敛
- API 一致性提升
- demo 结构优化
- 文档叙述质量提升
- 边界态和异常态补测
- 样式 token 语义整理

先完成基线，再做优化。

## 适用范围

用户出现下面这些意图时使用本 skill：

- 新增一个组件到 `@sdata/web-vue`
- 在现有组件基础上补齐缺失的测试、样式入口、文档页
- 按现有组件模式搭一个新组件骨架
- 把一个内部组件整理成正式导出的公共组件
- 为组件补充 props、events、slots、API 文档、demo 测试

如果用户只是改一个很小的 bug，不要强行跑完整建组件流程；只吸收其中相关章节。

## 先确认的上下文

编码前先确认这些信息；如果用户没给全，优先从相邻组件和仓库结构补足，实在缺失再提问：

1. 组件名。
2. 组件是单组件还是组件组。
3. 对外 API：props、events、slots、暴露实例、子组件。
4. 是否需要受控/非受控双模式。
5. 是否需要全局方法或函数式调用。
6. 文档至少需要哪些 demo 场景。
7. 哪些行为必须有测试覆盖。

如果用户描述非常短，优先自行从仓库推断，而不是立刻反问。只有这些信息会直接改变实现形态时再提问：

- 组件是否需要子组件一起导出
- 是否存在函数式 API 或静态方法
- 文档 demo 是写最终 MDX 还是还要接某条生成链路

命名约定：

- 目录名和文档目录名使用 kebab-case，例如 `alert`、`date-picker`
- 组件导出名使用 PascalCase，例如 `Alert`
- CSS 前缀通过 `getPrefixCls('<name>')` 生成，例如 `sd-alert`

如果组件名称天然包含多个词，优先保持与现有目录风格一致，不要自行切换大小写策略。

## 必须先核实的仓库事实

在正式编码前，至少核实下面事实，而不是凭经验假设：


1. 相邻组件是否在同目录下存在多变体文件。
2. `components/index.ts` 的导出写法。
3. `components/sd-vue.ts` 的注册写法。
4. `__test__/index.cy.ts` 的断言风格。
5. `__test__/demo.cy.ts` 是否接统一 demo 测试脚本。
6. docs 页是直接维护 MDX，还是依赖额外生成步骤。
7. 当前仓库真实存在的验证脚本名。
8. 是否存在 `components/components.ts` 这类全局组件类型声明文件需要同步。
9. 是否存在 `components/index.scss` 这类根样式聚合入口需要同步。
10. 根样式聚合入口当前使用的 `@use` 写法，以及 Vue 样式向 Core 转发的路径；保持现有前缀、路径和深入口兼容。
11. 当前仓库的组件文档发现入口是否还需要同步 `packages/sd-vue-docs/src/content/docs/components/index.mdx` 和 `packages/sd-vue-docs/src/generated/docs-sidebar.ts`。

如果终端历史、缓存文件、生成目录和 `package.json` 脚本信息互相冲突，以源码中的当前事实为准，优先级通常是：

1. 当前 `package.json` / 脚本源码
2. 当前组件源码与测试引用
3. 当前 docs 源文件
4. 终端历史
5. 生成产物

## 组件形态分支

开始写代码前，先把组件归到下面一种形态，再选参考实现。

### 1. 单组件

适用于 `Alert`、`Badge`、`Empty` 这种一个主导出即可完成主要能力的组件。

要求：

- 一个主组件文件
- 一个导出入口
- 一套样式 token 和样式入口
- 一页文档，按场景补 demo
- 行为测试至少覆盖默认态、核心态、交互态

### 2. 组件组

适用于 `Dropdown + Doption`、`Button + ButtonGroup`、`Anchor + AnchorLink` 这类多导出组件。

额外要求：

- 明确主组件与子组件的责任边界
- 同步补 `components/index.ts` 中的多导出
- 同步补 `components/sd-vue.ts` 中的多注册
- 文档页要区分主组件和子组件 API
- 测试至少覆盖主子组件的组合关系或上下文依赖
- 如果存在 provide/inject、父子注册或 slot 协作，必须至少测一个真实组合场景

### 3. 复合功能组件

适用于 `Progress`、`DatePicker` 这类同目录下存在多个展示形态或变体组件的场景。

额外要求：

- 先判断是“一个组件多个 props 变体”，还是“多个独立导出组件”
- 变体差异写进 API 和 demo，不要全塞进一个超大模板
- 文档 demo 需要覆盖典型形态，而不是只放基础用法
- 需要明确哪些变体属于主组件 props，哪些变体属于独立导出

### 4. 服务式或函数式能力

适用于像 `Message`、`Notification`、`Drawer.open()` 这种除了组件本体，还可能有静态方法或函数式调用的能力。

额外要求：

- 明确默认导出、命名导出、静态方法分别挂在哪里
- 文档里单独给出函数式调用示例
- 测试不能只覆盖模板渲染，还要覆盖调用入口
- 如果服务式能力依赖容器、挂载点或全局配置，要验证最小可用调用链路

## 先看参考组件

同时查看 `web-core/src/<name>/foundation.ts`、Core 测试、`web-core/styles/<name>/style/` 与 Vue 适配调用链。可用 `collapse` 理解 getter/setter 与事件接线，用 `skeleton-reveal` 理解浏览器驱动端口和生命周期；参考分层职责，不照搬旧 props 写法。

开始实现前，至少快速对照一个现有组件。优先找一个复杂度接近的组件，确认这些点：

- `packages/web-vue/components/<name>/<name>.vue` 的组织方式
- `index.ts` 的安装导出模式
- `style/index.scss`、`style/token.scss`、`style/index.ts` 的拆分方式
- `__test__/index.cy.ts` 和 `__test__/demo.cy.ts` 的测试粒度
- `packages/sd-vue-docs/src/content/docs/components/<name>/index.mdx` 的文档结构
- `packages/web-vue/components/index.ts` 和 `packages/web-vue/components/sd-vue.ts` 的总入口同步方式
- `packages/web-vue/components/components.ts` 是否还需要同步全局组件声明
- `packages/web-vue/components/index.scss` 是否还需要同步根样式入口，以及它当前的 import 写法
- `packages/sd-vue-docs/src/content/docs/components/index.mdx` 和 `packages/sd-vue-docs/src/generated/docs-sidebar.ts` 是否还需要同步组件发现入口

参考选择建议：

- 单组件优先参考 `alert`、`empty`、`badge` 这类目录干净的组件
- 多导出组件优先参考 `anchor`、`button`、`dropdown`
- 多形态组件优先参考 `progress`、`date-picker`
- 有函数式 API 的能力优先参考 `drawer`、`message`、`notification`

如果组件类型判断不准，先看导出入口和 docs 页面，不要只看 `.vue` 文件数量。

参考时重点提取的是“结构规则”和“公共约定”，不是视觉细节或演示文案。

## 组件目录结构

按组件实际职责创建下列文件；没有共享行为时不需要 `foundation.ts`，共享类型也只在需要时独立拆分。

```text
packages/web-core/
├── src/<component-name>/
│   ├── foundation.ts
│   └── types.ts
├── styles/<component-name>/style/
│   ├── index.scss
│   └── token.scss
└── tests/<component-name>-foundation.test.ts

packages/web-vue/components/<component-name>/
├── <component-name>.vue           # Adapter + View
├── index.ts                      # 公共导出与安装
├── types.ts                      # Vue 专属公共类型（按需）
├── __test__/
│   ├── index.cy.ts
│   └── demo.cy.ts
└── style/
    ├── index.ts                  # 运行时样式入口
    ├── index.scss                # @forward 共享样式
    └── token.scss                # @forward 共享 token
```

- Core 新增公共能力时，检查 `packages/web-core/src/index.ts` 的命名空间导出及 `package.json` 的深入口映射，不默认暴露私有端口。
- Vue 公共入口保留安装、类型、组件与深导入契约；旧工具/类型路径需要兼容时用转导出，避免复制实现。
- 组件组或多形态组件可以增加子组件，仍保持清晰的主入口和组合测试。
- 文档示例放在 docs 包，按真实脚本确认维护源，不放入组件目录。

## 必做文件

### 1. 组件主文件

路径：`packages/web-vue/components/<component-name>/<component-name>.vue`

在这个仓库里，优先遵循现有组件库风格：

- 使用 `<script lang="ts" setup>`
- 模板在前、脚本在后，和相邻组件保持一致
- 用 `getPrefixCls('<component-name>')` 生成样式前缀
- class 组合优先用 `computed(() => [...])`
- props、emits、slots 前写中英双语注释，沿用 `@zh` / `@en` 风格
- 事件校验函数里未使用的参数用 `_` 前缀，避免触发仓库的 `oxlint no-unused-vars`

实现时至少覆盖这些设计面：

- 公共 props
- 默认 slot 与具名 slots
- emits
- 可访问性：语义化标签、aria、键盘行为
- 状态 class 命名
- 边界状态

API 设计时还要额外检查：

- 是否沿用了组件库已有命名习惯，例如 `modelValue`、`defaultValue`、`visible`、`status`、`size`
- 是否把可组合能力留给 slot，而不是用过多零散 props 硬编码
- 是否存在明显冲突的 props 组合
- 是否需要暴露实例类型或方法
- 是否需要支持受控与非受控两种模式

如果组件要接收复杂对象、数组或 render 逻辑，优先先看相邻复杂组件的建模方式，不要临时发明一套新约定。

如果组件是纯展示组件，避免无意义的响应式状态。

如果组件需要复杂逻辑，将共享规则和原生驱动放入 Core，Vue 只保留框架适配；不要用 Vue hooks 承载另一套应共享的规则。

实现时优先做到“相邻组件可读性一致”，而不是把文件写成抽象程度过高的范式样板。

### 2. 组件导出入口

路径：`packages/web-vue/components/<component-name>/index.ts`

保持现有模式：

- 导入组件主文件 `_Component`
- 用 `Object.assign` 包装 `install`
- 在 `install` 中调用 `setGlobalConfig(app, options)`
- 用 `getComponentPrefix(options)` 注册组件
- 导出 `InstanceType<typeof _Component>` 作为实例类型

参考结构：

```ts
import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Component from './component.vue';

const Component = Object.assign(_Component, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _Component.name, _Component);
  },
});

export type ComponentInstance = InstanceType<typeof _Component>;

export default Component;
```

如果组件组有多个导出，确保：

- 主导出仍然清晰可辨
- 子导出顺序与 docs 叙述顺序基本一致
- 类型导出不要遗漏子组件实例或公共类型

### 3. 共享样式 token

维护源：`packages/web-core/styles/<component-name>/style/token.scss`。

- 使用 SCSS `$<component-name>-...` 变量，优先复用 `web-core/styles/style/theme` 的基础 token；命名区分背景、文本、边框与状态。
- 按相邻 Core 组件使用 `@use` / `@forward`，不使用 Less 的 `@xxx`、`@{prefix}` 或 `@import url(...)` 模板。
- Vue 的 `components/<component-name>/style/token.scss` 只保留兼容转发：

```scss
@forward '@sdata/web-core/styles/<component-name>/style/token.scss';
```

主题生成器 `packages/web-core/scripts/theme-catalog.ts` 默认扫描 `web-core/styles`。只在 Vue 新建 token 不会进入共享目录生成链路。通过 Vue 的 `theme:generate` 入口运行 Core 生成与 Vue 元数据同步，不手改生成的 theme catalog 或变量文件。

### 4. 共享样式实现与兼容入口

维护源：`packages/web-core/styles/<component-name>/style/index.scss`。

- 消费同目录 token 与共享主题/mixins，使用 SCSS 插值形成 BEM 类名。
- 类名与 Vue 模板一致，保持现有前缀、主题作用域与 CSS 变量行为。
- Vue 的 `components/<component-name>/style/index.scss` 只转发共享实现：

```scss
@forward '@sdata/web-core/styles/<component-name>/style/index.scss';
```

新增 token 或改动样式时，检查主题编辑器可发现性、变量生成、共享样式契约，以及浏览器中的主题切换效果。

### 5. 样式入口文件

路径：`packages/web-vue/components/<component-name>/style/index.ts`

固定模式：

```ts
import '../../style/index.scss';
import './index.scss';
```

不要省略全局样式入口，否则文档站和运行时可能出现样式缺失或优先级异常。

## API 设计硬规则

新增或重构组件时，至少过一遍下面的 API 审核：

- 名称是否和现有组件库术语一致
- 默认值是否合理且与文档一致
- 布尔开关是否采用现有惯用命名
- 事件名是否站在使用者视角，而不是内部实现视角
- slot 名称是否可读、可猜、可扩展
- 是否避免 props 与 slot 表达同一能力却没有优先级说明
- 类型是否足够精确，避免随手放宽成 `string | any`
- 未来是否容易扩展，而不是一开始就把 API 卡死

如果组件是对标仓库里已有同类组件，优先维持横向一致，不要为了“更优雅”擅自做一套新 API。

## 必做总入口同步

新增公共组件后，检查以下 Vue 入口，以及上述 Core 导出和共享样式入口。

### 1. 命名导出入口

路径：`packages/web-vue/components/index.ts`

需要增加：

- 组件默认导出，例如 `export { default as Alert } from './alert';`
- 实例类型导出，例如 `export type { AlertInstance } from './alert';`
- 如果有子组件或额外类型，也要在这里导出

### 2. 插件安装入口

路径：`packages/web-vue/components/sd-vue.ts`

需要增加：

- 顶部 import
- `components` 集合注册
- 如有子组件，也要保持与相邻组件一致的导入方式

如果漏掉这一步，组件可能能单独 import，但无法通过插件全量注册使用。

如果任务是重构现有组件，也要反查这两个总入口是否已经存在陈旧导出、重复导出或类型遗漏。

### 3. 全局组件类型声明入口

路径：`packages/web-vue/components/components.ts`

在当前仓库里，这个文件是手工维护的全局组件类型声明入口。新增公共组件后，通常还需要补：

- `declare module 'vue'` 中的 `Sd<ComponentName>` 映射
- 与命名导出保持一致的组件名

如果漏掉这一步，运行时可能可用，但 Volar / TS 的全局组件类型会缺失。

### 4. 根样式聚合入口

路径：`packages/web-vue/components/index.scss`

在当前仓库里，这个文件也是手工维护入口。新增公共组件样式后，通常还需要补：

- 沿用现有 `@use '@components/<component-name>/style/index.scss' as *;` 写法接入 Vue 兼容入口。

额外约束：

- 只做最小改动，新增当前组件自己的样式入口即可
- 保持文件现有风格，不要顺手批量改写其它 import
- 共享实现维护在 Core；这里接入组件入口，不复制样式或重写其它组件的导入
- 不要因为本地工具或操作系统差异去改路径分隔符；以仓库文件当前风格为准

## 分层测试要求

改变组件行为、API 或样式时，同步更新相关 Cypress 组件测试、E2E 与共享断言，并运行受影响用例。快照或元素存在断言不能替代关键行为验证。

### 1. Foundation 与原生驱动

路径：`packages/web-core/tests/<component-name>-foundation.test.ts`，使用 Node 内置测试运行器，参考相邻 Core 测试。

- 使用普通数据和端口测试规则、状态转换、边界与禁用行为，不依赖 Vue。
- 涉及受控状态时，验证输入变化后读取到最新值、父级拒绝/延迟回写、状态与事件通知顺序。
- 涉及驱动时，验证释放、取消和卸载后回调；真实布局与浏览器交互仍由浏览器测试覆盖。
- Core 模块导入不能依赖全局 DOM；涉及 SSR 或公开深入口的改动，补相应导入与产物契约验证。

### 2. Vue Adapter + View

路径：`packages/web-vue/components/<component-name>/__test__/index.cy.ts`，使用 Cypress 的 `cy.mount`，沿用当前组件测试配置。

覆盖实际公共契约：props、事件参数和时机、slot、状态切换、受控回写、键盘与焦点、组合上下文，以及按需的卸载清理。Foundation 测试不能替代这些框架接线测试。

组件组或服务式能力额外验证主子组件协作、函数调用与销毁入口。共享测试若断言了受影响组件的行为或样式，也必须一起更新。

### 3. 文档 demo 与真实页面

路径：`packages/web-vue/components/<component-name>/__test__/demo.cy.ts`，参考当前模式：

```ts
import type { Component } from 'vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/<component-name>/*.vue',
);

runDemoTests('<component-name>', demos, () => {
  // 在具体 demo 中验证该组件的关键可观察行为。
});
```

确认 demo 文件真实参与测试；按场景增加行为断言，不能把空回调当作验证完成。文档中的浮层、裁剪、首次交互和主题必须在真实 `DemoBlock` 容器中验证；组件挂载通过不能推导文档页面或在线编辑器可用。未来新增其它框架适配时，各适配需独立验证行为、可访问性和样式一致性。

## 文档要求

文档页路径固定：

- `packages/sd-vue-docs/src/content/docs/components/<component-name>/index.mdx`

文档页通常包括：

1. frontmatter：`title`、`description`
2. `DemoBlock` 引入
3. 每个 demo 的组件 import 和源码字符串
4. 场景小节
5. API 表格

推荐结构：

```mdx
---
title: 组件名 EnglishName
description: 一句话描述组件用途。
---

import DemoBlock from '../../../../components/docs/DemoBlock.astro';
import XxxBasicDemo from '../../../../components/generated/<component-name>/basic.vue';
import xxxBasicSource from '../../../../components/generated/<component-name>/basic.vue?raw';

### 基本用法

一句话说明。

<DemoBlock source={xxxBasicSource} mainFile="src/<component-name>-basic.vue">

<XxxBasicDemo client:only="vue" />

</DemoBlock>

## API
```

文档编写要求：

- 标题与描述面向使用者，不面向实现者
- demo 小节按“从基础到高级”排序
- API 至少覆盖 Props、Events、Slots；有方法或 expose 时补 Methods
- 事件名在文档中保持用户视角命名，例如 `after-close`
- 版本字段只在确实需要注明时填写
- 示例代码优先展示推荐用法，而不是实现者最省事的写法
- 场景标题要让使用者看得懂，不要写成内部开发术语
- 文档描述要解释“什么时候用”，不是只解释“它是什么”

如果组件是组件组或复合组件，文档页还要补：

- 主组件与子组件的职责说明
- 何时用 props，何时用 slot，何时用子组件组合
- 变体之间的取舍，不要只堆 API 表格

如果是服务式能力，还要补：

- 组件式调用和函数式调用的区别
- 最小可用示例
- 可能的挂载、副作用或生命周期注意事项

## 关于 demo 生成目录

下面这个目录通常是生成产物，不要直接手改：

- `packages/sd-vue-docs/src/components/generated/`

在当前仓库里，先把这件事当成“待确认事实”，不要默认存在某条 demo 生成命令。

处理顺序：

1. 先查目标包和根目录 `package.json` 的 scripts。
2. 再查相邻组件的测试、文档和脚本引用。
3. 如果终端历史显示存在某条命令，也要回到源码脚本里核实来源。
4. 只有真实存在并确认归属后，才把该命令写入操作步骤。

如果没有确认出生成链路，优先维护最终 MDX 页面和可执行测试，不要把未知生成流程写成硬要求。

当前仓库还要额外注意：

- 如果 `package.json` 里不存在 `docs:generate-demos` 或 `generate-demos` 一类脚本，就不要因为终端历史里出现过类似命令而把它当真
- 如果 `cypress/support/demo-test` 与组件的 `demo.cy.ts` 直接从 `packages/sd-vue-docs/src/components/generated/<component-name>/*.vue` 加载 demo，而这些文件又已经受版本控制，那么它们在当前仓库里应视为需要维护的输入文件，而不是可以忽略的纯产物
- 结论必须以当前源码和脚本为准，不以历史命令名为准
- 当前已确认存在的 docs 相关脚本包括：`docs:prepare`、`docs:vendor`、`docs:vendor:only`、`dev`、`dev:serve`、`build`、`build:site`、`preview`
- 对文档 demo 来说，`DemoEditor` 能运行不等于 `DemoBlock` 预览可用；如果组件有 tooltip / popover / teleported popup / overflow 裁剪 / 懒激活切换，必须按文档预览容器的真实约束检查一遍

## 文档 demo 设计规则

demo 不是越多越好，优先覆盖使用者最关心的能力。默认至少包含：

1. 基本用法
2. 一个核心变体
3. 一个交互或状态变化场景
4. 一个插槽、自定义内容或组合场景

复杂组件再补：

- 尺寸或状态矩阵
- 受控用法
- 自定义渲染
- 边界或异常态

避免这些低价值 demo：

- 只换几组文案、没有新能力
- API 完全重复、只是颜色不同
- 实现上很复杂，但对用户没有新增认知价值

## 实现流程

按这个顺序推进，避免返工：

1. 盘点现有 API 与组件形态，划分 Foundation、驱动、Adapter、View 和共享样式；选择已分层的参考组件。
2. 定义共享数据/端口契约与 Vue 公共 API；重构保留既有可观察行为和深导入契约。
3. 实现 Core 规则、类型与必要的原生驱动，补 Foundation 测试并检查导出。
4. 实现 Vue Adapter + View，接入响应式、生命周期、上下文、事件和框架依赖。
5. 在 Core 实现 SCSS/token，在 Vue 保留样式转发和运行时入口，接入根样式入口与主题生成链路。
6. 同步 Vue 命名导出、插件安装、全局组件类型和必要的兼容入口。
7. 补 Cypress 行为与 demo 测试，同步受影响的共享测试和 E2E。
8. 补 MDX、demo 源文件、组件总览和导航入口，确认 `DemoBlock` 第一轮交互与主题表现。
9. 运行受影响检查、构建与浏览器验证，修复本次引入的问题并明确未验证范围。

## 验证命令

使用仓库 `.mise.toml` 固定的工具链；运行前核实当前脚本与测试文件。以下从仓库根执行，测试路径按当前组件替换：

```powershell
mise exec -- pnpm --filter @sdata/web-core run build
mise exec -- node --test packages/web-core/tests/<component-name>-foundation.test.ts
mise exec -- pnpm --filter @sdata/web-vue run icongen
mise exec -- pnpm --filter @sdata/web-vue exec cypress run --quiet --component --browser chrome --spec "components/<component-name>/__test__/*.cy.ts"
mise exec -- pnpm run typecheck
mise exec -- pnpm run test:styles
mise exec -- pnpm --filter @sdata/web-vue run build
mise exec -- pnpm --filter @sdata/web-vue run test:foundation-exports
mise exec -- pnpm --filter @sd-design/sd-vue-docs run docs:vendor:only
mise exec -- pnpm --filter @sd-design/sd-vue-docs run build:site
```

- 先跑受影响 Core / Cypress / E2E 用例，再按变更范围扩大检查；不存在 Foundation 时不运行占位测试路径。
- 样式或 token 变化需运行 `test:styles` 和主题相关浏览器用例。`icongen` 经 `theme:generate` 准备 Core 与主题生成文件，检查生成差异是否与本次变更一致。
- 正式组件需验证类型、模块/样式/声明产物、Core 依赖与必要的旧深入口；只跑 `build:module` 不能证明完整发布链路。
- 文档变更需同步最新 vendor、构建站点并打开真实页面验证交互。需启动时使用根目录 `dev` 或核实后的 docs 开发入口；构建成功不等于浏览器验证通过。
- 要求“整体流程”或发布验收时，按当前根脚本覆盖安装、静态/类型检查、完整构建、组件测试、打包消费和 docs E2E。
- 检查失败时区分本次引入与基线问题，记录实际执行的检查与未覆盖范围，不把模拟端口测试当作真实浏览器或其它框架验证。

## 发布级检查

如果用户要求的是“正式组件”而不是临时骨架，结束前再检查这些项：

- 导出名、类型名、事件名、slot 名是否适合长期保留
- 文档 API 与源码注释是否一致
- 组件在 docs 中是否可被正常理解和发现
- 是否影响同类组件的一致性
- 是否需要更新变更日志、版本说明或发布说明
- 是否需要补 migration note 或 breaking change 说明

如果任务触及现有 public API，默认把兼容性风险写进最终说明。

## 完成标准

只有同时满足下面条件，才算组件真正完成：

- Foundation、原生驱动与 Vue Adapter/View 职责明确，Core 不依赖 Vue
- 组件源码可读且 API 清晰，重构保留约定的兼容入口与行为
- 共享 SCSS/token 位于 Core，Vue 样式转发、根入口与主题生成链路齐全
- 公共导出入口已同步
- 插件安装入口已同步
- Core 规则/端口测试与 Vue Cypress 行为测试按职责补齐，受影响 E2E 和共享测试已同步
- demo 测试已补齐
- 文档页已补齐
- 文档总览页和侧边栏等发现入口已补齐
- 文档中的 `DemoBlock` 预览已验证，不存在“在线编辑器可用但文档示例首轮交互无效果”的断层
- 如果是组件组、复合组件或服务式能力，对应的额外导出和调用入口已补齐
- 关键命令已验证，或明确说明为什么本次未验证

更严格地说，只有当下面三个问题都能回答“是”时，才算真正完成：

- 使用者能从 API 和文档直接理解怎么用吗
- 维护者能从结构和测试直接理解怎么改吗
- CI 或本地验证链路能证明这次改动没有明显断层吗

有任一答案是否定，都不应把任务表述成“完全完成”。

## 常见遗漏

- 只写了 `<component-name>.vue`，忘了 `index.ts`
- 只补了 `packages/web-vue/components/index.ts`，忘了 `packages/web-vue/components/sd-vue.ts`
- 忘了 `packages/web-vue/components/components.ts` 的全局组件类型声明
- 忘了 `packages/web-vue/components/index.scss` 的根样式入口
- 样式写进组件里，却没补 `style/index.ts`
- token 没抽出来，导致 `index.scss` 堆满魔法值
- 只写功能测试，没写 `demo.cy.ts`
- 共享逻辑仍依赖 Vue，或在多个 Adapter 中重复实现规则
- token 只放在 Vue，遗漏 Core 主题扫描与生成链路
- 只测 Foundation，漏掉受控回写、slot、上下文和生命周期接线
- 只写 MDX 页面，没有核实 generated demo 到底是不是当前仓库里的手工源
- 文档写了 props，却漏了 events 或 slots
- 使用不存在的仓库脚本名
- 改了 public API，却没在最终说明里提示兼容性影响
- 新增了子组件或静态方法，却没补类型导出
- 参考了多形态组件，却错误地套到了单组件流程
- 文档 demo 很多，但没有一个覆盖推荐用法

## 常见反模式

- 把组件写成“所有能力都靠一个巨大 props 表驱动”的万能组件
- 因为想复用，把模板和状态拆得过碎，最后比相邻组件更难读
- 用实现细节命名 public props / events
- 过度追求抽象，导致 docs 很难写、测试很难断言
- 组件本体可用，但样式 token 不可复用、不可维护
- demo 看起来很多，但用户仍看不懂主路径用法

如果出现这些反模式，优先回退到和相邻成熟组件一致的简单方案。

## 可优化项

在基线已经完成的前提下，可以继续检查这些优化点：

### 1. a11y

- 是否补足语义角色
- 是否需要 aria 属性
- 是否支持键盘交互
- 是否有焦点可见性问题

### 2. API 一致性

- 是否和同类组件保持命名一致
- 是否能减少歧义 props
- 是否明确 slot 与 props 的优先级

### 3. 测试稳健性

- 是否过度依赖快照
- 是否遗漏边界态
- 是否存在只测结构不测行为的问题

### 4. 文档质量

- 标题是否是用户语言
- demo 排序是否自然
- API 表和正文是否互补，而不是互相重复

### 5. 样式可维护性

- token 是否语义清晰
- 选择器是否过深
- 是否存在难以复用的局部魔法值

### 6. 未来扩展性

- 新增能力是否还能平滑扩展
- 是否已经把未来空间提前锁死
- 是否需要预留 slots、types 或 helper exports

## 输出要求

执行这个 skill 时，最终输出至少要告诉用户：

1. 改了哪些关键区域。
2. 哪些验证已经完成。
3. 哪些风险或未完成项仍然存在。

如果有兼容性影响，再加第 4 项：

4. 哪些 public API 或使用方式发生了变化。

推荐直接按这个收尾模板输出：

```md
已完成：

- ...

已验证：

- ...

剩余风险：

- ...
```

如果用户是让你“先搭骨架”，也要明确说明哪些文件已经建好，哪些内容只是占位，避免让用户误以为组件已可发布。

如果用户要的是“最终可合并版本”，不要用“已完成骨架”这种表述模糊交付状态。

## 示例触发语句

- “给我的 web-vue 组件库新增一个 Empty State 组件，按现有 alert 那套结构来。”
- “帮我补一个组件，包括样式 token、测试、文档页和导出入口。”
- “把这个内部 Vue 组件整理成正式组件库组件，并接到 docs 里。”
- “按照仓库规范创建一个带 props、events、slots 和文档 demo 的新组件。”
- “给 progress 这种多形态组件补齐文档和测试。”
- “把一个带 ButtonGroup / 子组件导出的组件按现有组件库规范落地。”
- “把一个现有内部组件升级成正式公共组件，并一次性补齐导出、测试、文档、验证。”
- “按仓库里最严格的标准实现一个可发布的组件，不要只搭骨架。”
- “给 message / drawer 这类带函数式调用的能力补源码、测试和文档。”
