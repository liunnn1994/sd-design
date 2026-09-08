# 组件测试覆盖扫描 — 待产品决策问题清单（2026-09）

> 来源：2026-09 全组件 e2e 测试覆盖扫描（约 95 个组件）。以下问题**均未修改代码**，仅记录。每条注明组件、位置（file:line 为扫描时状态）与影响。已修复的 7 个 bug 见 git log（fix: 🐛 提交）。分级建议：🔴 建议尽快修复；🟡 行为/语义需确认；🟤 轻微/清理项。

## A. 表单与输入

### input

- 🟡 `input-password.vue:4` — `visibility` 语义与 JSDoc 相反（`defaultVisibility: true` 渲染为**掩码**态）。经比对为 arco 上游继承的翻转（`invisible`→`visible` 改名时三元未翻转），规格测试已按实际行为固化。

### input-number

- 🟡 `input-number.vue:289-295,333-346` — 输入非法文本（如 `abc`）后 DOM 值与模型失同步：非法输入留在输入框，blur 时 `update:modelValue: undefined` 不回写。
- 🟡 `input-number.vue:336` — `Number('Infinity')`、`Number('')` 通过 isNumber 守卫，`Infinity` 可成为值。
- 🟤 `input-number.vue:324` — `handleStepButton` 在 disabled 守卫前就 focus 输入框。

### textarea

- （无发现）

### input-mask

- 🟡 `input-mask.vue` — `maskChar` 有值时占位字符（`_`）泄漏进 `update:modelValue`（如 `'2___-__-__'`），与 `maskChar: null` 语义及 react-input-mask 不一致（可安全回读，可能是故意设计）。
- 🟡 `input-mask.vue` — 挂载时 `complete` 从不建立：watch 非 immediate，以完整 `modelValue` 挂载不 emit `complete`。
- 🟤 `input-mask.vue` — `modelValue` watcher 对 `undefined` 提前返回，父级无法用 undefined 重置。
- 🟤 preset 路径 `commitValue` 拒绝中段插入时光标钳制位置漂移 1 格。

### verification-code

- 🟡 `verification-code.vue` — 不完全受控：父组件传 `modelValue` 但忽略 `update:modelValue` 时，输入仍会持久化（无 Input 的 `keepControl` 等价物）。
- 🟡 `verification-code.vue` — 无 `defineExpose`（无 focus/blur 暴露，与同类组件不一致）。
- 🟤 尾部分隔符在每个 cell 后都渲染（含最后一个，与上游一致）；`handleInput` 对 trim 值与原始值的索引混用。

### checkbox

- 🔴 `checkbox.vue:101,104` — **`defaultChecked` 初始不生效**（实测 `internalChecked = ref(props.defaultChecked)` 后 `computedValue` 链路仍返回未勾选；radio 无此问题）。
- 🟡 组内子项未传 `value` 时静默向组数组贡献布尔 `true`（`resolvedValue = props.value ?? true`）。

### radio / rate

- 🔴 `rate.vue:~272` — `getCharacterColor()` 用 `parsedDisplayIndex`（最后填充档位的颜色）而非 `index` 给每颗星着色，`color="{1:'green',3:'red'}"` 时 1–3 全红。
- （radio 无发现）

### switch

- 🔴 `switch.vue:290-299` — `beforeChange` promise 被拒绝时无 catch → unhandled rejection（规格测试因此无法覆盖拒绝路径）。

### select / cascader / auto-complete / mention

