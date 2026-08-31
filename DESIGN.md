---
version: stable
name: sd-design
description: 面向现代中后台与工具型产品的 Vue 3 设计系统。视觉语言以字节跳动系产品的清晰、轻量、高效为基调，以业界成熟设计系统为风格参照，以 sd-design 当前实现为工程约束与颜色唯一事实源。

colors:
  primary-1: '#E8F3FF'
  primary-2: '#BEDAFF'
  primary-3: '#94BFFF'
  primary-4: '#6AA1FF'
  primary-5: '#4080FF'
  primary-6: '#165DFF'
  primary-7: '#0E42D2'
  primary-8: '#072CA6'
  primary-9: '#031A79'
  primary-10: '#000D4D'
  success-6: '#00B42A'
  warning-6: '#FF7D00'
  danger-6: '#F53F3F'
  neutral-1: '#F7F8FA'
  neutral-2: '#F2F3F5'
  neutral-3: '#E5E6EB'
  neutral-4: '#C9CDD4'
  neutral-5: '#A9AEB8'
  neutral-6: '#86909C'
  neutral-7: '#6B7785'
  neutral-8: '#4E5969'
  neutral-9: '#272E3B'
  neutral-10: '#1D2129'
  white: '#FFFFFF'
  black: '#000000'

typography:
  font-family: "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif"
  display-3: 56px
  display-2: 48px
  display-1: 36px
  title-3: 24px
  title-2: 20px
  title-1: 16px
  body-3: 14px
  body-2: 13px
  body-1: 12px
  caption: 12px
  line-height-base: 1.5715

rounded:
  none: 0
  small: 2px
  medium: 4px
  large: 8px
  circle: 50%

spacing:
  1: 2px
  2: 4px
  3: 6px
  4: 8px
  5: 10px
  6: 12px
  7: 16px
  8: 20px
  9: 24px
  10: 32px
  11: 36px
  12: 40px
  13: 48px
  16: 64px
  18: 80px

components:
  control-mini:
    height: 24px
    radius: '{rounded.medium}'
  control-small:
    height: 28px
    radius: '{rounded.medium}'
  control-medium:
    height: 32px
    radius: '{rounded.medium}'
  control-large:
    height: 36px
    radius: '{rounded.medium}'
  primary-action:
    background: 'rgb(var(--sd-primary-6))'
    foreground: '{colors.white}'
    hover: 'rgb(var(--sd-primary-5))'
    active: 'rgb(var(--sd-primary-7))'
  surface:
    page: 'var(--sd-color-bg-1)'
    container: 'var(--sd-color-bg-2)'
    popup: 'var(--sd-color-bg-5)'
    border: 'var(--sd-color-border-2)'
---

# sd-design 设计指南

## 1. 定位

sd-design 服务于现代中后台、数据工具和效率型产品。它追求字节跳动系产品常见的体验气质：信息清楚、结构克制、反馈及时、密度适中，同时允许业务通过主题变量形成自己的品牌表达。

设计时参照 `vendor/arco-design-vue` 与 `vendor/semi-design` 两套成熟设计系统，吸收它们在布局、层级、状态和组件表达上的通用经验；但所有颜色必须来自 sd-design 的色板与 token，实现必须落到 sd-design 的组件 API 和 Vue 3 工程体系中。

一句话原则：**稳定的默认体验，清晰的语义层级，受约束的主题自由。**

## 2. 规范优先级

发生冲突时，按以下顺序决策：

1. 可访问性、可用性和信息正确性。
2. sd-design 的色板与 token 体系（颜色唯一事实源），以及对外 API 与已发布交互行为的稳定性。
3. 本指南定义的视觉和交互原则；组件现状与指南冲突时，视觉细节以指南为准，通过版本化变更向指南收敛。
4. 成熟参考设计系统中已被反复验证的设计方法（本地参照 `vendor/arco-design-vue`、`vendor/semi-design`）。
5. 单个业务的视觉偏好。

外部组件库只作为设计研究和行为对照，不是运行时依赖，也不是颜色来源。颜色必须取自 sd-design 色板与语义 token（见 5.1），不得直接复制外部色值、类名或私有实现。

## 3. 核心设计原则

### 3.1 清晰优先

