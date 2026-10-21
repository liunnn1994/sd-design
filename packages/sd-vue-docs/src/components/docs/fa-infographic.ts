import {
  Group,
  Path,
  Rect,
  Text,
  getThemeColors,
  jsx,
  registerStructure,
  type JSXElement,
  type ThemeColors,
} from '@antv/infographic';

// These structures describe this library's package boundary and actual Collapse call chain.
// Infographic owns SVG rendering, text measurement, viewBox fitting and theme updates.
function drawing(colors: ThemeColors) {
  const nodes: JSXElement[] = [];
  function text(x: number, y: number, width: number, value: string, size = 14, strong = false) {
    nodes.push(
      jsx(Text, {
        x,
        y,
        width,
        height: size * 1.6,
        fontSize: size,
        fontWeight: strong ? 600 : 400,
        fill: colors.colorText,
        children: value,
      }),
    );
  }
  function box(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    lines: string[],
    accent = false,
    dashed = false,
  ) {
    nodes.push(
      jsx(Rect, {
        x,
        y,
        width,
        height,
        rx: 6,
        fill: accent ? colors.colorPrimaryBg : colors.colorBg,
        stroke: accent ? colors.colorPrimary : colors.colorTextSecondary,
        strokeWidth: 1,
        strokeDasharray: dashed ? '5 4' : undefined,
      }),
    );
    text(x + 14, y + 10, width - 28, title, 16, true);
    lines.forEach((line, index) => text(x + 14, y + 39 + index * 23, width - 28, line));
  }
  function arrow(points: [number, number][], dashed = false) {
    const [endX, endY] = points.at(-1)!;
    const [prevX, prevY] = points.at(-2)!;
    const angle = Math.atan2(endY - prevY, endX - prevX);
    const wing = (offset: number) =>
      `${endX - 7 * Math.cos(angle + offset)},${endY - 7 * Math.sin(angle + offset)}`;
    nodes.push(
      jsx(Path, {
        d: `M${points.map(([x, y]) => `${x},${y}`).join(' L')} M${wing(0.45)} L${endX},${endY} L${wing(-0.45)}`,
        fill: 'none',
        stroke: colors.colorPrimary,
        strokeWidth: 1.8,
        strokeDasharray: dashed ? '5 4' : undefined,
      }),
    );
  }
  return { nodes, text, box, arrow };
}

registerStructure('sd-fa-architecture', {
  component: ({ options }) => {
    const { nodes, text, box, arrow } = drawing(getThemeColors(options.themeConfig));
    text(18, 8, 724, 'SD Design · 一个组件的分层与复用边界', 22, true);
    text(18, 44, 724, '实线：当前 Vue 实现及其调用关系；虚线：未来框架适配方向');

    box(18, 88, 320, 456, '@sdata/web-vue', ['框架相关 · 原生 Vue Adapter / View'], true);
    box(422, 88, 320, 456, '@sdata/web-core', ['框架无关 · 共享规则与原生能力'], true);
    box(34, 164, 288, 88, 'View · 结构与事件绑定', [
      'template / VNode / slots',
      'DOM / ARIA / Teleport / Transition',
    ]);
    box(34, 302, 288, 88, 'Component State · 响应式状态', [
      'props / ref / computed / context',
      '受控值读取 · 内部状态回写',
    ]);
    box(34, 440, 288, 88, 'Adapter · 端口的 Vue 实现', [
      'getter / setter / emit / nextTick',
      'watch / 挂载与卸载 / DOM 连接',
    ]);

    box(438, 164, 288, 228, 'Foundation · 交互过程', [
      'Collapse：展开集合 / 手风琴切换',
      'Select：选值 / 单多选 / 搜索流程',
      'Table / Form：数据规则与调度',
      '状态读取 → 计算判断 → 动作组合',
      '只调用所需端口，不访问 Vue 实例',
    ]);
    box(438, 440, 288, 88, '原生驱动 · 按需执行', [
      '测量 / 拖拽 / 观察器 / 媒体',
      '浏览器能力通过元素与调度端口接入',
    ]);

    arrow([
      [322, 204],
      [438, 204],
    ]);
    text(342, 169, 92, '① 调用', 14, true);
    text(342, 210, 92, '事件 / 同步', 12);
    arrow([
      [438, 366],
      [380, 366],
      [380, 484],
      [322, 484],
    ]);
    text(342, 398, 92, '② 委托', 14, true);
    arrow([
      [178, 440],
      [178, 390],
    ]);
    text(192, 404, 128, '③ 写回 / 通知');
    arrow([
      [178, 302],
      [178, 252],
    ]);
    text(192, 266, 128, '④ Vue 渲染');

    box(18, 568, 724, 88, '共享视觉基础 · Core SCSS / Design Token / 主题派生', [
      '框架包复用样式；Vue 保留原全量与按需样式入口。',
      '样式复用不依赖 Foundation 的事件调用。',
    ]);
    box(
      18,
      682,
      724,
      112,
      '扩展方向 · 复用 Core，分别实现 Adapter 与原生 View',
      [
        'React：状态 / effects / JSX；Solid、Svelte：各自的响应式与生命周期',
        '原生适配：状态容器 / DOM 绑定 / 销毁清理；以上适配包尚未实现',
      ],
      false,
      true,
    );
    return jsx(Group, { children: nodes });
  },
  composites: [],
});

