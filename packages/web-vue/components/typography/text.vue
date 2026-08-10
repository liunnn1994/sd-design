<template>
  <Base v-bind="$attrs" :ellipsis="ellipsis" :component="component">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Base>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import type { BaseProps } from './interface';

  import Base from './base.vue';

  defineOptions({
    name: 'TypographyText',
    inheritAttrs: false,
  });

  const props = defineProps({
    ellipsis: {
      type: [Boolean, Object] as PropType<BaseProps['ellipsis']>,
      default: false,
    },
  });

  const component = computed(() => (props.ellipsis ? 'div' : 'span'));
</script>
