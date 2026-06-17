<template>
  <sd-space direction="vertical" :size="20" fill>
    <div style="padding: 24px; background: #0d0d1a; border-radius: 16px">
      <sd-border-beam :active="isActive" @activate="onActivate" @deactivate="onDeactivate">
        <div
          style="
            padding: 22px 28px;
            background: #1a1a2e;
            border-radius: 16px;
            color: #e0e0e0;
            min-width: 300px;
          "
        >
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 12px">
            深色背景 · 动画状态: {{ isActive ? '激活' : '停用' }}
          </div>
          <sd-button type="primary" size="small" @click="toggle">
            {{ isActive ? '停用动画' : '激活动画' }}
          </sd-button>
        </div>
      </sd-border-beam>
    </div>
    <div style="padding: 24px; background: #e8e8ee; border-radius: 16px">
      <sd-border-beam
        :active="isActive"
        theme="light"
        @activate="onActivate"
        @deactivate="onDeactivate"
      >
        <div
          style="
            padding: 22px 28px;
            background: #fff;
            border-radius: 16px;
            color: #333;
            min-width: 300px;
          "
        >
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 12px">
            浅色背景 · 动画状态: {{ isActive ? '激活' : '停用' }}
          </div>
          <sd-button type="primary" size="small" @click="toggle">
            {{ isActive ? '停用动画' : '激活动画' }}
          </sd-button>
        </div>
      </sd-border-beam>
    </div>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const isActive = ref(true);

  function toggle() {
    isActive.value = !isActive.value;
  }

  function onActivate() {
    // fade-in animation completed
  }

  function onDeactivate() {
    // fade-out animation completed
  }
</script>