registerStructure('sd-fa-collapse-flow', {
  component: ({ options }) => {
    const { nodes, text, box, arrow } = drawing(getThemeColors(options.themeConfig));
    text(18, 8, 724, 'Collapse · 一次点击如何更新视图', 22, true);
    text(18, 44, 724, '按源码执行次序阅读；蓝色箭头表示函数调用，虚线表示读取结果返回。');
    box(18, 88, 216, 66, 'Vue View / CollapseItem', ['DOM、上下文与渲染'], true);
    box(272, 88, 216, 66, 'Core Foundation', ['click(key, event)'], true);
    box(526, 88, 216, 66, 'Vue Adapter', ['当前状态与事件实现'], true);

    box(18, 194, 216, 88, '① 标题事件', ['点击 / 键盘激活', '上下文 handleClick']);
    box(272, 194, 216, 88, '② 进入共享流程', [
      'foundation.click(key, event)',
      '读取 accordion / keys',
    ]);
    box(526, 194, 216, 88, '③ getter 返回当前状态', [
      'props.accordion',
      'computedActiveKeys.value',
    ]);
    for (const x of [126, 380, 634]) {
      arrow([
        [x, 154],
        [x, 194],
      ]);
    }
    arrow([
      [234, 238],
      [272, 238],
    ]);
    arrow([
      [488, 238],
      [526, 238],
    ]);
    arrow(
      [
        [634, 282],
        [634, 318],
        [380, 318],
        [380, 352],
      ],
      true,
    );
    box(272, 352, 216, 88, '④ 计算下一组 keys', [
      '手风琴：[] 或 [key]',
      '普通模式：复制后增删 key',
    ]);
    arrow([
      [488, 396],
      [508, 396],
      [508, 464],
      [526, 464],
    ]);
    box(526, 420, 216, 134, '⑤ 写回并通知父级', [
      'setInner(keys) → 内部值',
      'onChange(keys, event)',
      'update:activeKey → change',
    ]);
    arrow([
      [634, 554],
      [634, 598],
      [234, 598],
    ]);
    box(18, 554, 216, 88, '⑥ Vue 重新渲染', [
      '受控：读取 props.activeKey',
      '非受控：读取内部 _activeKey',
    ]);
    text(250, 684, 492, '父级拒绝受控更新时，显示仍以 props 为准；事件不等于提交成功。');
    return jsx(Group, { children: nodes });
  },
  composites: [],
});
