# SD Design React

React 适配包正在与 Vue 版本逐项对齐，目前提供 Divider、Comment、Space、Switch、Button/ButtonGroup、Link、Empty、Spin、Tag、Avatar/AvatarGroup、NumberFlow/NumberFlowGroup、Badge、Trigger、Scrollbar、Tooltip、Popover、Popconfirm、Alert、Card/CardMeta/CardGrid、Skeleton/SkeletonLine/SkeletonShape、Result、PageHeader、Descriptions/DescriptionsItem、Grid/Row/Col/GridItem、Drawer、Collapse/CollapseItem、Timeline/TimelineItem、Steps/Step、Breadcrumb/BreadcrumbItem、Dropdown/Doption/Dgroup/Dsubmenu/DropdownButton、Layout/Header/Content/Footer/Sider、Ellipsis/PerformantEllipsis、LineClamp/InlineClamp/RichLineClamp/WrapClamp 和基础 ConfigProvider/ThemeProvider。全量能力仍在建设中，详见仓库 `docs/react-parity.md`。

应用入口导入 `@sdata/web-react/styles/index.scss`，加载基础 token、图标规则和当前组件样式；需要消费端支持 Sass。各组件的单独 SCSS 入口适用于已加载基础样式的按需使用场景。

## Divider 分割线

```tsx
import { Divider } from '@sdata/web-react';
import '@sdata/web-react/styles/divider.scss';

export function Example() {
  return (
    <>
      <Divider />
      <Divider orientation="left" type="dashed">
        章节
      </Divider>
      <Divider direction="vertical" size={2} margin="1rem" />
      <Divider>
        <strong>自定义标题</strong>
      </Divider>
    </>
  );
}
```

`direction` 默认为 `horizontal`，也可设为 `vertical`。垂直分割线不显示文字。
`orientation` 支持 `left`、`center`（默认）、`right`。
`type` 支持 `solid`、`dashed`、`dotted`、`double`。
`size` 是像素宽度；`margin` 支持像素数值或 CSS 长度。数值 `0` 会保留。
支持原生 div 属性、`ref`、`className` 和 `style`。

## Comment 评论

```tsx
import { Comment } from '@sdata/web-react';
import '@sdata/web-react/styles/comment.scss';

export function Example() {
  return (
    <Comment
      author={<a href="/user">作者</a>}
      avatar="/avatar.png"
      datetime="今天"
      content="评论内容"
      align={{ actions: 'right' }}
      actions={<a href="#reply">回复</a>}
    >
      <Comment author="回复者" content={<strong>嵌套回复</strong>} />
    </Comment>
  );
}
```

`author`、`datetime`、`content`、`actions` 接受 React 内容。
`avatar` 为字符串时作为图片 URL，也支持自定义 React 内容。
`children` 渲染嵌套评论。`align` 默认为 `left`；传 `right` 同时调整时间与操作区，也可使用对象分别指定，未指定项默认靠左。

Affix 支持 `offsetTop` / `offsetBottom`（后者优先）、`target` / `targetContainer`、`onChange` 和 `ref.updatePosition()`，复用共享滚动与尺寸观察驱动；按需样式为 `styles/affix.scss`。目标可以是选择器、HTMLElement 或 Window，SSR 输出未固定的内容。

BackTop 支持 `visibleHeight`、`targetContainer`、`duration`、`easing` 与自定义 children。默认按钮有本地化可访问名称，系统偏好减少动态效果时立即返回顶部；按需样式为 `styles/back-top.scss`。SSR 隐藏，ref 指向可见期间的外层 div。

Anchor/AnchorLink（也可用 `Anchor.Link`）支持滚动章节跟踪、嵌套 sublist、平滑定位、hash 导航及 Affix 组合，复用 core 规则；样式为 `styles/anchor.scss`。`onSelect(hash, previousHash)` 在点击时触发，`onChange(hash)` 在当前章节变化并渲染后触发。

Tabs/TabPane（也可用 `Tabs.TabPane`）支持受控与默认激活、六种类型、动态增删、隐藏内容冻结、lazyLoad/destroyOnHide、RTL、溢出滚动与 fullHeight Scrollbar；样式为 `styles/tabs.scss`。数字 key 请使用 `paneKey`，直接 React key 会被 React 转成字符串。ref 指向原生外层 div；添加和删除由应用处理。

上述样式入口使用共享 SCSS，需要消费端支持 Sass。构建和渲染测试分别使用 `pnpm --filter @sdata/web-react build`、`pnpm --filter @sdata/web-react test`。

完整浏览器回归使用 `pnpm --filter @sdata/web-react serve:e2e` 启动 5190 测试服务，并给 Cypress 配置 `baseUrl=http://127.0.0.1:5190`。该服务使用独立依赖缓存，关闭文件监听和 HMR；修改源码或构建产物后需重启服务。开发时继续使用支持热更新的 `dev:test`（5187）。回归期间保持源码与构建产物不变，源码 SSR 检查需使用独立的临时缓存目录。

