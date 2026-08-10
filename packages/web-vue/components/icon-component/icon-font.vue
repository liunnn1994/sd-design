<template>
  <Icon v-bind="iconProps">
    <use v-if="type" :xlink:href="`#${type}`" />
    <slot v-else />
  </Icon>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue';

  import Icon from './icon.vue';

  defineOptions({ name: 'IconFont' });

  const props = defineProps({
    type: String,
    size: [Number, String],
    rotate: Number,
    spin: Boolean,
    extraProps: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  });

  const iconProps = computed(() => ({
    type: props.type,
    size: props.size,
    rotate: props.rotate,
    spin: props.spin,
    ...props.extraProps,
  }));
</script>
