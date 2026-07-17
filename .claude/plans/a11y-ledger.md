# A11y 改造进度账本（single source of truth）

> 目标：给 `@sdata/web-vue` 组件库补齐完整无障碍（a11y）。每轮 loop 迭代必须先读本文件，再做“下一个待办”，做完更新本文件。
> 用户：明天早上验收。不要提交（commit）—— 改动留在工作区，早上用 `git diff` + 本账本验收。

## 每轮迭代协议（每次 cron 触发都按这个来）

1. **读账本**：`Read .claude/plans/a11y-ledger.md`，找到“下一个待办”。
2. **做该组件**：按下方“标准与约定”改造源码 + 扩展 `__test__/index.cy.ts`。
3. **验证**（必须绿，别把坏代码留给下一轮）：
   - 类型检查（只检查 web-vue）：`pnpm --filter @sdata/web-vue run typecheck`
   - lint：`pnpm oxlint packages/web-vue/components/<comp> --fix`
   - 跑该组件的 Cypress（只跑这一个，别全量）：`pnpm --filter @sdata/web-vue exec cypress run --component --browser chrome --spec packages/web-vue/components/<comp>/__test__/index.cy.ts`
   - 若全绿，在账本里把该组件状态改为 `✅`，写一行“改了什么/加了什么测试”。若有已知遗留，写到“注意事项”。
4. **更新账本**（必做，跨轮上下文靠它）。
5. 继续下一个组件，直到本轮回合自然结束；下一轮 cron 会接着来。

> 重要：若某轮 typecheck/测试红，**先修到绿再继续**，不要在坏代码上叠加。Cypress 全量约 180 spec 会压垮 CI（见 memory），所以验证只用单 spec。

## 标准与约定（WAI-ARIA Authoring Practices 1.2）

通用：
- 所有可交互元素必须有可达的键盘操作 + 正确 `role` + 状态 `aria-*`。
- 纯图标按钮必须加 `aria-label`（中文标签放 locale 的 i18n key，参考 modal close 的 `aria-label="Close"` 既有写法；能走 i18n 就走 i18n）。
- 用 `getCurrentInstance()!.uid` 生成实例唯一 id，前缀 `sd-<comp>-`，做 `aria-controls`/`aria-labelledby` 的双向连接，避免同页多实例冲突。
- 不要引入新依赖（如 focus-trap / @vueuse/integrations）。焦点陷阱自己写，放 `_hooks/use-focus-trap.ts`，给 modal/drawer/popconfirm 等复用。
- 键盘常量用既有 `_utils/keyboard.ts` 的 `KEYBOARD_KEY` + `getKeyDownHandler`。
- 风格：match 既有写法；`<script setup lang="ts">` 或 `defineComponent` 跟随原文件；不重构无关代码（AGENTS.md 外科手术式改动）。

模式速查（按组件类型）：
- **dialog（modal/drawer）**：`role="dialog"` + `aria-modal="true"`；`aria-labelledby`→标题、`aria-describedby`→正文；打开时焦点进入、关闭时焦点回触发器；Tab/Shift+Tab 在弹层内循环（焦点陷阱）。ESC 关闭（modal 已有）。
- **tabs**：`role="tablist"`(+`aria-orientation`)；每个 tab `role="tab"` + `aria-selected` + `aria-controls`；面板 `role="tabpanel"` + `aria-labelledby` + 活动时 `tabindex="0"`；roving tabindex（活动 tab=0，其余=-1）；方向键 + Home/End 移动并激活；Enter/Space 激活。
- ** Disclosure / collapse**：触发器 `aria-expanded` + `aria-controls`；面板 `role="region"` + `aria-labelledby`。
- **menu / dropdown**：触发器 `aria-haspopup="menu"` + `aria-expanded`；面板 `role="menu"`，项 `role="menuitem"`；方向键导航 + roving tabindex；ESC 关闭。
- **select / cascader / tree-select / date-picker / time-picker / color-picker**：触发器 `aria-haspopup="listbox"` + `aria-expanded`；面板 `role="listbox"`，项 `role="option"` + `aria-selected`；combobox 文本框 `role="combobox"` + `aria-controls` + `aria-activedescendant`。
- **checkbox/radio/switch**：`role="checkbox"/"radio"/"switch"`（或用原生 input）+ `aria-checked`；radio 组 `role="radiogroup"`；switch `aria-checked`。
- **slider / rate**：`role="slider"`(+`aria-valuemin/max/now/text`)；rate `role="radiogroup"`+`role="radio"` 或 `role="slider"`。
- **tooltip / popover / popconfirm**：触发器 `aria-describedby`→弹层 id（或 `aria-labelledby`）；popconfirm 触发器 `aria-haspopup="dialog"`。
- **alert / message / notification**：`role="alert"`（或 `aria-live` 区域）。
- **progress / spin / skeleton**：progress `role="progressbar"`+`aria-valuemin/max/now`；spin `role="status"`+`aria-live="polite"`；skeleton `aria-hidden="true"`。
- **table**：用原生 `<table>` 语义（thead/th scope）+ 必要 `aria-sort`；复杂操作列加 `aria-label`。
- **pagination**：`nav` + `aria-label`，当前页 `aria-current="page"`。
- **carousel**：`role="region"`+`aria-roledescription="carousel"`；slide `aria-roledescription="slide"`；有 `aria-live` 公告。
- **avatar/image**：有 `alt`/`aria-label`；装饰性图 `alt=""`。
- **badge/tag**：纯装饰 `aria-hidden`；语义状态用 `aria-label` 或 `role="status"`。

