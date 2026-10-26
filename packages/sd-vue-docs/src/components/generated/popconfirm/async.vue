<template>
  <sd-popconfirm :on-before-ok="handleBeforeOk">
    <sd-button>点击显示</sd-button>
    <template #content>
      <sd-form :model="form">
        <sd-form-item label="姓名">
          <sd-input />
        </sd-form-item>
        <sd-form-item label="岗位">
          <sd-input />
        </sd-form-item>
      </sd-form>
    </template>
  </sd-popconfirm>
</template>

<script setup lang="ts">
  const form = {};

  const handleBeforeOk = () =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 3000);
    });
</script>