- 🟡 `select.vue:645` — `fallbackOption: false` 时模型中的未知值在后续选择中被静默替换为 `''`。
- 🟡 `interface.ts:97-137` — `SelectProps` 陈旧：缺 `readonly/spinProps/fitWidth/maxWFull/floatingOptions`。
- 🟤 `select.vue:732-738` — 单选禁用选中项时 clear 仍发冗余 change。
- 🟡 `cascader-panel.vue:124-148` — options watch 缺 `deep: true`（cascader.vue 上有）。
- 🟡 `cascader-panel.vue:242-243` — provide 传 `expandTrigger.value`/`ellipsis.value`（非响应式），独立面板上改 prop 无效。
- 🟡 `auto-complete.vue:216-217` — `strict` 过滤对字符串数据失效（读 `option.label` 为 undefined，一输入就关闭下拉）。
- 🟡 `auto-complete.vue:36-40` — group 选项渲染为可选 option，点击后 emit select/change `undefined`。
- 🔴 `mention.vue:273` — 多字符前缀 off-by-one：`tail = slice(measureEnd + 1)` 假设 prefix 长度为 1，`prefix="##"` 选择后尾部文本重复进值。
- 🟡 `mention.vue` — textarea 变体挂载竞态：真实 ResizeObserver 回调早于 `onMounted` 赋值 `styleDeclaration` → `getSizeStyles(undefined)` 抛错。
- 🟤 `mention.vue:232` — `filterOption` 硬编码 `ref(true)`，无法关闭过滤。

### form / json-form

- 🟡 `form.vue:117-120,247` — `scrollToFirstError` 声明 `Boolean` 但按 scrollIntoView options 对象使用（运行时靠 Vue 不截断才工作），类型契约应 `Boolean | Object`。
- 🟡 `context.ts:63` vs `form-item.vue:438-459` — `FormItemInfo.validate` 类型声明返回 record，实际返回单个 error。
- 🟤 `form-item.vue:594` — `wrapper-col-flex` class 条件恒 false（死代码）；`form.vue:179` `touchedFields` 死代码；`form-item.vue:440` 局部 `isError` 遮蔽组件级 computed。
- 🔴 `json-form-item.vue:17,33` — A2UI + slotName/render 分支把原始 JSON-Pointer（`/contact/name`）当 FormItem field，required 校验永远读不到真实值（默认控件分支用了 `normalizedField`）。
- 🟡 `json-form` — `update:modelValue` 从不 emit（`setJsonFormValue` 就地变更共享对象），父组件用不可变更新收不到变更。
- 🟤 A2UI ChoicePicker `displayStyle: 'chips'` 被忽略（一律 checkboxGroup）；非字面 label（`{path}` 绑定）解析为 undefined 静默丢 label。

### transfer / tree-select

- 🟡 `transfer-view.vue:148` — 全选时 `[...props.selected, ...allValidValues]` 不去重：`defaultSelected`/`selected` 与面板相交时 select/update:selected 载荷出现重复 key。
- 🟡 `transfer-view.vue:165` — `search` 事件只随 Input change（blur/Enter/清空）触发，与 JSDoc"用户搜索时触发"读感不符（与上游一致）。
- 🟤 `tree-select` — `defaultExpandAll` 默认 true（上游 arco 为 false），迁移行为差异值得确认。

### 上传

- 🟡 `upload.vue:216-227` — `abort()` 标记 error 但不发 `error` 事件（消费方收不到取消通知）。
- 🟤 `upload.vue:239` — uid `${Date.now()}-${index}` 同毫秒两批选择可能碰撞，污染 fileMap。
- 🟤 `utils.ts:39-52` — `processFileList` 死代码且每次调用重新生成 uid。

## B. 反馈与弹层

### modal / drawer / popconfirm

- 🔴 `modal.vue:710`、`popconfirm` 同构逻辑 — `onBeforeCancel() ?? false`：**回调返回 void/undefined 也会阻止取消**，与文档"仅返回 false 才阻止"矛盾（应 `?? true`）。
- 🔴 `drawer.vue:556-564` — `onBeforeOk` promise 被拒绝时 catch 后 rethrow 在 `resolve(result)` 之前 → await 的 Promise 永不落定，ok 按钮永远 loading + unhandled rejection。
- 🔴 `drawer.vue:131-134` — `defaultVisible` 是死代码（`visible` 有 `default: false`，`computedVisible = props.visible ?? _visible` 永不回退）；既有 3 个测试实际在渲染隐藏抽屉（force 点击）。
- 🟡 `modal/index.ts` — 命令式 `onClose` 在 destroy 时触发（即使非用户关闭路径），绕过组件 `close` emit 语义。
- 🟤 `modal.vue` — `handleMaskClick` 要求此前 mousedown 在 wrapper 上（防拖拽误关），纯 `click()` 合成关闭不了 mask。