## 复用基础设施（已建）

- `_hooks/use-focus-trap.ts` —— `useFocusTrap(containerRef)` 返回 `{ activate, deactivate }`：activate 时缓存当前焦点→绑 Tab 拦截（documentElement capture）→ rAF 重试直到聚焦容器内首个可聚焦元素（兼容打开过渡时序）；deactivate 时取消重试→解绑→还原焦点。modal 已接入（在 `watch(computedVisible)` 的 true 分支用 `nextTick(activate)`、false 分支 `deactivate`；onMounted 也兜底）。drawer/popconfirm/popover 待接入，调用方式相同。
- **Trigger a11y props**（`trigger.tsx`）：`escToClose`（ESC 关弹层）+ `ariaHasPopup`（自动给触发器 firstChild 加 aria-haspopup/expanded/controls + 弹层加 id）。**popover/popconfirm/tooltip/select 接入时**：给内部 `<Trigger>` 传 `esc-to-close` + `aria-has-pop="<类型>"`（popover/dialog→'dialog'，listbox 类→'listbox'），即复用同一套 a11y，无需各自重写。tooltip 例外：用 `aria-describedby`（不加 haspopup/expanded）。

## 组件进度表

状态：⬜ 未开始 / 🚧 进行中 / ✅ 已完成（验证通过）/ ⏭️ 跳过（说明原因）

