<template>
  <Base v-bind="$attrs" :component="component">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </Base>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import Base from './base.vue';

  defineOptions({
    name: 'TypographyTitle',
    inheritAttrs: false,
  });

  const props = defineProps({
    /**
     * @zh 标题级别，相当于 `h1` `h2` `h3` `h4` `h5` `h6`
     * @en Heading level, equivalent to `h1` `h2` `h3` `h4` `h5` `h6`
     */
    heading: {
      type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>,
      default: 1,
    },
  });

  const component = computed(() => `h${props.heading}` as keyof HTMLElementTagNameMap);
</script>
