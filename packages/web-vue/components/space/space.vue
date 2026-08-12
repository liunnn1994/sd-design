<template>
  <div :class="classes" :style="spaceStyle">
    <template v-for="(item, index) in getItems()" :key="item.key">
      <div v-if="slots.split && index > 0" :class="`${prefixCls}-item-split`">
        <slot name="split" />
      </div>
      <div :class="`${prefixCls}-item`">
        <VNodeRenderer :content="item.content" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { Comment, computed, inject } from 'vue';
  import type { CSSProperties, VNode } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { isArray, isNumber } from '../_utils/is';
  import { getAllElements } from '../_utils/vue-utils';
  import { configProviderInjectionKey } from '../config-provider/context';

  type SpaceSize = number | 'mini' | 'small' | 'medium' | 'large';

  interface SpaceItem {
    key: PropertyKey;
    content: VNode;
  }

  defineOptions({
    name: 'Space',
  });

  const {
    align,
    direction = 'horizontal',
    size = 'small',
    wrap = false,
    fill = false,
  } = defineProps<{
    /**
     * @zh 对齐方式
     * @en Alignment
     * @values 'start', 'end', 'center', 'baseline'
     */
    align?: 'start' | 'end' | 'center' | 'baseline';
    /**
     * @zh 间距方向
     * @en Spacing direction
     */
    direction?: 'vertical' | 'horizontal';
    /**
     * @zh 间距大小，支持分别制定横向和竖向的间距
     * @en Spacing size, support for setting horizontal and vertical spacing separately
     */
    size?: SpaceSize | [SpaceSize, SpaceSize];
    /**
     * @zh 环绕类型的间距，用于折行的场景。
     * @en The spacing of the wrapping type, used in the scene of wrapping.
     */
    wrap?: boolean;
    /**
     * @zh 充满整行
     * @en fill the block
     * @version 2.11.0
     */
    fill?: boolean;
  }>();

  const slots = defineSlots<{
    /**
     * @zh 间距包裹的内容
     * @en Content wrapped by the space
     */
    default?: () => VNode[];
    /**
     * @zh 设置分隔符
     * @en Set separator
     */
    split?: () => VNode[];
  }>();

  const prefixCls = getPrefixCls('space');
  const VNodeRenderer = ({ content }: { content: VNode }) => content;
  const configCtx = inject(configProviderInjectionKey, undefined);
  const rtl = computed(() => configCtx?.rtl ?? false);
  const mergedAlign = computed(() => align ?? (direction === 'horizontal' ? 'center' : ''));

  const classes = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-${direction}`]: direction,
      [`${prefixCls}-align-${mergedAlign.value}`]: mergedAlign.value,
      [`${prefixCls}-wrap`]: wrap,
      [`${prefixCls}-fill`]: fill,
      [`${prefixCls}-rtl`]: rtl.value,
    },
  ]);

  function getSize(value: SpaceSize) {
    if (isNumber(value)) {
      return value;
    }

    switch (value) {
      case 'mini':
        return 4;
      case 'small':
        return 8;
      case 'medium':
        return 16;
      case 'large':
        return 24;
      default:
        return 8;
    }
  }

  const spaceStyle = computed<CSSProperties>(() => {
    const sizeArray = isArray(size) ? size : [size, size];
    const [columnGap, rowGap] = sizeArray.map(getSize);

    return {
      columnGap: `${columnGap}px`,
      rowGap: `${rowGap}px`,
    };
  });

  function getItems(): SpaceItem[] {
    return getAllElements(slots.default?.(), true)
      .filter((item) => item.type !== Comment)
      .map((child, index) => ({
        key: child.key ?? `item-${index}`,
        content: child,
      }));
  }
</script>
