<script setup lang="ts">
  import type { Size, TreeNodeData } from '@sdata/web-vue';

  import { computed, ref } from 'vue';

  const sizeToItemSize: Record<Size, number> = {
    mini: 24,
    small: 28,
    medium: 32,
    large: 36,
  };

  function loop(path = '0', level = 2) {
    const list: TreeNodeData[] = [];
    for (let i = 0; i < 10; i += 1) {
      const key = `${path}-${i}`;
      const treeNode: TreeNodeData = {
        title: `Node ${key}`,
        key,
      };

      if (level > 0) {
        treeNode.children = loop(key, level - 1);
      }

      list.push(treeNode);
    }
    return list;
  }

  const size = ref<Size>('medium');
  const mode = ref<'disabled' | 'enabled' | 'explicit'>('disabled');
  const treeData = loop();

  const helperText = computed(() => {
    if (mode.value === 'disabled') {
      return '未传入任何虚拟滚动配置时，TreeSelect 会完整渲染当前展开的节点。';
    }

    if (mode.value === 'enabled') {
      return `virtual-scroll=true 会显式启用虚拟滚动，并使用 ${size.value} 尺寸对应的 ${sizeToItemSize[size.value]}px 固定行高。`;
    }

    return `virtual-list-props 可进一步设置 itemSize、height 和 buffer；当前 itemSize 为 ${sizeToItemSize[size.value]}px。`;
  });

  const virtualBindings = computed(() => {
    if (mode.value === 'disabled') {
      return {};
    }

    if (mode.value === 'enabled') {
      return { virtualScroll: true };
    }

    return {
      virtualListProps: {
        itemSize: sizeToItemSize[size.value],
        height: 240,
        buffer: 220,
      },
    };
  });
</script>

<template>
  <div class="sd:w-90">
    <sd-radio-group v-model="size" type="button" class="sd:mb-3">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>

    <sd-radio-group v-model="mode" type="button" class="sd:mb-3">
      <sd-radio value="disabled">默认不启用</sd-radio>
      <sd-radio value="enabled">virtual-scroll=true</sd-radio>
      <sd-radio value="explicit">virtual-list-props</sd-radio>
    </sd-radio-group>

    <div class="sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]">
      {{ helperText }}
    </div>

    <sd-tree-select
      v-bind="virtualBindings"
      :data="treeData"
      :size="size"
      :allow-search="{
        retainInputValue: true,
      }"
      multiple
      tree-checkable
      tree-checked-strategy="parent"
      :trigger-props="{ popupStyle: { maxHeight: '240px' } }"
      placeholder="请选择节点"
    />
  </div>
</template>