### notification / message

- 🔴 `notification/index.ts` — `clear()` 只 splice 列表不清 `notificationIds`：clear 后用旧 id 重新 add 走 update 分支找不到项，**静默渲染不出任何通知**。
- 🟡 `notification/index.ts` — `update()` 强制 `resetOnUpdate: !isUndefined(config.duration)`，无 duration 的更新会把用户设置的 `resetOnUpdate: true` 覆盖回 false。
- 🟤 `notification-list.vue` — `kebabPosition`/`isRight` setup 时一次性计算，动态改 position 不更新容器类与过渡方向。
- 🟤 `message/index.ts:95` — `destroy` 直接 `removeChild(this.container)` 无守卫，容器被外部移除时抛错。

### tooltip / popover / dropdown / trigger / tour

- 🟡 `tour.vue` — `highlight()` 传 `showButtons: []` 被 `resolvedShowButtons` 视为未设置（空数组应表示"无按钮"）；`aria-controls="sd-tour-popover-content"` 指向不存在的 id；键盘处理绑在 keyup（惯例是 keydown）；打开/关闭路径双重 driveTo/teardown → `close`/`visibleChange`/`onDestroyed` 重复 emit。
- 🟡 `trigger/interface.ts:54` — 公开类型 `opendClass` 拼写错误（实际 prop 是 `openedClass`）；`popupHoverStay` 为死 prop。
- 🟤 `trigger.vue` — `scrollToClose` 只在同时开 `updateAtScroll` 时监听元素级滚动（仅窗口滚动生效；与上游一致）。
- 🟤 `popover` — `scrollbar: false` 是 no-op（`use-scrollbar.ts` 恒返回 embed）；组件 class 落在 teleport 弹层上依赖 Trigger 的 attrs 透传（脆弱）。
- 🟤 `dropdown-panel.vue:54` — `loading` prop 死代码；`isEmpty`/`scroll`/`reachBottom` 无法经 Dropdown 本体触达（仅独立面板可用）；`DropDownProps` 缺 `hideOnSelect`/`floatingOptions`。

### 图片/预览

- 🟡 `image.vue:293,295` — `wrapperClassNames` 用 `isLoaded`（ComputedRef）不带 `.value` 恒真 → 错误态也挂 `with-footer` 类。
- 🟡 `image.vue:323` — 无 `src` 时 `img.src = undefined` 变字符串 `"undefined"` 发起请求进错误态（应停在 beforeLoad）。
- 🔴 `preview.vue:379` — `watch([src, mergedVisible])` 缺 `immediate: true`：`defaultVisible: true` 的预览键盘快捷键全部失效（ESC/方向键/滚轮缩放）。
- 🟤 `image` — 文档称 description 会兜底 alt，实际仅 `:alt="alt"`。

## C. 数据展示

### table

- 🔴 `table.vue:843` — `change` 事件第三参实际 emit `TableDataWithRaw` 包装对象（`{ raw, key, ... }`），文档类型为原始 `TableData[]`，消费方 `currentData[0].name` 得 undefined。
- 🟡 `use-row-selection.ts` — 全选取消只移除 enabled keys，先选中后变 disabled 的行无法被全选取消，表头停留在半选。

### calendar（vendored）

