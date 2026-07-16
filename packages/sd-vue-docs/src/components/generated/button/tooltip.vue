<template>
  <sd-space>
    <sd-button type="primary" tooltip="主要按钮的提示">主要按钮</sd-button>
    <sd-button :tooltip="{ content: '自定义位置', position: 'right' }">对象配置</sd-button>
    <sd-button type="text">
      自定义内容
      <template #tooltip>
        <span style="font-weight: bold; color: rgb(255, 125, 0)">支持任意自定义</span>
      </template>
    </sd-button>
  </sd-space>
</template>

<script setup lang="ts"></script>