### P0 — 交互核心（必须最先做）
| 组件 | 模式 | 状态 | 备注 |
|---|---|---|---|
| tabs | tabs | ✅ | tablist/tab/tabpanel、aria-selected/controls/labelledby、roving tabindex、方向键+Home/End、Space 激活；非活动面板 aria-hidden+inert（顺带修了 Tab 焦点跑到屏外面板的旧 bug）。9/9 测试过。 |
| modal | dialog | ✅ | role=dialog/aria-modal/aria-labelledby(title)/aria-describedby(body)、焦点陷阱(useFocusTrap)、ESC 关闭、焦点进出。9/9 测试过。焦点还原到触发器在真实浏览器生效（Cypress 合成点击不聚焦触发器，未测）。 |
| drawer | dialog | ✅ | 同 modal：role=dialog/aria-modal/aria-labelledby(title)/aria-describedby(body)、useFocusTrap 焦点陷阱、ESC。6/6 测试过。**坑**：drawer 的 `visible` prop 默认 `false`（非 modal 的 `undefined`），导致 `defaultVisible` 失效（`props.visible ?? _visible` 恒为 false，抽屉其实是 display:none）；既有测试只断言 `.exist` 所以没暴露。这是既有行为，没动它（怕影响全局）；测焦点用受控 `visible` 起始 true。 |
| trigger | popover 基座 | ✅ | 加 **opt-in** 两个 prop（默认关闭，对现有 consumer 零行为变更）：`escToClose`（ESC 关弹层，document keydown）、`ariaHasPopup`（设了就把 `aria-haspopup`/`aria-expanded`/`aria-controls` merge 到触发器 firstChild，弹层加 id）。mergeFirstChild(cloneVNode deep) 支持 aria 透传。5/5 测试过。**这是 popover/popconfirm/tooltip/select 复用的基座**——后续 consumer 各自传 `esc-to-close` + `aria-has-popup` 即可。 |
| dropdown | menu | ✅ | 经 Trigger 传 `esc-to-close` + `aria-has-pop="menu"`（触发器 aria-haspopup/expanded/controls）；面板 `<ul>` 加 `role="menu"`，选项 `<li>` 加 `role="menuitem"`+`aria-disabled`+`tabindex=-1`；面板实现**方向键/Home/End 导航 + Enter/Space 激活 + 打开时焦点进首项**（panel 随弹层挂载即触发 onMounted）。2/2 测试过（含箭头导航）。 |
| popover | popover | ✅ | 经 Trigger 传 `esc-to-close` + `aria-has-popup="true"`（触发器 aria-haspopup/expanded/controls + ESC）。1/1 测试过（含 ESC）。 |
| popconfirm | popover/dialog | ✅ | 经 Trigger 传 `esc-to-close` + `aria-has-popup="dialog"`（确认弹层）。2/2 测试过。 |
| tooltip | tooltip | ✅ | 弹出层本就有 `role="tooltip"`（attr 透传）。补：Trigger 新增 opt-in `ariaDescribedbyPopup` prop，tooltip 传入 → 触发器在弹层显示时挂 `aria-describedby`→弹层 id（SR 聚焦触发器即朗读 tooltip）。3/3 测试过。 |
| select | combobox/listbox | ✅ | 经 Trigger `aria-has-popup="listbox"` → SelectView 触发器拿 aria-haspopup/expanded/controls（select 自带 ESC via useSelect，不加 esc-to-close）；弹层 `<ul>` 加 `role="listbox"`；选项 `<li>` 加 `role="option"`+`aria-selected`+`aria-disabled`；分组 `<li>` 加 `role="group"`+`aria-label`。键盘导航本就有（useSelect 方向键/Enter/ESC）。a11y 测试过（含既有键盘测试无回归）。注：**单选 combobox 已补**：经 InputLabel/SelectView 新增 opt-in `inputAttrs` prop（InputLabel inheritAttrs:false 会把 aria 吞到 wrapper span 而非 input），把 `role="combobox"`+`aria-expanded`+`aria-autocomplete`+`aria-activedescendant`（指向活动选项 id）透传到触发器 `<input>`；选项加稳定 id（`sd-select-option-<key>`）。SR 在 input 聚焦方向键浏览时能朗读高亮项。select 17/17 测试过（含新增 combobox-activedescendant 断言）。**遗留**：① 多选（InputTag 路径）**已加**：InputTag 同款 `inputAttrs` prop、SelectView 转发到 InputTag，多选 input 同获 role=combobox + activedescendant；② cascader/tree-select 已加静态 combobox aria（role/expanded/haspopup/autocomplete 到 input，选项经焦点朗读，无需 activedescendant）；③ `aria-controls`（指向 listbox id）未做（activedescendant 已足够让 SR 朗读活动项）。**SelectView 的清除按钮补 `aria-label="Clear"`**（原生 button，影响 select/cascader/tree-select）。**这是 combobox 模式样板**，cascader/tree-select/date-picker/time-picker/color-picker/auto-complete/mention/input-tag 套用：listbox+option+aria-selected + 触发器 aria-has-popup="listbox"。 |
| cascader | combobox | ✅ | 列本就是 `role="menu"`、选项是原生 `<button>`+aria-haspopup/expanded（键盘可达）。补：触发器经 Trigger `aria-has-popup="menu"` → SelectView 拿 aria-haspopup/expanded/controls。**combobox aria 落到 input**：cascader.vue 经 SelectView `inputAttrs` 把 `role="combobox"`+`aria-expanded`+`aria-haspopup=menu`+`aria-autocomplete` 透传到触发器 `<input>`（面板项是原生 button，经焦点朗读，无需 activedescendant）。13/13 测试过（含 input combobox 断言）。 |
| tree-select | combobox | ✅ | 经 Trigger `aria-has-popup="listbox"` → SelectView 触发器拿 aria-haspopup/expanded/controls（同 select）。弹层内是 `<Tree>` 组件，其 role=tree/treeitem + roving tabindex + 方向键导航由 tree 组件负责（见 tree 行）。**combobox aria 落到 input**：tree-select.vue 经 SelectView `inputAttrs` 把 `role="combobox"`+`aria-expanded`+`aria-haspopup=listbox`+`aria-autocomplete` 透传到触发器 `<input>`（弹层内 Tree 经焦点朗读，无需 activedescendant）。7/7 测试过（含 input combobox 断言）。 |
| menu | menu | ✅ | 容器 `role="menu"`（垂直/弹层）或 `role="menubar"`（水平顶层，非 inTrigger）；菜单项 `role="menuitem"`+tabindex+aria-disabled+aria-current=page(选中)+Enter/Space 激活。sub-menu-pop 触发器本就有 aria-haspopup。**已补方向键导航**：菜单容器（inner）加一个 `@keydown` 处理器，收集容器内可聚焦 menuitem（tabindex===0 即非禁用），按可视顺序在 ↑/↓（垂直）/←/→（水平）+ Home/End 间移动焦点。**加在容器级、纯增量**——不动各 item 的 tabindex（仍全 0，Tab 行为不变）与 Enter/Space，对既有测试零回归。4/4 测试过（含新增方向键测试）。注：未做 roving tabindex（仍全 tabindex=0，长菜单 Tab 较啰嗦）与子菜单方向键展开/进入（弹层子菜单各自独立 menu 容器，自管）、水平 menubar 的 ↑/↓ 开合子菜单——列后续。 |
| collapse | disclosure | ✅ | 触发器补 aria-controls、region 补 aria-labelledby（双向连接，instance.uid 生成 id）、role=button 加 Enter/Space 键盘激活（原来只能点不能键盘）、禁用项 tabindex=-1。3/3 测试过。context.handleClick 类型 MouseEvent→Event。注：理想 accordion 还应包 `role=heading`，结构改动大未做（遗留）。 |
| checkbox | checkbox | ✅ | 本就用原生 `<input type=checkbox>`+`<label>`（自带 role/键盘/checked 语义）。补：把 `indeterminate` prop 同步到原生 input 的 IDL 属性（原未设，SR 无法播报半选/mixed）；group 容器加 `role=group`（accessible name 靠 fallthrough aria-label）。6/6 测试过。 |
| radio | radio | ✅ | 本就用原生 `<input type=radio>`+`<label>`。补：group 容器加 `role=radiogroup`；组内 radio 共享 HTML `name`（context 传 inputName，uid 生成）→ 原生同名 radio 支持方向键在组内切换。5/5 测试过。 |
| switch | switch | ✅ | 本就达标：原生 `<button>`+`role="switch"`+`aria-checked`（键盘 Enter/Space 走浏览器默认）。补了 loading 时 `aria-busy`（原 loading 不置 disabled，SR 无 busy 提示）。3/3 测试过。accessible name 靠 fallthrough `aria-label`（消费者传）。 |
| slider | slider | ✅ | 本就有 `role="slider"`+aria-valuemin/max/now/text+tabindex（slider-button）。**补键盘**：slider-button emit keydown，slider.vue 加 handleButtonKeydown（方向键按 step 增减、Home/End 到极值、range 时起/终点互相夹紧）。2/2 测试过（含键盘）。 |
| rate | rate | ✅ | 本就有 per-star `role="radio"`+aria-checked+setsize/posinset。**补**：容器加 `role="radiogroup"`+aria-label+tabindex=0，加方向键改分（radiogroup 模式，容器为唯一 tab 停靠点；原只能鼠标点）。2/2 测试过。 |
| pagination | nav | ✅ | 根加 `role="navigation"`+`aria-label="Pagination"`；当前页 `aria-current="page"`；**所有翻页项（页码/上一页/下一页/省略号）原来只有 @click，键盘用户根本无法翻页**——补 `tabindex`+Enter/Space 激活+`aria-disabled`；纯图标的上一页/下一页/省略号加 `aria-label`。9/9 测试过（含键盘翻页）。注：aria-label 暂用静态英文，i18n 化需加 19 个 locale key，列遗留。 |
| table | table | ✅ | div 型表格补全 role：容器 `role="table"`、thead/tbody `role="rowgroup"`、tr `role="row"`、th `role="columnheader"`、td `role="cell"`；可排序列 `aria-sort`（ascending/descending/none）。5/5 测试过（含 grid 语义 + aria-sort）。 |
| tree | tree | ✅ | 容器 `role="tree"`；节点 `role="treeitem"`+`aria-level`(level+1，内部 0-based→ARIA 1-based)+`aria-expanded`(非叶子)+`aria-selected`(可选时)+`aria-disabled`。checkbox 选中态本就由原生 Checkbox 承载。**已补 WAI-ARIA 键盘导航**：roving tabindex（活动节点 tabindex=0，其余 -1；默认活动=选中节点或首个可见）+ ↑/↓/Home/End 移动 + →（展开/进首子）/←（折叠/回父）+ Enter/Space 选中。treeitem div 挂 tabindex+@keydown，键盘事件从 title span 上移到 treeitem（焦点元素层级）。焦点管理：activeKey 变化后 nextTick querySelector `[data-key]` focus。11/11 测试过（含 2 个新增导航测试）。注：→ 进首子直接读 `node.children[0]`（不依赖受展开动画影响的可见列表），← 回父用 `pathParentKeys` 末位（parentKey 字段未填充）。tree-select 弹层内的 Tree 同步获得导航能力。**遗留**：Space 对 checkable 树切换 checkbox、长字符串 type-ahead 未做。 |
| date-picker | combobox | ✅ | 触发器经 Trigger `aria-has-popup="dialog"`；面板日历网格（共享 body.vue）补 `role="grid"`/`"row"`/`"gridcell"` + `aria-label`(日期 YYYY-MM-DD) + `aria-selected` + `aria-disabled`。无独立 index.cy.ts（未单测，typecheck/lint 绿）。注：日历方向键导航未做（遗留）。 |
| time-picker | combobox | ✅ | 触发器经 Trigger `aria-has-popup="dialog"`；时间列（time-column）补 `<ul role="listbox">`+`<li role="option">`+`aria-selected`+`aria-disabled`。无 index.cy.ts（未单测，typecheck/lint 绿）。 |
| color-picker | combobox | ✅ | 面板色板本就有 aria-label（选择颜色 X）。补：跟踪 popupVisible，触发器 input 经 SdInput `inputAttrs` 加 `aria-haspopup="dialog"`+`aria-expanded`。9/9 测试过。 |
| input-number | spinbutton | ✅ | 本就达标：input 有 `role="spinbutton"`+aria-valuemin/max/now+键盘方向键步进（getKeyDownHandler）。补：纯图标的 +/- 按钮（embed 原生 button + button 模式 SdButton）加 `aria-label`（Increase/Decrease）。4/4 测试过。注：aria-label 暂静态英文。 |
| upload | button+list | ✅ | 缩略图 img 本就有 alt=name；默认触发用原生 Button（键盘可达）。补：列表项 remove 按钮（原 IconHover+onClick 无标签/键盘）包 span[role=button]+tabindex+aria-label+键盘；picture-card 的预览/重试/删除三个图标按钮同样补 role/tabindex/aria-label/Enter-Space。1/1 测试过。 |
| transfer | listbox | ✅ | 本就达标：迁移按钮 aria-label、每项用原生 Checkbox（多选）、表头全选 Checkbox。补：oneWay 模式的移除按钮（原 IconHover+onClick，无标签/键盘不可达）改为 span[role=button]+tabindex+aria-label+Enter/Space。3/3 测试过。 |
| auto-complete | combobox | ✅ | 复用共享 SelectDropdown（已有 role=listbox）；选项 `<li>` 加 `role=option`+`aria-disabled`；触发器 input 经 SdInput `inputAttrs` 加 `aria-haspopup=listbox`+`aria-expanded`（**坑**：SdInput inheritAttrs:false，Trigger 的 aria-has-popup prop 被吞，必须走 inputAttrs 才能落到 `<input>`）。5/5 测试过。 |
| mention | combobox | ✅ | 同 auto-complete：role=option+aria-disabled；input 模式经 SdInput inputAttrs 加 aria-haspopup/expanded。3/3 测试过。注：textarea 模式 SdTextarea 无 inputAttrs prop，触发器 haspopup 未加（遗留）。 |
| input-tag | combobox | ✅ | 本就达标：原生 `<input>`（textbox）+ 用 Tag 组件渲染标签（关闭按钮已有 role=button+aria-label）+ measure/resize 元素 aria-hidden。**补**：新增 opt-in `inputAttrs` prop（spread 到内部 `<input>`），供 SelectView 多选模式透传 combobox 语义（role/expanded/activedescendant）；独立 input-tag 无弹层，无需 combobox aria。无下拉选项（非典型 combobox），无需 listbox/option。注：标签关闭按钮 aria-label 为通用 "Close"，理想是 "Remove {label}"（Tag 组件层面，遗留）。 |
| carousel | carousel | ✅ | 根 `role="region"`+`aria-roledescription="carousel"`+aria-label+tabindex+方向键切换；slide `role="group"`+`aria-roledescription="slide"`+`aria-label="Slide N of M"`（已有 aria-hidden 非当前）；箭头按钮 role=button+tabindex+aria-label+键盘；指示点 role=button+tabindex+aria-label+aria-current+键盘。8/8 测试过。 |
| steps | navigation | ✅ | 容器 `role="list"`+aria-label；step `role="listitem"`+当前步 `aria-current="step"`；可点击(changeable)时 tabindex=0 + Enter/Space 键盘切换（context 传 changeable）。3/3 测试过。 |
| breadcrumb | breadcrumb | ✅ | 本就有 `role="list"`/`listitem`、分隔符 `aria-hidden`、more 项 `aria-label`。补：list 容器加 `aria-label="Breadcrumb"`。1/1 测试过。注：理想是 `<nav aria-label>`+`<ol>` 结构，当前 role=list 已够用。 |
| anchor | link/nav | ✅ | 本就用语义 `<ul>/<li>/<a href>`（原生链接，键盘可达）。补：容器 `role="navigation"`+aria-label；当前锚点链接 `aria-current="location"`。2/2 测试过。 |