- 一屏只突出一个主要任务，主操作使用 primary，次操作使用 secondary、outline 或 text。
- 通过标题、正文、辅助信息和分隔关系建立层级，不依赖大面积装饰色。
- 同一语义在不同组件中保持一致：蓝色表示主操作和链接，绿色表示成功，橙色表示警告，红色表示危险或错误。
- 文案直接描述动作或结果，避免脱离上下文的“确定”“知道了”。

### 3.2 轻量而不单薄

- 优先使用留白、浅色填充和细边框组织内容。
- 阴影只表达真实浮层关系，不用于普通卡片装饰。
- 圆角克制，以 4px 为默认；大容器可使用 8px，小型结构可使用 2px。
- 颜色集中在关键动作、状态反馈和必要的视觉强调上。

### 3.3 高效且一致

- 默认 14px 正文和 32px 中号控件，适配高频操作的中后台场景。
- 相同尺寸、状态和交互在 Button、Input、Select、DatePicker 等控件之间对齐。
- 优先复用已有组件和 token；不要为单个页面创造新的按钮语法、状态色或间距体系。
- 复杂任务采用渐进披露：先展示高频选项，再提供高级设置。

### 3.4 稳定默认，开放主题

- 默认主题必须无需业务二次设计即可使用。
- 主题定制通过全局语义 token 或组件 token 完成，不通过页面级选择器覆盖组件内部 DOM。
- 浅色与暗色模式保持相同语义引用，让主题层负责换值。
- 定制不能破坏对比度、状态区分、焦点可见性和组件尺寸契约。

## 4. Design Token 架构

sd-design 使用三层 token 思维：

```text
基础色板与基础尺度
        ↓
全局语义 token
        ↓
组件 token
```

### 4.1 基础层

基础层描述没有业务含义的原始值，例如 `sdblue-1` 至 `sdblue-10`、`gray-1` 至 `gray-10`、字号、间距、尺寸、圆角和阴影。基础层只在设计系统内部使用，业务界面通常不应直接消费。

### 4.2 语义层

语义层表达用途：

- `--sd-primary-*`：主操作与品牌强调。
- `--sd-success-*`、`--sd-warning-*`、`--sd-danger-*`：反馈语义。
- `--sd-color-text-*`：四级文字层级。
- `--sd-color-bg-*`：页面、容器与浮层背景。
- `--sd-color-fill-*`：控件和交互填充。
- `--sd-color-border-*`：四级描边。

业务页面应优先使用这一层，因为它能够自动适配暗色主题。

### 4.3 组件层

组件层负责 Button、Input、Card、Modal 等具体结构和状态。组件样式文件中的 `style/token.scss` 应引用全局语义 token；只有组件确有独立设计含义时，才新增组件 token。

禁止在组件状态中重新发明品牌色、成功色、警告色或危险色。

## 5. 色彩

### 5.1 唯一颜色来源

所有产品和组件颜色必须来自以下文件定义的 sd-design 色板与语义变量：

- `packages/web-vue/components/style/color/colors.scss`
- `packages/web-vue/components/style/color/css-variables.scss`
- `packages/web-vue/components/style/theme/global.scss`
- `packages/web-vue/components/style/theme/css-variables.scss`

禁止在业务样式中写新的十六进制颜色、RGB 颜色或与现有 token 重复的透明色。外部设计系统色板一律不作为取色来源；即便色值巧合相同，也必须通过 sd token 引用。若现有颜色确实无法表达新语义，应先在设计系统层评审并补充 token，再由组件消费。

### 5.2 品牌主色

sd-design 的品牌主色是 `primary-6`：`#165DFF`，运行时写法为：

```scss
color: rgb(var(--sd-primary-6));
```

交互状态遵循稳定的色阶关系：

| 状态   | Token                                     | 作用                     |
| ------ | ----------------------------------------- | ------------------------ |
| 默认   | `--sd-primary-6`                          | 主按钮、选中态、关键强调 |
| Hover  | `--sd-primary-5`                          | 可交互元素悬浮           |
| Active | `--sd-primary-7`                          | 按下或激活               |
| Focus  | `--sd-primary-3` 或既有 focus token       | 焦点轮廓或浅色外环       |
| 弱背景 | `--sd-color-primary-light-1`              | 轻量选中背景、提示底色   |
| 禁用   | `--sd-color-primary-light-3` 配合禁用文字 | 不可操作状态             |