Menu、MenuItem、MenuItemGroup、SubMenu 支持受控选择/展开、四种模式、嵌套弹出、水平溢出、响应式折叠和 Sider 联动，复用 core 规则。使用唯一字符串 `itemKey`，受控状态通过 `onSelectedKeysChange` / `onOpenKeysChange` 写回；样式入口为 `styles/menu.scss`。完整使用说明见 React Menu 文档。

Statistic 与 Countdown（也可用 Statistic.Countdown）支持数值/日期显示及截止时间倒计时；styles/statistic.scss 包含 NumberFlow 样式。ref 指向根 div，title/extra/prefix/suffix 使用 ReactNode，onFinish 对应 Vue finish。

Progress 提供线形、环形和步骤模式，复用 core 几何与颜色规则；styles/progress.scss 为样式入口。text 对应 Vue text 插槽，ref 指向外层 div，mini 视图和 steps 优先级与 Vue 一致。

TagGroup 支持响应式和固定数量折叠、字段映射、itemProps 与 renderItem/renderLabel/renderCounter；样式入口 styles/tag-group.scss 包含 Tag/Popover。默认计数器可通过键盘焦点打开隐藏列表，ref 指向根 span。

Watermark 支持文本/图片画布水印、灰阶、错位重复与防篡改恢复，ref 指向根 div；SSR 仅输出容器与 children，客户端挂载后绘制。样式入口为 styles/watermark.scss。

Form/FormItem（Form.Item）共享字段校验、重置与提交快照。model/onModelChange 使用受控写回，ref 提供 validate/validateField/setFields/resetFields/clearValidate/scrollToField。useFormItem 供自定义控件合并尺寸、禁用与错误，并关联标签和通知校验；Button/Switch 已接入。样式入口为 styles/form.scss。

Input/InputPassword/InputSearch/InputGroup 提供输入、提交 change、清除、组合输入、字数限制、fitWidth、只读提示与 Form 接入；受控值使用 onValueChange 回写。Input 的 inputAttrs 透传原生属性，ref 暴露 inputRef/focus/blur；子组件 ref 详见对应文档。样式入口为 styles/input.scss。

Textarea 复用共享输入与自动高度规则，支持 autoSize/minRows/maxRows、fitWidth、清除、只读提示和 Form 状态。value/onValueChange 提供受控回写；失焦先触发 onBlur，再在值变化时触发 onChange。样式入口为 styles/textarea.scss。

InputNumber 提供 embed/button 模式、精度和范围、formatter/parser、stringMode、modelEvent、只读提示与 ref；复用共享数值 Foundation 和 React Input，文档位于 /react/components/input-number/。

Checkbox/CheckboxGroup、Radio/RadioGroup 提供根/子路径与复合导出，单项 modelValue 与选项 value 分离；组 value 支持受控模型，包含自定义内容、原生键盘和表单事件，文档位于 /react/components/checkbox/ 与 /react/components/radio/。

Rate 已提供根/子路径、RateProps/RateInstance、按需样式和交互文档，支持全局清除配置、半星、阈值颜色、分级表情、键盘操作、自定义字符和只读提示。

Slider 提供单值/范围、横竖方向、刻度/标记、格式化提示和数字输入联动，导出 SliderProps/SliderInstance/SliderValue/SliderFormatTooltip/SliderChangeHandler，文档位于 /react/components/slider/。

## Calendar 日历

从 `@sdata/web-react/calendar` 导入 `Calendar` 和 `CalendarExposed`，按需导入 `@sdata/web-react/styles/calendar.scss`。根包也导出 Calendar。

```tsx
<Calendar
  view="week"
  viewDate="2026-11-03"
  events={[{ title: '评审', start: '2026-11-03 10:00', end: '2026-11-03 11:00' }]}
  editableEvents
  style={{ height: 460 }}
  onEventCreate={({ event, resolve }) => resolve({ ...event, title: '新安排' })}
/>
```

创建审批使用 `resolve`；拖放与缩放审批使用回调返回值。`ref.current.view` 提供导航、事件增删、滚动和实时视图状态。详细属性、回调、render 入口与交互示例见 `/react/components/calendar/`。完整 Vue 场景对照和全量回归进度记录在 `docs/react-parity.md`。

## RegexVis 正则可视化

从 `@sdata/web-react` 或 `@sdata/web-react/regex-vis` 导入 RegexVis，按需导入 `@sdata/web-react/styles/regex-vis.scss`。value/onValueChange 与 flags/onFlagsChange 分别控制表达式和标志；defaultValue/defaultFlags 提供非受控初始值。节点支持鼠标和键盘选择，renderEmpty/renderError/renderFooter 提供自定义内容，完整用法见 `/react/components/regex-vis/`。

## ColorPicker 颜色选择器