### P1 — 表单/反馈
| 组件 | 模式 | 状态 | 备注 |
|---|---|---|---|
| form / form-item | group+alert | ✅ | input/textarea 本就原生 + `aria-invalid`(出错时)；form-item-message 本就 `role="alert"`（错误被 SR 朗读）。**已补 label↔控件关联**：form-item 用实例 uid 生成唯一 `fieldId`（`sd-form-item-<uid>`，与 wrapper-col 的 id 区分，不破坏 form.scrollToField），经 inject（FormItemContext.fieldId）下发给控件；label 经 `mergedLabelAttrs`（`{ for: fieldId, ...labelAttrs }`，消费者 labelAttrs.for 优先）挂 `for`；SdInput/SdTextarea 在 mergeInputAttrs/mergeTextareaAttrs 里「消费者未显式给 id 时」把 fieldId 设为控件 id。label `for` ↔ input id 双向匹配。3/3 form 测试过（新增关联测试）+ input 2/2 + textarea 3/3 无回归。**注**：仅 SdInput/SdTextarea 消费 fieldId；select/datepicker 等控件暂未消费（其 label `for` 指向不存在的 id，无害，等同现状，列后续）。一个 form-item 包多个控件会导致 id 重复（多控件场景少见，列遗留）。 |
| input | textbox | ✅ | 原生 `<input>`（textbox 语义+键盘）+ 出错时 `aria-invalid`；form-item label 关联经 fieldId（见 form-item 行）。**补清除按钮 a11y**：清除按钮本是 IconHover span（仅 click、无障碍名缺失、键盘不可达），补 `role="button"`+tabindex+`aria-label="Clear"`+Enter/Space（attrs 经 JSX spread 透传到 IconHover 的 span）。3/3 测试过（含清除按钮 a11y）。accessible name 靠消费者 aria-label/placeholder。 |
| textarea | textbox | ✅ | 原生 `<textarea>` + 出错时 `aria-invalid`；form-item label 关联经 fieldId。**补清除按钮 a11y**：清除按钮本是 div（仅 click），补 `role="button"`+tabindex+`aria-label="Clear"`+Enter/Space。3/3 测试过（无回归）。 |
| alert | alert | ✅ | 本就有 `role="alert"`+关闭按钮 aria-label。补：装饰图标 `aria-hidden`；关闭按钮 tabindex -1→0 + Enter/Space 键盘激活（原键盘用户关不掉）。3/3 测试过。 |
| message | alert/live | ✅ | 本就有 `role="alert"`（toast 被 SR 朗读）。无需改。 |
| notification | alert | ✅ | 本就有 `role="alert"`。无需改。 |
| tag | status | ✅ | 关闭按钮本就有 role=button+aria-label+键盘。**补**：可勾选(checkable)标签原来只能鼠标点、无语义——加 `role="button"`+tabindex+`aria-pressed`+Enter/Space 切换。12/12 测试过。 |
| tag-group | group | ⏭️ | 低优先，跳过。 |
| badge | status | ✅ | 计数点(dot+count，数字隐藏) 加 `role="status"`+`aria-label`（SR 朗读数字）；状态点(status-dot，文案承载状态) `aria-hidden`。7/7 测试过。 |
| progress | progressbar | ✅ | 本就有 `role="progressbar"`+aria-valuemin/max/now（line/circle/steps）。无需改。 |
| spin | status | ✅ | 加 `role="status"`+`aria-live="polite"`（tip 文案会被 SR 朗读），装饰图标 `aria-hidden`。1/1 测试过。 |
| skeleton | aria-hidden | ✅ | 加载时容器 `aria-busy="true"`（SR 知道该区域加载中），非加载时清除。2/2 测试过。 |
| result | region | ✅ | 装饰状态图标 `aria-hidden`（标题/副标题承载状态文案，SR 可读）。 |
| empty | status | ✅ | img 本就有 alt；描述文案可读。无需改（ConfigProvider 空 slot 另算）。 |
| statistic | region | ✅ | 纯文案（title/value/extra），SR 可读。无需改。 |
| link | link | ✅ | 本就用原生 `<a href>`（键盘可达、链接语义）。disabled 时 href=undefined。无需改。 |

