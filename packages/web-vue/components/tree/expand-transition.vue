<template>
  <transition @enter="onEnter" @after-enter="onAfterEnter" @before-leave="onBeforeLeave">
    <slot />
  </transition>
</template>

<script setup lang="ts">
  import { createTreeExpandTransition } from '@sdata/web-core/tree/expand-transition';

  defineOptions({ name: 'ExpandTransition' });

  const props = defineProps({
    expanded: Boolean,
  });

  const emit = defineEmits<{ end: [] }>();

  const { onEnter, onAfterEnter, onBeforeLeave } = createTreeExpandTransition(props, emit);
</script>