不要仅用颜色区分 Hover、Active、Selected 和 Disabled；同时使用填充、描边、透明度、图标或文案建立可感知差异。

### 5.3 功能色

| 语义 | 基准 Token       | 基准色    | 使用范围                     |
| ---- | ---------------- | --------- | ---------------------------- |
| 成功 | `--sd-success-6` | `#00B42A` | 成功结果、完成状态、正向反馈 |
| 警告 | `--sd-warning-6` | `#FF7D00` | 风险提醒、需要关注但可继续   |
| 危险 | `--sd-danger-6`  | `#F53F3F` | 错误、破坏性操作、失败状态   |
| 链接 | `--sd-link-6`    | `#165DFF` | 文本链接与可导航内容         |

功能色必须表达语义，不能作为普通装饰。错误信息应同时包含明确文字；危险按钮仅用于不可逆或高风险动作。

### 5.4 中性色与内容层级

浅色主题下，使用语义变量而不是直接挑选灰阶：

| 用途                     | Token               |
| ------------------------ | ------------------- |
| 标题与主要正文           | `--sd-color-text-1` |
| 次要正文与说明           | `--sd-color-text-2` |
| 辅助信息                 | `--sd-color-text-3` |
| 占位、禁用、最低层级信息 | `--sd-color-text-4` |
| 页面背景                 | `--sd-color-bg-1`   |
| 主容器背景               | `--sd-color-bg-2`   |
| 次级容器背景             | `--sd-color-bg-3`   |
| 三级容器背景             | `--sd-color-bg-4`   |
| Popup、Dropdown 等浮层   | `--sd-color-bg-5`   |

普通正文不要使用 `--sd-color-text-4`。弱化信息仍需可读，不能通过无限降低对比度制造层级。

### 5.5 暗色模式

暗色模式由 `[sd-theme='dark']` 覆盖基础色板和语义变量。组件必须继续引用相同的 `--sd-color-*` / `--sd-*-*` 变量，不应在组件内部自行判断主题并硬编码颜色。

- 暗色页面由 `--sd-color-bg-1` 开始，容器依次使用 `--sd-color-bg-2` 至 `--sd-color-bg-5`。
- 暗色文字使用主题提供的 90%、70%、50%、30% 四级白色透明度关系。
- 主色在暗色主题中自动调整为更明亮的色阶；不要沿用浅色主题的字面色值。
- 阴影在暗色界面中作用有限，优先使用背景层级与描边分隔。

### 5.6 遮罩色

Modal、Drawer、ImagePreview 等模态浮层的遮罩统一使用 `--sd-color-mask-bg`（`gray-10` 基色加 60% 透明度，暗色主题由 token 自动换值）。遮罩用于突出模态内容，不作为普通装饰背景。

## 6. 字体排版

### 6.1 字体

默认字体栈以 Inter 和系统字体为主，中文依次回退到苹方、思源黑体和微软雅黑。不要在组件内部声明独立字体；代码内容使用项目已有的 `Consolas, Menlo` 等宽字体栈。

### 6.2 字号层级

| 层级      | 字号 | 建议字重 | 场景                                            |
| --------- | ---- | -------- | ----------------------------------------------- |
| Display 3 | 56px | 600      | 极少量品牌展示页主标题                          |
| Display 2 | 48px | 600      | 展示页主标题                                    |
| Display 1 | 36px | 600      | 页面英雄区标题                                  |
| Title 3   | 24px | 600      | 页面一级标题、关键数字                          |
| Title 2   | 20px | 600      | 模块标题、Modal 标题                            |
| Title 1   | 16px | 500–600  | 卡片标题、分组标题                              |
| Body 3    | 14px | 400      | 默认正文、表单、按钮                            |
| Body 2    | 13px | 400      | 紧凑辅助信息（sd 扩展层级，新界面优先 12/14px） |
| Body 1    | 12px | 400      | 次要说明、表格辅助信息                          |
| Caption   | 12px | 400      | 标签、注释、时间戳                              |

正文默认行高为 `1.5715`。标题行高应更紧凑，正文和说明文本应保持稳定的阅读节奏。数字密集界面优先使用等宽数字特性，保证表格列与统计值易于比较。