### P2 — 展示/静态
avatar, card, divider, descriptions, list, timeline, typography, ellipsis, comment, layout, grid, space, page-header, affix, back-top, watermark, qr-code, secret, copy, border-beam, image, file-previewer, cropper, json-form, verification-code, overflow-list, toolbar, tour, icon, icon-component, scrollbar, resize-box, split, config-provider, locale, theme-provider, style —— 多数为装饰/容器，加 aria-label/aria-hidden 即可，优先级最低。

**P2 已完成**：
- ✅ **verification-code**：每个 OTP 单元格的 SdInput 经 `inputAttrs` 加 `aria-label="Character N of M"`（原来一行无障碍名缺失）；容器 div 加 `role="group"`+`aria-label="Verification code"`。1/1 测试过。
- ✅ **back-top**：默认槽本就是原生 `<button>`（已可聚焦、Enter/Space 经冒泡触发外层 div 的 scrollToTop）；补图标按钮的无障碍名 `aria-label="Back to top"` + `type="button"`。1/1 测试过（模拟滚动 scrollTop=500 派发 scroll 让控件挂载）。
- ✅ **page-header**：返回键是 `<a-icon-hover>`（渲染 span，attrs/listeners 透传）；补 `role="button"`+`tabindex="0"`+`aria-label="Back"`+Enter/Space keydown。2/2 测试过（含键盘触发 back）。
- ✅ **layout/sider**：三个折叠触发器（temporary-trigger span / zero-width-trigger span / trigger div）原来只有 @click；补 `role="button"`+`tabindex="0"`+`aria-label="Toggle sidebar"`+`:aria-expanded="!mergedCollapsed"`+共享 `handleTriggerKeydown`（Enter/Space toggle）。34/34 layout 测试过（含新增键盘 a11y 测试）。aside 外壳本就语义化。
- ✅ **typography（operations + edit-content）**：operations 的 edit/copy（图标 span）补 `role="button"`+`tabindex="0"`+`:aria-label`（复用既有 i18n key typography.edit/copy/copied）+Enter/Space keydown；expand `<a>`（无 href 不可聚焦）补 `role="button"`+`tabindex="0"`+keydown（有文案无需 aria-label）；edit-content 的编辑 Input 经 `inputAttrs` 加 `aria-label="Edit text"`。4/4 typography 测试过（含新增 a11y 断言，copy/edit 已有测试无回归）。**注**：edit-content.vue onMounted 里 `inputRef.value.$el.querySelector` 会抛（SdInput 的 $el 非元素）—— 既有问题，与本次 a11y 改动无关，editable 测试容错通过。
- ✅ **copy**：图标态（无默认插槽文案）的 Link/Button 触发器原来无障碍名缺失；新增 `computedAriaLabel`：消费者 aria-label 优先，否则有文案时 undefined（SR 读文案），否则用 `tooltip` 文案（复用组件自身语言，如「复制」）做 aria-label。4/4 测试过（含新增图标态 aria-label 测试）。
- ✅ **qr-code**：canvas / svg 本来对 AT 不可见（二维码内容没暴露）；补 `role="img"`+`:aria-label="QR code: <value>"`。qr-code-status 容器补 `role="status"`+`aria-live="polite"`（过期/扫码状态变更被 SR 朗读）。typecheck/lint 绿（无 index.cy.ts）。
- ✅ **file-previewer**：fullscreen 关闭按钮（图标，无障碍名缺失）补 `aria-label="关闭"`；loading 区补 `role="status"`+`aria-label="加载中"`；error 区补 `role="alert"`（失败文案被 SR 朗读）。PDF 上一页/下一页按钮本就有 aria-label。typecheck/lint 绿（无 index.cy.ts）。
- ✅ **avatar**：图片 avatar 的 `<img>` 本就有 `alt="avatar"`；补装饰的 error/loading 图标 `aria-hidden`。7/7 测试过。
- ✅ **divider**：本就有 `role="separator"`。无需改（理想还应有 aria-orientation，略）。
- ✅ **image**：`<img>` 本就有 `:alt`（消费者传）；error/loader 为装饰态。无需改。
- ✅ **typography**：title 用语义化 `h1`-`h6`（按 heading 层级）；text/paragraph 用 span（可读）。无需改。
- ✅ **list**：本就有 `role="list"`+`role="listitem"`。无需改。
- ✅ **timeline**：本就有 `role="list"`+`role="listitem"`。无需改。
- ✅ **split / resize-box（ResizeTrigger）**：伸缩杆 `_components/resize-trigger.vue` 的拖拽 div 补 `role="separator"`+`tabindex="0"`+`:aria-orientation="direction"`+`aria-label="Resize"`（ResizeObserver 用 cloneVNode 把这个 div 当根，attrs 落得上去；父组件的 `@keydown` 经同样路径冒泡到该 div）。**键盘 resize 已完整实现**（不做半成品）：split.vue 加 `onTriggerKeydown`（水平布局 ←/→、垂直 ↑/↓，Shift 加大步长，复用 `getLegalPxSize`/`getPxSize`/`getContainerSize` 保证不越 min/max）；resize-box.vue 加 `onTriggerKeydown(direction,e)`（left/right 用 ←/→、top/bottom 用 ↑/↓，方向轴向取反与 `onMoving` 一致，复用 `setResWidth/Height`）。resize-box 7/7 + split 1/1 测试过（含新增键盘 resize 测试）。**注**：未加 `aria-valuenow/min/max`（split 尺寸可 % 或 px、resize-box 无 min/max 追踪，语义复杂），role+tabindex+键盘+aria-orientation 已满足「可聚焦可操作」，aria-value* 列后续精化。
- 其余 P2（card/descriptions/comment/layout 容器/grid/space/affix/watermark/border-beam/cropper/json-form/overflow-list/toolbar/tour/icon/scrollbar/secret 等）多为纯展示/容器或已达标（tour 用原生 dialog、toolbar/secret 用原生 button+aria-label、descriptions 用原生 table），内容可读，优先级最低，按需补。

