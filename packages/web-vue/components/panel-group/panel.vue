<template>
  <!-- 有尺寸面板：外层裁剪容器 + 内容层（折叠姿态）+ 自带边缘杆 -->
  <div v-if="sized" ref="wrapperRef" :class="sizedClass" :style="sizedStaticStyle">
    <Transition
      :css="false"
      @enter="enterContent"
      @leave="leaveContent"
      @enter-cancelled="cancelContent"
      @leave-cancelled="cancelContent"
    >
      <div
        v-if="contentMounted"
        ref="contentRef"
        v-bind="$attrs"
        :class="contentClass"
        :style="contentStyle"
      >
        <slot v-bind="slotProps" />
      </div>
    </Transition>
    <PanelSeparator v-if="state.bare" :own="controller" />
  </div>
  <!-- 填充面板：占据剩余空间；pin 时用内层承载折叠动画 -->
  <div v-else v-bind="pin ? {} : $attrs" :class="fillClass" :style="fillStyle" data-sd-panels-fill>
    <div v-if="pin" v-bind="$attrs" :class="pinInnerClass" :style="pinInnerStyle">
      <slot v-bind="slotProps" />
    </div>
    <slot v-else v-bind="slotProps" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue';

  import type { PanelFold, PanelPose, PanelSize, PanelSlotProps, PanelTransition } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import { usePanelGroup } from './context';
  import { createPanel } from './core/panel';
  import { cssEasing, timing } from './core/transition';
  import PanelSeparator from './panel-separator.vue';

  defineOptions({ name: 'Panel', inheritAttrs: false });

  const props = defineProps<{
    /**
     * @zh 受控尺寸，像素或百分比字符串；不传时为填充面板，挂载后不切换面板类型
     * @en Controlled size in px or percent; omit for a fill panel. Panel type is fixed at mount
     * @vModel
     */
    size?: PanelSize;
    /**
     * @zh 是否折叠
     * @en Whether collapsed
     * @vModel
     */
    collapsed?: boolean;
    /**
     * @zh 双击伸缩杆时恢复的尺寸，默认使用首次传入的 size
     * @en Size restored on double-click, defaults to the initial size
     */
    defaultSize?: PanelSize;
    /**
     * @zh 折叠和展开时的内容样式
     * @en Content styles while collapsed and expanded
     */
    fold?: PanelFold;
    /**
     * @zh 最小尺寸
     * @en Minimum size
     */
    minSize?: PanelSize;
    /**
     * @zh 最大尺寸
     * @en Maximum size
     */
    maxSize?: PanelSize;
    /**
     * @zh 是否固定内容宽度（避免折叠动画期间内容回流）
     * @en Pin content width to avoid reflow during fold animations
     */
    pin?: boolean;
    /**
     * @zh 折叠动画期间是否保持内容挂载
     * @en Keep content mounted during fold animations
     */
    keepMounted?: boolean;
    /**
     * @zh 过渡配置（毫秒）
     * @en Transition config (milliseconds)
     */
    transition?: PanelTransition;
  }>();

  const emit = defineEmits<{
    /**
     * @zh 面板尺寸变化（拖拽结束或键盘调整后触发）
     * @en Emitted after drag or keyboard resize
     */
    'update:size': [size: PanelSize];
    /**
     * @zh 折叠状态变化
     * @en Emitted when collapsed state changes
     */
    'update:collapsed': [collapsed: boolean];
  }>();

  /**
   * @zh 面板内容
   * @en Panel content
   * @slot default
   * @binding {PanelSlotProps} collapsed/dragging/folding 面板状态
   */
  defineSlots<{
    default?: (props: PanelSlotProps) => unknown;
  }>();

  const group = usePanelGroup();
  const { axes } = group;

  const prefixCls = getPrefixCls('panel');
  // 仅当消费方绑定 collapsed（v-model:collapsed 或监听 update:collapsed）时才上报折叠变化；
  // 与 vendor 一致：未绑定时拖拽越下限按 clamp 处理，不做折叠手势（否则手势折叠会被弹回）
  const hasCollapsedBinding = !!getCurrentInstance()?.vnode.props?.['onUpdate:collapsed'];
  // 变体在挂载时确定（与 vendor 一致）：运行时补传 size 不切换变体
  const sized = props.size !== undefined;

  // 引擎控制器：仅“有尺寸面板”创建（与 vendor 一致），挂载后 attach。
  const controller = sized
    ? createPanel(group, {
        size: (props.size ?? '100%') as PanelSize,
        collapsed: props.collapsed,
        defaultSize: props.defaultSize,
        minSize: props.minSize,
        maxSize: props.maxSize,
        transition: props.transition,
        onSizeChange: (value) => emit('update:size', value),
        onCollapsedChange: hasCollapsedBinding
          ? (value: boolean) => {
              emit('update:collapsed', value);
            }
          : undefined,
      })
    : undefined;

  // 清理函数集合
  const unsubs: (() => void)[] = [];

  // 面板状态：引擎的 state 对象是整体替换的，这里用 ref 镜像出来供模板消费。
  const panelState = ref(
    controller?.state ?? {
      bare: false,
      dragging: false,
      end: undefined,
      folding: false,
    },
  );

  if (controller) {
    unsubs.push(
      controller.subscribe(() => {
        panelState.value = controller.state;
      }),
    );
  }

  const state = panelState;

  // 内容是否“在场”：折叠且不在拖拽/折叠动画中视为不在场（与 vendor present 一致）
  const present = computed(
    () =>
      !props.collapsed ||
      state.value.dragging ||
      (props.fold?.hidden === undefined && state.value.folding),
  );

  // keepMounted 默认 true：内容首次在场后保持挂载
  const wasPresent = ref(present.value);
  watch(present, (value) => {
    if (value) {
      wasPresent.value = true;
    }
  });
  const contentMounted = computed(() =>
    props.keepMounted === false ? present.value : wasPresent.value || present.value,
  );

  // 折叠姿态样式：不在场（且配置了 hidden 姿态）时应用 hidden，否则应用 shown
  const contentPose = computed<PanelPose | undefined>(() =>
    present.value || !props.fold?.hidden ? props.fold?.shown : props.fold?.hidden,
  );

  // 姿态过渡：内容层的 CSS transition（仅 transform/opacity，宽度由引擎逐帧写入）
  const poseTransition = computed(() => {
    const duration = props.transition?.duration ?? 250;
    const easing = cssEasing(props.transition);
    return {
      transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
    };
  });
  const contentStyle = computed(() => [
    { [axes.cross]: '100%' },
    poseTransition.value,
    contentPose.value,
  ]);

  const contentAnimations = new Map<Element, Animation>();
  const cancelContent = (el: Element) => {
    contentAnimations.get(el)?.cancel();
    contentAnimations.delete(el);
  };
  const animateContent = (el: Element, done: () => void, entering: boolean) => {
    cancelContent(el);
    if (props.keepMounted !== false || !props.fold?.hidden) {
      done();
      return;
    }
    const shown = {
      opacity: props.fold.shown?.opacity ?? 1,
      transform: props.fold.shown?.transform ?? 'none',
    };
    const hidden = {
      opacity: props.fold.hidden.opacity ?? shown.opacity,
      transform: props.fold.hidden.transform ?? shown.transform,
    };
    const animation = el.animate(entering ? [hidden, shown] : [shown, hidden], {
      duration: timing(props.transition).duration,
      easing: cssEasing(props.transition),
    });
    contentAnimations.set(el, animation);
    animation.finished.then(
      () => {
        contentAnimations.delete(el);
        done();
      },
      () => {},
    );
  };
  const enterContent = (el: Element, done: () => void) => animateContent(el, done, true);
  const leaveContent = (el: Element, done: () => void) => animateContent(el, done, false);

  // 插槽参数
  const slotProps = computed<PanelSlotProps>(() => ({
    collapsed: !!props.collapsed,
    dragging: state.value.dragging,
    folding: state.value.folding,
  }));

  const wrapperRef = ref<HTMLElement>();
  const contentRef = ref<HTMLElement>();

  // 内容会因首次展开或 keepMounted=false 重新创建，需要重新绑定尺寸订阅。
  watch(
    contentRef,
    (el, _previous, onCleanup) => {
      if (!el || !controller) return;
      const applyContent = (value: number) => {
        el.style[axes.extent] = `${value}px`;
      };
      applyContent(controller.motion.content.get());
      onCleanup(controller.motion.content.on('change', applyContent));
    },
    { flush: 'post' },
  );

  // —— 填充面板绑定 ——
  const fillClipping = computed(() => group.fill.size !== '100%');
  const fillStyle = computed(() => {
    const overflow = fillClipping.value ? 'clip' : 'visible';
    if (props.pin) {
      return {
        flex: '1 1 0%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: axes.direction,
        justifyContent: group.fill.anchor,
        overflow,
      };
    }
    return { flex: '1 1 0%', minWidth: 0, minHeight: 0, overflow };
  });
  // pin 内层： extent 由 fill.size 驱动（'100%' 或像素值），承载折叠动画
  const pinInnerStyle = computed(() => ({
    flexShrink: 0,
    [axes.cross]: '100%',
    [axes.extent]: typeof group.fill.size === 'number' ? `${group.fill.size}px` : group.fill.size,
  }));
  const buildOptions = () => ({
    size: props.size as PanelSize,
    collapsed: props.collapsed,
    defaultSize: props.defaultSize,
    minSize: props.minSize,
    maxSize: props.maxSize,
    transition: props.transition,
    onSizeChange: (value: PanelSize) => emit('update:size', value),
    onCollapsedChange: hasCollapsedBinding
      ? (value: boolean) => {
          emit('update:collapsed', value);
        }
      : undefined,
  });

  let detach: (() => void) | undefined;

  onMounted(() => {
    if (!controller || !wrapperRef.value) {
      return;
    }
    const el = wrapperRef.value;
    detach = controller.attach(el);
    const extentProp = axes.extent;

    // 引擎 MotionValue → DOM：逐帧写入面板/内容尺寸（Vue 响应式不做逐帧绑定）
    const applyExtent = (v: number) => {
      el.style[extentProp] = `${Math.abs(v)}px`;
    };
    applyExtent(controller.motion.size.get());
    unsubs.push(controller.motion.size.on('change', applyExtent));
    unsubs.push(group.subscribe(() => controller.sync(buildOptions())));
    // 初始 sync（mounting=true）：仅初始折叠（或百分比尺寸）的面板需要从 0 展开（vendor 行为）
    controller.sync(buildOptions(), true);
  });

  // props 变化 → 引擎 sync（拖拽中由引擎接管，watcher flush post 与 vendor 渲染后同步一致）
  watch(
    () => [
      props.size,
      props.collapsed,
      props.defaultSize,
      props.minSize,
      props.maxSize,
      props.transition,
    ],
    () => {
      controller?.sync(buildOptions());
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    for (const el of contentAnimations.keys()) cancelContent(el);
    detach?.();
    detach = undefined;
    for (const fn of [...unsubs].reverse()) {
      fn();
    }
    unsubs.length = 0;
    controller?.destroy();
  });

  // —— class 与静态样式 ——
  const sizedClass = [prefixCls];
  const contentClass = [`${prefixCls}-content`];
  const fillClass = [`${prefixCls}-fill`];
  const pinInnerClass = [`${prefixCls}-fill-inner`];

  const sizedStaticStyle = computed(() => ({
    flexDirection: axes.direction,
    justifyContent: state.value.end ? 'flex-start' : 'flex-end',
    overflow: props.collapsed || state.value.dragging || state.value.folding ? 'clip' : 'visible',
  }));
</script>
