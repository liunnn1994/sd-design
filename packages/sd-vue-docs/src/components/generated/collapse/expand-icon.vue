<template>
  <sd-collapse :default-active-key="['1', 2]">
    <template #expand-icon="{ active }">
      <icon-face-smile-fill v-if="active" />
      <icon-face-frown-fill v-else />
    </template>
    <sd-collapse-item header="示例数据有限公司" key="1">
      <template #expand-icon="{ active }">
        <icon-double-down v-if="active" />
        <icon-double-right v-else />
      </template>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item header="示例数据有限公司" :key="2">
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item header="示例数据有限公司" key="3">
      <div>示例数据有限公司</div>
    </sd-collapse-item>
  </sd-collapse>
</template>