- 🟡 `getEventsInRange` — 无 all-day 结束日的 end-of-day 扩展，`{start:'D', end:'D', allDay:true}` 完全不可见。
- 🟡 `core/config.js:~412` — `editableEvents: false` 返回数组而非对象（靠 falsy 元素碰巧工作）；`cell.vue` days 视图缺 `return`，多行 days 视图无格日期；`event.vue` 删除按钮硬编码英文 `Delete`。
- 🟤 `default-theme.scss` 用 `--out-of-scope` 而 cell.vue emit `--out-of-range`（越界格样式失效）；`event-click`/`cell-click` 等不在 defineEmits（靠 attrs 透传）。

### avatar / badge / tag / tag-group

- 🟡 `avatar.vue:225-229` — `computedTriggerIconStyle` 非响应式（setup 一次性求值）。
- 🟡 `avatar-group.vue:10-12` — 弹出层内容丢失 `sd-avatar-group-popover` 类（样式表对应规则为死 CSS，溢出头像相互重叠）。
- 🟡 `badge.vue:172-184` — `offset` 忽略 RTL（横向偏移不镜像）；`status` 设置时 `count` 静默被忽略；负数 count 直接渲染。
- 🟡 `tag.vue` — `finalBackgroundAlpha` 的 `isNil(props.bordered)` 分支死代码（bordered 默认 false）→ 非描边自定义色 tag 的透明度恒 0.8 而非文档的 1。
- 🟤 tag — `sd-tag-hide` 类不可达；checkable 键盘激活把 KeyboardEvent cast 成 MouseEvent 进 `check` payload。

### list / kv-list / comment / statistic / steps / number-flow / timeline

- 🟡 `comment.vue computedAlign` — 对象 align 缺 key 时产出 `align-undefined` class。
- 🟡 `list-item-meta.vue` — `hasContent` 非 computed（prop 动态变化不重渲染）。
- 🟡 `kv-list.vue` — `addItem()` 不 commitRows：UI 显示新行但两个 model 未同步（空 key 归一化使其"看似正确"）。
- 🟡 `statistic.vue:98` — `separator` prop 死代码；Countdown `start: false` 无法暂停已运行的倒计时（watch 只处理 true）；已过期 deadline 挂载不 emit `finish`；`start:false` 时 watch 仍覆写 displayValue。
- 🟡 `timeline.vue` — **`pending` 插槽内容从不渲染**（模板只渲染 `pending` prop 文本，`slots.pending` 未被调用；上游会渲染）；文档引用 `#pending-dot` 但实际插槽名为 `dot`。
- 🟡 `number-flow` — `animationsfinish` 按 `spinDuration+50` 调度，忽略 transformDuration/opacityDuration（淡出未完就回 idle）；字符串 `duration: '2s'` 静默回退默认值；组内未变化子项也强制全动画；`NaN` 无守卫直接渲染。
- 🟤 `page-header` — 分隔符 span 无 aria-hidden。

### watermark / qr-code / skeleton / result

- 🟡 `watermark.vue` — `getMarkSize` 测量只带 fontSize/fontFamily，绘制含 fontStyle/fontWeight → 粗体/斜体贴边裁切；`grayscale` + 跨域非 CORS 图在 `img.onload` 内对 tainted canvas getImageData 抛未捕获 SecurityError。
- 🟡 `qr-code.vue:310-318` — `boostLevel` prop 有 watch 但从不传入 QRCode options（文档级 no-op）。
- 🟡 `skeleton/line.vue` — `lines` 样式数组 setup 时构建、非响应式，rows/widths/lineHeight 变更不重渲染。
- 🟤 result — 非法 status 渲染空 icon 块（无分支命中）。

## D. 布局与导航

### layout / menu / anchor / breadcrumb / pagination

