<template>
  <sd-space>
    <sd-color-picker v-model="value" size="mini">
      <template #trigger="{ displayValue, color, popupVisible }">
        <sd-tag :color="displayValue" class="color-picker-trigger-tag">
          <template #icon>
            <span class="color-picker-trigger-tag__contrast">
              <icon-bg-colors />
            </span>
          </template>
          <span class="color-picker-trigger-tag__contrast">
            {{ displayValue }} · {{ color.hex }} · {{ popupVisible ? '收起' : '展开' }}
          </span>
        </sd-tag>
      </template>
    </sd-color-picker>
  </sd-space>
</template>

<script setup>
  import { ref } from 'vue';

  const value = ref('#165DFF');
</script>

<style>
  .color-picker-trigger-tag__contrast {
    color: #fff;
    mix-blend-mode: difference;
    user-select: none;
  }
</style>
