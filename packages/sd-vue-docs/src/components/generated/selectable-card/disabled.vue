<template>
  <sd-space :size="16">
    <sd-selectable-card
      label="可选方案"
      :is-selected="false"
      title="可选方案"
      value="随时启用"
      @change="onChange"
    />
    <sd-selectable-card
      label="不可选方案"
      :is-selected="true"
      is-disabled
      title="不可选方案"
      value="已停用"
      color="gray"
      variant="soft"
      @change="onChange"
    />
  </sd-space>
</template>

<script setup lang="ts">
  function onChange(_isSelected: boolean) {
    // 在这里同步业务选择状态
  }
</script>