### 6.3 文本原则

- 一个容器中通常不超过三个明显字号层级。
- 用字号、字重和间距共同建立层级，不用颜色替代排版。
- 正文优先 14px；12px 只用于辅助内容，不承载长篇正文或关键操作。
- 避免全大写英文、过度加粗和过密字距。
- 中文标点、数字单位、日期时间与空状态文案在同类组件中保持一致。

## 7. 尺寸、间距与布局

### 7.1 控件尺寸

sd-design 的标准控件高度为：

| Size   | 高度 | 使用场景                           |
| ------ | ---- | ---------------------------------- |
| Mini   | 24px | 极紧凑表格内操作、密集工具条       |
| Small  | 28px | 紧凑筛选区、次级操作               |
| Medium | 32px | 默认表单和常规操作                 |
| Large  | 36px | 重点表单、低密度页面、触控友好区域 |

同一操作区中的 Button、Input、Select、Cascader 和 DatePicker 应采用相同尺寸。不要用自定义 padding 模拟不存在的组件尺寸。

### 7.2 间距

间距以 2px 为最小单位，常用结构优先选择：

- 2–6px：图标微调、紧密内联元素。
- 8–12px：控件内部、标签与图标、紧凑列表。
- 16–24px：表单项、卡片内边距、模块内分组。
- 32–48px：页面模块之间。
- 64–80px：展示型页面的大区块，不作为中后台默认间距。

新增样式应引用 `global.$spacing-*`，不要随意加入 7px、15px、18px 等孤立值；组件已有精确 token 时以组件 token 为准。

### 7.3 栅格和容器

- 页面结构遵循“全局导航 → 页面标题/操作区 → 主内容”的稳定顺序。
- 页面栅格基于 24 列的 Grid（Row/Col）组件建立，列间距使用既有间距 token。
- 表单标签、输入区和帮助信息保持对齐；同组字段间距一致。
- 卡片用于建立独立信息单元，不把每一段内容都包成卡片。
- 数据密集页面优先保证横向比较和固定操作位置，再考虑视觉留白。
- 响应式布局应保持任务顺序：缩窄时先减少列数，再折叠次要信息，最后才允许横向滚动。

## 8. 圆角、描边与阴影

### 8.1 圆角

| Token                       | 值  | 场景                               |
| --------------------------- | --- | ---------------------------------- |
| `--sd-border-radius-none`   | 0   | 表格拼接、需要连续边界的结构       |
| `--sd-border-radius-small`  | 2px | 小型内部结构、紧凑标记             |
| `--sd-border-radius-medium` | 4px | 默认按钮、输入框、下拉项、卡片     |
| `--sd-border-radius-large`  | 8px | Modal、Drawer 内的大容器、展示卡片 |
| `--sd-border-radius-circle` | 50% | Avatar、圆形图标按钮、状态点       |

同一组件的外层与内层圆角要有包含关系。不要把所有组件改成胶囊形；胶囊只适用于语义明确的 Tag、筛选项或特殊按钮。

### 8.2 描边

- 默认使用 1px 边框和 `--sd-color-border-*`。
- 交互边框从 neutral 语义切换到 primary 或功能色语义。
- Selected 与 Focus 不能完全共用同一种视觉表达：Selected 表示状态，Focus 表示当前键盘位置。
- 相邻容器优先用单条分隔线，避免重复边框形成 2px 深线。

### 8.3 阴影

sd-design 的阴影分为三档，模糊半径分别为 5px、10px、20px，并提供方向变体。

- 一级：轻量悬浮、固定工具条、局部浮起。
- 二级：Dropdown、Popover、Picker 面板。
- 三级：Modal、Drawer 或需要明显脱离页面的高层内容。
- 普通 Card 默认依靠背景和描边，不默认使用强阴影。

阴影必须与层级一致；同一页面不要为相同层级使用不同强度。

### 8.4 层级（z-index）

浮层层级使用 `theme/index.scss` 中的既有 SCSS token，不自定义数值、不随意提升层级：

| Token | 值 | 场景 |
| --- | --- | --- |
| `$z-index-affix` | 999 | Affix 等固定元素 |
| `$z-index-popup` | 1000 | Trigger、Dropdown、Popover、Tooltip、Select 等浮层 |
| `$z-index-drawer` / `$z-index-modal` | 1001 | Drawer、Modal、ImagePreview |
| `$z-index-message` / `$z-index-notification` | 1003 | 全局消息与通知 |