- 🟡 `use-has-sider.ts` — 静态扫描只递归数组 children，包在其它组件里的 Sider 首帧漏判（靠 Sider 自注册兜底）。
- 🟡 `sider.vue` — `update:rail` 事件名暗示 `v-model:rail` 但该模型不存在；temporary 抽屉关闭 emit `collapse` type 为 `clickTrigger`。
- 🟡 `anchor.vue:329` — **`affix` prop 失效**：`wrapperComponent` 返回字符串 `'Affix'`，但组件注册名是 `sdAffix`，实际渲染了未知的原生元素（`import Affix` 未使用即为佐证）。
- 🟡 `anchor` — `smooth` prop 从未被读取（slide 恒 300ms 动画）；`select` 第二参 preHash 恒等于新 hash（先改 currentLink 再 emit）；`a[data-href]` 回退永不匹配。
- 🟤 `breadcrumb-item.vue` — 独立使用时恒渲染尾部分隔符；重复 path/label 产生重复 key。
- 🟡 `pagination/page-item-ellipsis.vue` — 传入的 `:disabled` 未声明为 prop（泄漏为无效 li 属性，无 aria-disabled/样式/键盘守卫）。
- 🟡 `page-jumper.vue` — 跳转后输入框不重置（`nextTick` 置 undefined 但本来就是 undefined，InputNumber watcher 不触发）。
- 🟤 `pagination` — `total=0` 时 jumper 出现 min=1/max=0 的不可能区间。

### menu / steps / carousel

- （menu/steps 无功能性发现）
- 🟡 `carousel` — 无 defineExpose（文档若宣称 prev/next/goto 则是 API 缺口）；`slideTo` 以 `animationTimer` 加锁，动画期间快速点击被静默丢弃；受控 `current` 不回写时重复发相同 `change`；从最后一张指示器点击回第一张的方向类判定反了。

## E. 工具 / 交互细节

### resize-box / split / slider / space / spin / clamp / cropper

- 🟡 `resize-box.vue` — 鼠标拖动不做下限钳制（可 emit 负宽高并产出非法内联 CSS），键盘路径却钳制（两条路径不对称）。
- 🟤 `resize-box` — `onTiggerResize` 拼写；键盘基准取 clientWidth 未布局时从 0 起步。
- 🟡 `split` — `defaultSize` 违反 min/max 时挂载即 clamp 并 emit `update:size`（v-model 消费方在挂载期收到意外更新）。
- 🟡 `slider-button.vue` — 拖动注册的 window `touchmove`/`contextmenu` 监听在 mouseup 时从不移除（累积泄漏）。
- 🟡 `slider` — range 模式轨道点击只动 end handle；showInput 输入 start>end 会发出倒序值 `[70,50]`；`getOffsetPercent` 只钳下界；非 range 模式数组 modelValue 静默丢 `modelValue[0]`。
- 🟡 `spin` — standalone 模式 `-loading` class 与实际指示器可见性失同步（loading:false 时 spinner 仍渲染）。
- 🟤 `split` — 拖动结束 `body.style.cursor = 'default'` 覆盖既有值（与 resize-box 同源既有模式）。
- 🟤 `cropper.vue` — `fitSelectionToImage` 对齐只在挂载时绑定一次，换 `src` 后不重新对齐；裸 img 的 onLoad 监听 destroy 不移除；无 `$change` 回退不调用 `$render()`。

### copy / clipboard

- 🔴 `copy.vue` — `disabled` 是 Copy 的声明 prop，被 Vue 从 attrs 剥离后**永远不会传给内层触发器**（按钮渲染为可用态，仅 handleCopy 守卫拦截）。
- 🟡 `copy.vue` — `navigator.clipboard.writeText` 被拒绝时 promise 未处理：无错误事件、无任何反馈。
- 🟤 `copy` — 空 content 仍提示"复制成功"并 emit；默认 tooltip/successMessage 硬编码中文未走 locale。

### 图标 / 动效

