<template>
  <div class="sd:w-160">
    <sd-radio-group v-model="mode" type="button" class="sd:mb-3">
      <sd-radio value="dynamic">动态行高</sd-radio>
      <sd-radio value="fixed">固定行高</sd-radio>
    </sd-radio-group>

    <div class="sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]">
      {{ helperText }}
    </div>

    <sd-list :virtualListProps="virtualListProps" :data="list">
      <template #item="{ item, index }">
        <sd-list-item :key="index">
          <sd-list-item-meta :title="item.title" :description="getDescription(item)">
            <template #avatar>
              <sd-avatar shape="square">{{ item.prefix }}</sd-avatar>
            </template>
          </sd-list-item-meta>
        </sd-list-item>
      </template>
    </sd-list>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  type ListItem = {
    key: string;
    prefix: string;
    title: string;
    shortDescription: string;
    longDescription: string;
  };

  const mode = ref<'dynamic' | 'fixed'>('dynamic');

  const helperText = computed(() => {
    return mode.value === 'dynamic'
      ? '列表默认适应动态行高。此模式设置 minItemSize: 72，使较长描述可以自然撑开。'
      : '所有行需要保持相同高度且无需实时测量时，可设置 itemSize: 72。';
  });

  const virtualListProps = computed(() => {
    return mode.value === 'dynamic'
      ? { height: 520, minItemSize: 72 }
      : { height: 520, itemSize: 72 };
  });

  const getDescription = (item: ListItem) => {
    return mode.value === 'dynamic' ? item.longDescription : item.shortDescription;
  };

  const list: ListItem[] = Array(2400)
    .fill(null)
    .map((_, index) => {
      const prefix = `0${(index % 26) + 10}`.slice(-2);
      const shortDescription = `(${index}) 固定行高使列表保持一致的视觉节奏。`;
      const longDescription = [
        `(${index}) 动态行高让丰富内容保持可读，无需强制所有卡片使用相同高度。`,
        index % 3 === 0 ? '此项包含更多说明，便于滚动时观察行高差异。' : '',
        index % 5 === 0 ? '同时模拟辅助信息和更长的摘要。' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return {
        key: `list-${index}`,
        prefix,
        title: `虚拟列表项目 ${index}`,
        shortDescription,
        longDescription,
      };
    });
</script>