## 9. 图标与图形

- 图标帮助识别动作，不能替代关键文案；仅图标按钮必须提供可访问名称和 Tooltip。
- 默认图标尺寸与当前控件尺寸匹配，不因视觉空旷而任意放大。
- 图标描边粗细、端点风格和视口应保持一致，优先使用 sd-design 图标库。
- 状态图标使用对应功能色，但必须配合文字或形状，不以颜色作为唯一提示。
- 插图仅用于 Empty、Result、引导和品牌展示，不进入高频操作路径制造噪音。

## 10. 交互状态

每个可交互组件至少定义以下状态：

| 状态          | 设计要求                                     |
| ------------- | -------------------------------------------- |
| Default       | 明确可操作性与当前值                         |
| Hover         | 轻量强调，不能造成布局位移                   |
| Active        | 即时反馈按下行为，强度高于 Hover             |
| Focus-visible | 清晰、连续、不会被容器裁切的焦点指示         |
| Selected      | 持久表达已选择，与 Focus 分离                |
| Disabled      | 降低强调并阻止交互，但内容仍可识别           |
| Loading       | 保持组件尺寸，防止重复提交，说明任务仍在进行 |
| Error         | 功能色、图标与可行动文案共同说明问题         |

Hover 只服务于支持指针的环境。关键能力不能依赖 Hover 才能发现。

## 11. 动效

动效的目标是解释状态变化和空间关系，不是展示技术效果。

### 11.1 时长

- 0.1s：颜色、透明度、轻量按钮反馈。
- 0.2s：小型位移、展开收起、Popover 进入。
- 0.3s：Modal、Drawer、复杂面板切换。
- 0.4–0.5s：只用于大范围且需要被理解的过渡。
- 1s：循环 loading 基准，不用于普通进入动画。

### 11.2 缓动

- Linear：`cubic-bezier(0, 0, 1, 1)`，匀速过渡，用于循环与进度类动效。
- Standard：`cubic-bezier(0.34, 0.69, 0.1, 1)`，默认状态过渡。
- Decelerate：`cubic-bezier(0.4, 0.8, 0.74, 1)`，元素进入。
- Accelerate：`cubic-bezier(0.26, 0, 0.6, 0.2)`，元素离开。
- Overshoot：`cubic-bezier(0.3, 1.3, 0.3, 1)`，仅用于确有物理感的微型反馈。

避免同时动画过多属性；优先使用 `opacity` 和 `transform`。所有非必要动效必须响应 `prefers-reduced-motion`，并复用现有 `reduced-motion.scss` 约定。

## 12. 组件设计规则

### 12.1 Button

- 每个任务区域通常只有一个 primary 主按钮。
- 默认操作用 primary；普通并列操作用 secondary；低权重操作用 text；危险操作使用 danger 语义。
- 按钮文案使用动词开头，如“创建项目”“保存修改”“删除成员”。
- Loading 时保持原宽高，避免操作区跳动。

### 12.2 表单控件

- Label、控件、帮助文本和错误文本形成固定垂直节奏。
- Placeholder 提供输入示例或格式，不代替 Label。
- 校验尽量在用户完成当前字段后发生；服务端错误应落到对应字段或表单顶部摘要。
- 同一表单不要混用多种控件高度。

### 12.3 Table 与数据展示

- 表头、数据、汇总和操作列对齐；数值默认右对齐，文本默认左对齐。
- 只保留帮助扫描的分隔线，避免完整棋盘格。
- 行 Hover 用 fill token，选中态用 primary-light token，两者应能区分。
- 行操作保持稳定位置；低频操作收进 Dropdown，但危险操作必须有确认与结果反馈。

### 12.4 Card

- Card 表达一个完整信息单元，应有明确标题或内容边界。
- 默认使用 `--sd-color-bg-2` 与 border token；不使用大面积品牌色背景。
- 卡片嵌套不超过两层，嵌套层优先通过间距和背景区分。

### 12.5 Modal、Drawer 与浮层