- 🟡 `icon-plus.vue`（及全部生成图标）— `rotate` 与 `spin` 同时使用时 rotate 被 CSS 动画覆盖失效；`sd-icon-loading` 无条件动画使 spin prop 对 loading 图标冗余。
- 🟤 `icon-faceBook-circle-fill` 目录命名是 288 个图标中唯一的非 camelCase。
- 🟡 `border-beam.vue:504` — `handleAnimationEnd` 按动画名子串匹配且忽略 pseudoElement，插槽内 `fade-in-up` 类动画会误触 activate/deactivate。
- 🟡 `border-beam.vue:395,474,409` — 半径/脉冲测量用 `el.firstElementChild`（无插槽内容时测到内部 bloom div）；半径自动检测 MutationObserver 只观察 childList。
- 🟡 `typography/base.vue:~227` — `onCopyClick` 不 clearTimeout 旧 timer，copyDelay 内连点第二次会被上一次提前复位；`getInnerText` 每次调用向 body 追加一个永不移除的 aria-hidden div；`TextProps.icon` 声明未实现。
- 🟡 `bloom-menu` — header 插槽 `close` 直接作为事件处理器时 MouseEvent 会漏进 `restoreFocus` 参数；强制受控开启时内部 popupVisible 与 prop 失同步；自定义触发器丢失 morph 源快照（回退 144×44）。

### 布局细节（grid / ellipsis / empty / model-selector / config-provider / dropdown 已列）

- 🟡 `grid` — 数字断点值 `0` 被 falsy 守卫忽略（`<Col :xs="0">` 不隐藏，仅对象形式生效）；响应式 screens 初始全 true（首帧闪烁/SSR 不匹配）；prop 从数字切到响应式对象时 screens 过期。
- 🟡 `ellipsis` — `handleClick` 无事件来源检查，点击内部交互元素也会触发展开；PerformantEllipsis 激活后 2 个 nextTick 即重放 hover/focus/click，测量可能未稳定。
- 🟡 `empty.vue` — ConfigProvider 自定义 empty 分支不渲染 `$attrs`（inheritAttrs:false，id/class/data-\* 全丢）。
- 🟡 `model-selector-input.vue` — 外部 v-model 驱动显示但从不写入 `context.query`，不参与过滤；`ModelSelectorItem.renderedLabel` computed 读 textContent 可能过期；`getShortcutKeys` 按 `[+_-]` 切分，含 `-`/`_` 的键名无法表达。
- 🟡 `config-provider/theme-provider.vue` — 弹层容器 zIndex 仅在主题同步时写入，弹层栈抬高后不跟随（后开 Modal 可能盖住容器内 Trigger 弹层）；`global` prop 非响应式；多全局 provider 相互覆写。
- 🟡 `color-picker.vue` — 触发器输入框**打字不可用**（Input 的 keepControl 每次击键把 DOM 回写为受控值，`handleTriggerInputChange` 经由打字不可达）；clear 经 Input change+clear 双通道**各触发两次**；`use-control-block` setup 期捕获 value 造成陈旧闭包守卫。
- 🟡 `file-previewer.vue` — 错误提示硬编码中文；inline 模式暴露的 `close()` 重复 emit `close`；defineExpose 同函数双名。

### 主题 / config（其余）

- 🟤 `config-provider.vue` — `global` prop 非响应式（setup 一次性判断）；`toRefs(props)` 二次调用仅为 jsonForm。
- 🟤 `getPrefixCls` 返回 setup 期字符串，运行时改 prefixCls 不传播。

## F. 新增测试中记录的环境限制（非 bug，供后续维护者）

- 本地 Cypress 环境（Windows/无焦点窗口）：Transition `after-leave`/`animationend` 不可靠 → 不做动画后卸载断言；程序化 scrollTo/blur 不派生 scroll/blur 事件 → 手动 dispatchEvent；CSS :hover 无法合成 → 清除图标类按钮 force click。
- `wrapper.emitted()` 只记录挂载根自身的 $emit；date-picker 的 pickers/\* 包装层不声明 emits，事件经 $attrs 直达消费者——用 cy.spy() listener props 观察。
- RichLineClamp/SelectView 等有隐藏测量副本 → 文本断言用 contain.text / .first()，操作元素限定 `[data-part="content"]`；checkbox 原生 input 视觉隐藏 → 点击 label。
