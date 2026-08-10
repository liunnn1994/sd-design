<template>
  <Base :class="classNames" v-bind="$attrs" :component="component">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Base>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import Base from './base.vue';

  defineOptions({
    name: 'TypographyParagraph',
    inheritAttrs: false,
  });

  const props = defineProps({
    /**
     * @zh 长引用
     * @en Whether enable blockquote
     */
    blockquote: {
      type: Boolean,
    },
    /**
     * @zh 段落的的行高，长文本(大于5行)的时候推荐使用默认行高，短文本(小于等于3行)推荐使用 `close` 紧密的行高。
     * @en The line height of the paragraph, the default line height is recommended for long text (more than 5 lines). `close` line height is recommended for short text (less than or equal to 3 lines).
     */
    spacing: {
      type: String as PropType<'default' | 'close'>,
      default: 'default',
    },
  });

  const prefixCls = getPrefixCls('typography');
  const component = computed(() => (props.blockquote ? 'blockquote' : 'div'));
  const classNames = computed(() => [
    {
      [`${prefixCls}-spacing-close`]: props.spacing === 'close',
    },
  ]);
</script>
