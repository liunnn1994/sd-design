<template>
  <!-- 面板自带边缘杆（own）：绝对定位在面板边缘 -->
  <div v-if="own" :class="slotClass" :style="ownStyle">
    <div
      ref="gripRef"
      v-bind="$attrs"
      :class="gripClass"
      :style="gripStyle"
      role="separator"
      tabindex="0"
      :aria-orientation="axes.separator"
      :aria-label="ariaLabel"
    >
      <slot>
        <div :class="`${triggerCls}-icon-wrapper`" aria-hidden="true">
          <IconDragDot v-if="axes.separator === 'horizontal'" :class="`${triggerCls}-icon`" />
          <IconDragDotVertical v-else :class="`${triggerCls}-icon`" />
        </div>
      </slot>
    </div>
  </div>
  <!-- 独立 Separator：占位元素，两侧面板通过 group 协作 -->
  <div v-else :class="slotClass" :style="slotStyle" data-sd-panels-separator>
    <div
      ref="gripRef"
      v-bind="$attrs"
      :class="gripClass"
      :style="gripStyle"
      role="separator"
      tabindex="0"
      :aria-orientation="axes.separator"
      :aria-label="ariaLabel"
    >
      <slot>
        <div :class="`${triggerCls}-icon-wrapper`" aria-hidden="true">
          <IconDragDot v-if="axes.separator === 'horizontal'" :class="`${triggerCls}-icon`" />
          <IconDragDotVertical v-else :class="`${triggerCls}-icon`" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

  import type { PanelController } from './core/panel';

  import { getPrefixCls } from '../_utils/global-config';
  import IconDragDot from '../icon/icon-drag-dot';
  import IconDragDotVertical from '../icon/icon-drag-dot-vertical';
  import { useI18n } from '../locale';
  import { usePanelGroup } from './context';
  import { edgeSize } from './core/env';
  import { attachSeparator } from './core/separator';

  defineOptions({ name: 'PanelSeparator', inheritAttrs: false });

  /** @zh 自定义伸缩杆内容 @en Custom resize grip content */
  defineSlots<{ default?: () => unknown }>();

  const props = defineProps<{
    /**
     * @zh 无障碍标签
     * @en Accessibility label
     */
    ariaLabel?: string;
    /**
     * @zh 内部标记：作为面板自带边缘杆使用（不与外部 Separator 组件混用）
     * @en Internal flag: used as the panel's built-in edge grip
     */
    own?: PanelController;
  }>();

  const { t } = useI18n();
  const group = usePanelGroup();
  const { axes } = group;

  const prefixCls = getPrefixCls('panel-separator');

  const gripRef = ref<HTMLElement>();
  let detach: (() => void) | undefined;

  // own.state 是引擎整体替换的非响应式对象，订阅镜像出 end 供模板消费
  const ownEnd = ref(props.own?.state.end ?? false);
  let unsubOwn: (() => void) | undefined;
  if (props.own) {
    unsubOwn = props.own.subscribe(() => {
      ownEnd.value = props.own?.state.end ?? false;
    });
  }

  onMounted(() => {
    if (gripRef.value) {
      detach = attachSeparator(gripRef.value, group, props.own);
    }
  });

  onBeforeUnmount(() => {
    detach?.();
    unsubOwn?.();
  });

  const ariaLabel = computed(() => props.ariaLabel ?? t('a11y.resize'));

  const slotClass = computed(() => (props.own ? [`${prefixCls}-edge`] : [prefixCls]));

  const triggerCls = getPrefixCls('resizebox-trigger');
  const gripClass = [`${prefixCls}-grip`, triggerCls, `${triggerCls}-${axes.separator}`];

  // 边缘杆的绝对定位（逻辑属性，RTL 安全）：
  // state.end 表示填充面板在 end 侧，杆锚定在面板的 end 边缘。
  const ownStyle = computed(() => {
    const end = ownEnd.value;
    const anchor =
      axes.axis === 'Inline'
        ? end
          ? 'insetInlineEnd'
          : 'insetInlineStart'
        : end
          ? 'insetBlockEnd'
          : 'insetBlockStart';

    return {
      position: 'absolute' as const,
      [anchor]: 0,
      [axes.axis === 'Inline' ? 'insetBlock' : 'insetInline']: 0,
    };
  });

  // 独立 Separator：0 尺寸占位，grip 溢出显示
  const slotStyle = computed(() => ({
    [axes.extent]: 0,
  }));

  // 边缘杆按指针类型给足命中厚度
  const gripStyle = computed(() => ({
    cursor: axes.cursor,
    ...(props.own ? { [axes.extent]: `${edgeSize()}px` } : {}),
  }));
</script>
