<script setup lang="ts">
  import { computed, shallowRef } from 'vue';

  import { iconCatalog } from '@sdata/web-core/icon/icons/catalog';
  import { Button, Input } from '@sdata/web-vue';
  import * as Icons from '@sdata/web-vue/es/icon/index.js';

  const search = shallowRef('');
  const spin = shallowRef(false);
  const selected = shallowRef('IconPlus');
  const matches = computed(() =>
    iconCatalog.filter((item) =>
      item.componentName.toLowerCase().includes(search.value.toLowerCase()),
    ),
  );
</script>

<template>
  <div class="sd:grid sd:gap-4">
    <div class="sd:flex sd:gap-3 sd:items-center">
      <Icons.IconPlus
        data-testid="icon-demo-preview"
        :size="32"
        :rotate="45"
        :spin="spin"
        aria-label="加号图标"
      />
      <Button @click="spin = !spin">{{ spin ? '停止旋转' : '开始旋转' }}</Button>
    </div>
    <Input
      v-model="search"
      :input-attrs="{ 'aria-label': '搜索图标' }"
      placeholder="输入图标名称，例如 Arrow 或 Plus"
    />
    <output data-testid="icon-demo-count">{{ matches.length }} / {{ iconCatalog.length }}</output>
    <pre
      data-testid="icon-demo-import"
    ><code>{{ `import { ${selected} } from '@sdata/web-vue/es/icon/index.js';` }}</code></pre>
    <div
      data-testid="icon-demo-gallery"
      class="sd:grid sd:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sd:gap-2"
    >
      <Button
        v-for="item in matches"
        :key="item.name"
        type="text"
        style="height: auto; min-height: 72px; padding: 8px"
        @click="selected = item.componentName"
      >
        <span class="sd:grid sd:justify-items-center sd:gap-2">
          <component :is="Icons[item.componentName]" :size="24" aria-hidden="true" />
          <span class="sd:text-[11px]">{{ item.componentName }}</span>
        </span>
      </Button>
    </div>
  </div>
</template>
