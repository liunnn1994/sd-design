<template>
  <sd-space :size="16" wrap>
    <sd-selectable-card
      v-for="item in cards"
      :key="`${item.color}-${item.variant}`"
      :label="item.label"
      :is-selected="true"
      :color="item.color"
      :variant="item.variant"
      :title="item.label"
      :value="item.value"
      description="已选中"
      width="180px"
      @change="() => {}"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import type { SelectableCardColor, SelectableCardVariant } from '@sdata/web-vue';

  const cards: Array<{
    color: SelectableCardColor;
    label: string;
    value: string;
    variant: SelectableCardVariant;
  }> = [
    { label: '描边', value: '描边', color: 'sdblue', variant: 'outline' },
    { label: '柔和', value: 'Soft', color: 'green', variant: 'soft' },
    { label: '填充', value: 'Filled', color: 'purple', variant: 'filled' },
    { label: '警示', value: '警告', color: 'orange', variant: 'soft' },
    { label: '危险', value: '危险', color: 'red', variant: 'filled' },
  ];
</script>
