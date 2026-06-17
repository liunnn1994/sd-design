<template>
  <div style="padding: 24px; background: #0d0d1a; border-radius: 16px">
    <sd-space direction="vertical" :size="16" fill>
      <sd-border-beam ref="beamRef">
        <div
          style="
            min-width: 320px;
            padding: 24px 28px;
            color: #e0e0e0;
            background: #1a1a2e;
            border-radius: 16px;
          "
        >
          <div style="margin-bottom: 8px; font-size: 16px; font-weight: 600"> 水流入场效果 </div>
          <div style="font-size: 13px; line-height: 1.7; opacity: 0.68">
            通过组件实例方法从指定坐标触发一次扩散入场，动画结束后保持当前边框光束。
          </div>
        </div>
      </sd-border-beam>

      <sd-space :size="8" wrap>
        <sd-button type="primary" size="small" @click="triggerDefault">默认右上</sd-button>
        <sd-button size="small" @click="triggerCenter">中心扩散</sd-button>
        <sd-button size="small" @click="triggerBottomLeft">左下扩散</sd-button>
        <sd-button size="small" @click="triggerCustom">自定义坐标</sd-button>
      </sd-space>
    </sd-space>
  </div>
</template>

<script setup lang="ts">
  import type { BorderBeamInstance } from '@sdata/web-vue';

  import { ref } from 'vue';

  const beamRef = ref<BorderBeamInstance | null>(null);

  function triggerDefault() {
    beamRef.value?.flowFrom();
  }

  function triggerCenter() {
    beamRef.value?.flowFrom('center');
  }

  function triggerBottomLeft() {
    beamRef.value?.flowFrom('bottom-left');
  }

  function triggerCustom() {
    beamRef.value?.flowFrom({ x: 48, y: 36 });
  }
</script>
