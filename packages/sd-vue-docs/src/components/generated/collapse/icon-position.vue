<template>
  <sd-space direction="vertical" class="sd:w-full">
    <sd-space>
      <sd-radio-group type="button" v-model="position">
        <sd-radio value="left">左侧</sd-radio>
        <sd-radio value="right">右侧</sd-radio>
      </sd-radio-group>
      <sd-checkbox v-model="hideIcon">隐藏展开图标</sd-checkbox>
    </sd-space>
    <sd-collapse
      :default-active-key="['1']"
      :expand-icon-position="position"
      :show-expand-icon="!hideIcon"
    >
      <sd-collapse-item header="示例数据有限公司" key="1">
        <template #expand-icon>
          <icon-plus />
        </template>
        <template #extra>
          <sd-tag size="small">城市</sd-tag>
        </template>
        <div>示例数据有限公司</div>
        <div>示例数据有限公司</div>
        <div>示例数据有限公司</div>
      </sd-collapse-item>
      <sd-collapse-item header="示例数据有限公司" key="2" disabled>
        <div>示例数据有限公司</div>
        <div>示例数据有限公司</div>
        <div>示例数据有限公司</div>
      </sd-collapse-item>
      <sd-collapse-item header="示例数据有限公司" key="3">
        <div>示例数据有限公司</div>
        <div>示例数据有限公司</div>
        <div>示例数据有限公司</div>
      </sd-collapse-item>
    </sd-collapse>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const position = ref<'left' | 'right'>('left');
  const hideIcon = ref(false);
</script>