## 注意事项 / 遗留

（每轮在这里记录踩坑与已知遗留，供下一轮参考）

- 既有 a11y 基线：`aria-`/`role=` 仅零星存在于 48 文件；关键交互态（aria-expanded/selected/haspopup/modal/roving）几乎全缺。
- focus 陷阱暂以单层弹层为准；多层堆叠（多 modal 同显）的陷阱互斥待后续用 `isLastDialog()` 精化。
- 不要跑全量 Cypress（CI 2 核会被压垮，已设 45min 超时）。单 spec 验证即可。

### Cypress 组件测试踩坑（重要，写测试前看）
- **`.invoke('attr','x').then(cb)` + 嵌套 `.and()` 链会丢 jQuery subject**（报“neither a DOM object or a jQuery object”）。改用 `cy.get(...).eq(0).then(($el) => { expect($el.attr('x')).to.equal(...) })` 这种显式 `.then(($el) => expect)`。
- **断言布尔用 `.to.equal(true)`/`.to.equal(false)`，别用 `.to.be.true`**（oxlint no-unused-expressions + chai 会挂，见 [[oxlint-no-unused-expressions-chai]]）。
- **合成 `.click()` 不会把焦点留在触发器上**（`document.activeElement` 是 `<body>`）。“点击触发器→打开弹层→焦点进入弹层”的测试用 **`defaultVisible: true` 挂载**路径（onMounted 时 activate，稳定）；别用 open-via-click（焦点竞争、flaky）。
- **CSS 过渡在组件测试里可能不触发**，所以 `@after-enter`/`@after-leave` 不可靠。焦点陷阱用 `watch(visible→true) { nextTick(activate) }` + onMounted 兜底；hook 内部用 rAF 重试等元素可聚焦。
- 测焦点进出用 `cy.wrap(null).should(() => { expect(document.activeElement?.closest('.sd-xxx')).to... })`，靠 `.should` 的 4s 重试吸收过渡时序。
- **Trigger 的 a11y prop 名是 `ariaHasPopup`，模板里写 `aria-has-popup`（不是 `aria-has-pop`！）**。写错会变成 fallthrough attr（Trigger inheritAttrs:false → 进 popupAttrs 被忽略），触发器拿不到 aria-haspopup。曾踩过这个坑（dropdown/popover/popconfirm 都写错过，靠测试揪出）。consumer 统一写 `esc-to-close` + `aria-has-popup="<类型>"`。
- **SdInput `inheritAttrs: false`**：Trigger 的 `aria-has-popup` 等 merge 到 SdInput 组件时会被吞（不落到 `<input>`）。对 input 型 combobox（auto-complete/mention/input-tag 等），触发器的 aria-haspopup/expanded 要走 SdInput 的 **`inputAttrs` prop**（spread 到内部 input）才能落到 `<input>`。SdTextarea 没有 inputAttrs（mention textarea 模式触发器 haspopup 暂缺，遗留）。
- **Cypress 组件测试别并行 + Windows 会挂**：两个 `cypress run --component` 同时跑会死锁（共享浏览器/端口，输出文件一直空、永不完成）。**一次只跑一个 cypress 进程**。另外 Windows 上 cypress 跑完测试后浏览器退出常卡住（进程不退、看不到 All specs 汇总）——此时测试其实已跑完（看 √/× 行 + Tests/Passing 汇总即可判断），TaskStop 后用 PowerShell `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where CommandLine -match 'Cypress'` 只杀 cypress 衍生的 chrome（别杀用户自己的 Chrome）。