从 `@sdata/web-react` 或 `@sdata/web-react/color-picker` 导入 ColorPicker，按需导入 `@sdata/web-react/styles/color-picker.scss`。支持十种颜色格式、透明度、渐变色标、最近颜色和预设颜色；value/onValueChange 控制颜色，defaultValue 提供非受控初始值。hideTrigger 显示内嵌面板，renderTrigger 自定义触发器，ConfigProvider.colorPicker.swatchColors 设置全局预设。完整属性和交互示例见 `/react/components/color-picker/`。

## TimePicker 时间选择器

从 `@sdata/web-react` 或 `@sdata/web-react/time-picker` 导入 TimePicker，按需导入 `@sdata/web-react/styles/time-picker.scss`。支持单值/范围、十二小时制、步进和禁用时间、确认或即时提交；value/onValueChange 与 popupVisible/onPopupVisibleChange 分别控制值和弹层。ref 提供 focus/blur，renderTrigger 提供自定义触发器。完整用法见 `/react/components/time-picker/`。

## DatePicker 日期选择器

从 `@sdata/web-react` 或 `@sdata/web-react/date-picker` 导入 DatePicker、WeekPicker、MonthPicker、QuarterPicker、YearPicker、RangePicker，按需导入 `@sdata/web-react/styles/date-picker.scss`。各子组件也挂载于 DatePicker。支持受控输入与弹层、日期时间范围、确认、禁用规则、时区、快捷项及内嵌/自定义面板；`ConfigProvider.datePicker` 设置全局默认项。完整属性、回调和交互示例见 `/react/components/date-picker/`。
`Cropper` 提供根入口和 `@sdata/web-react/cropper` 子路径，样式为 `@sdata/web-react/styles/cropper.scss`。复用 Core 裁剪引擎，支持动态图片、选区几何回写、比例与画布配置、事件及 ref；真实裁剪输出和完整 API 见 `/react/components/cropper/`。
`ThemeProvider` 支持局部/全局主题、嵌套浮层继承及 `tag` 根标签；从根入口或 `@sdata/web-react/theme-provider` 导入。局部容器透传原生属性，并使用 ConfigProvider 的类名前缀；无主题或 global 模式不增加包装节点。详见 `/react/components/theme-provider/`。

Cascader/CascaderPanel（也可用 `Cascader.CascaderPanel`）复用 Core 的层级选项、父子选择、搜索、键盘与异步加载规则。支持单选/多选、pathMode、checkStrictly、fieldNames/valueKey、受控弹层和 Form 集成；使用 `value` / `onValueChange` 更新选择，ref 提供 `focus()` / `blur()`。按需入口为 `@sdata/web-react/cascader`，样式为 `@sdata/web-react/styles/cascader.scss`；完整示例见 React Cascader 文档。

Tree 支持受控选中/勾选/展开、字段映射、异步加载、节点定制、键盘导航与虚拟滚动，复用 Core 的数据模型和交互规则。按需入口为 `@sdata/web-react/tree`，样式为 `@sdata/web-react/styles/tree.scss`；ref 使用 `TreeInstance`，完整示例见 React Tree 文档。异步加载保持原始父节点身份，更新其 children 后触发 React 重渲染。

TreeSelect 支持树形下拉选择、父子勾选、标签值、搜索、异步加载与定制触发器，复用 Core TreeSelect 规则和 React Tree。按需入口为 `@sdata/web-react/tree-select`，样式为 `@sdata/web-react/styles/tree-select.scss`。`value` / `onValueChange` 控制选择；ref 提供 focus/blur，完整示例见 React TreeSelect 文档。

Upload 复用共享上传请求、文件生命周期和输入驱动，支持受控文件列表、自动/手动上传、拖放、三类列表与图片预览。按需入口为 `@sdata/web-react/upload`，样式为 `@sdata/web-react/styles/upload.scss`；真实服务使用 action，自定义请求返回 abort 方法。完整用法和模拟进度示例见 React Upload 文档。

FilePreviewer 提供图片、音频、视频、PDF 和自定义内容预览，复用 Core 加载规则、媒体 Web Components 和 PDF 控制器。按需入口为 `@sdata/web-react/file-previewer`，样式为 `@sdata/web-react/styles/file-previewer.scss`。默认全屏，`fullscreen={false}` 始终内嵌显示；`visible` / `onVisibleChange` 控制弹层，ref 提供 close/onLoad/onError。完整配置和实际交互示例见 React FilePreviewer 文档。

Table 提供根入口及 `@sdata/web-react/table` 按需入口，样式为 `@sdata/web-react/styles/table.scss`。支持共享的排序/筛选/分页、受控选择与展开、树形及异步行、列宽调整、摘要/跨度、固定列、分离表头、虚拟滚动和同级拖动；拖动通过 onChange 回写 data。Thead/Tbody/Tr/Th/Td/TableColumn 同时提供命名与 Table 复合入口。正式交互示例见 React Table 文档；全库 1:1 验收以 docs/react-parity.md 的验证范围为准。
