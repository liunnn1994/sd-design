<script setup lang="ts">
  import { onMounted, watch } from 'vue';

  import { useData } from 'vitepress';

  const { isDark } = useData();

  const syncTheme = (dark: boolean) => {
    if (typeof document === 'undefined') {
      return;
    }

    if (dark) {
      document.body.setAttribute('sd-theme', 'dark');
      return;
    }

    document.body.removeAttribute('sd-theme');
  };

  onMounted(() => {
    syncTheme(isDark.value);
  });

  watch(isDark, (dark) => {
    syncTheme(dark);
  });
</script>

<template>
  <div style="display: none" aria-hidden="true" />
</template>