- Modal 用于必须中断当前流程的确认或短任务；Drawer 用于保留上下文的查看和编辑。
- 标题说明任务，正文解释影响，底部操作顺序保持一致。
- Dropdown、Tooltip、Popover 使用 `--sd-color-bg-5` 和既有 popup 阴影。
- 浮层必须支持 Escape、合理的焦点进入/返回和点击外部行为。

### 12.6 Feedback

- Message 用于轻量即时结果；Notification 用于可延后处理的信息；Alert 用于页面内持续状态；Result 用于流程结论。
- 成功反馈简短，错误反馈必须告诉用户发生了什么以及下一步怎么做。
- 不用 Toast 承载必须记住、需要复制或需要进一步操作的关键信息。

## 13. 可访问性

- 正文与背景对比度目标至少 4.5:1，大号文本至少 3:1；控件边界和状态图形至少 3:1。
- 所有功能可通过键盘完成，Tab 顺序与视觉顺序一致。
- 使用 `:focus-visible` 提供清晰焦点，不无条件移除 outline。
- 图标按钮、输入框、错误提示和浮层使用正确的 HTML / ARIA 语义。
- 错误、成功、选中和禁用状态不能只依赖颜色。
- 点击目标在触控场景中应具备足够区域；24px/28px 紧凑控件仅用于明确的桌面高密度场景。
- 动态通知应选择合适的 live region，避免重复播报和打断输入。

## 14. 响应式与国际化

- 组件从内容出发，不依赖固定中文宽度；为英文长词、数字、日期和多语言预留弹性。
- 窄屏中保持主要操作可见，次要操作可进入更多菜单。
- 表格先尝试隐藏次要列、固定关键列，再使用横向滚动。
- 避免通过绝对定位固定文案；文本放大到 200% 时，功能仍应可用。
- 方向性图标和布局应考虑 RTL；日期、时间、数字和复数交由本地化能力处理。

## 15. 设计与实现工作流

新增或优化组件时按以下顺序执行：

1. 明确用户任务、信息优先级和完整状态集合。
2. 研究参考设计系统（`vendor/arco-design-vue`、`vendor/semi-design`）同类组件的通用行为和交互边界。
3. 检查 sd-design 是否已有可复用组件、全局 token 或组件 token。
4. 使用 sd-design 色彩与尺度完成设计，不导入外部色值。
5. 实现 Default、Hover、Active、Focus-visible、Selected、Disabled、Loading、Error 等适用状态。
6. 同时验证浅色、暗色、键盘、长文本、窄容器和 reduced motion。
7. 在最终渲染 DOM 上检查尺寸、属性透传、Teleport 浮层和焦点行为。
8. 更新组件文档、示例、测试与必要的 token 说明。

## 16. 评审清单

提交设计或代码前逐项确认：

- [ ] 颜色全部来自 sd-design token，没有引入外部或临时色值。
- [ ] 主操作唯一且明确，信息层级无需依赖装饰理解。
- [ ] 字号、圆角、间距、尺寸和阴影来自现有尺度。
- [ ] 组件状态完整，Hover、Focus、Selected、Disabled 可区分。
- [ ] 浅色与暗色模式都通过相同语义 token 工作。
- [ ] 键盘可操作，焦点可见，语义和 ARIA 正确。
- [ ] 文本扩展、空数据、错误、Loading 和窄容器不会破坏布局。
- [ ] 动效服务于理解，并适配 reduced motion。
- [ ] 组件 API、样式 token、文档、测试和最终 DOM 保持一致。

## 17. 工程事实源

本指南描述设计方向；代码决定当前可用能力。实现和评审时以以下位置为准：

- 色板：`packages/web-vue/components/style/color/colors.scss`
- 色板 CSS Variables：`packages/web-vue/components/style/color/css-variables.scss`
- 全局尺度与语义 token：`packages/web-vue/components/style/theme/global.scss`
- 主题 CSS Variables：`packages/web-vue/components/style/theme/css-variables.scss`
- 字体、动效和层级：`packages/web-vue/components/style/theme/index.scss`
- 组件 token：`packages/web-vue/components/<component>/style/token.scss`
- 组件样式：`packages/web-vue/components/<component>/style/index.scss`

当本指南与代码不一致时，不应静默选择其中一方：先确认是文档滞后还是实现偏离，再以一个可验证的变更让两者重新一致。
