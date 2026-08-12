<template>
  <sd-popconfirm :on-before-ok="handleBeforeOk">
    <sd-button>Click To Show</sd-button>
    <template #content>
      <sd-form :model="form">
        <sd-form-item label="Name">
          <sd-input />
        </sd-form-item>
        <sd-form-item label="Post">
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
