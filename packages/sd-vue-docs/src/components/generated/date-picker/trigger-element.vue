<template>
  <sd-space>
    <sd-date-picker class="sd:w-67" v-model="value">
      <template #trigger="{ displayValue, popupVisible }">
        <sd-button>
          {{ displayValue || '请选择日期' }}（{{ popupVisible ? '收起' : '展开' }}）
        </sd-button>
      </template>
    </sd-date-picker>
    <sd-range-picker class="sd:w-67" v-model="rangeValue">
      <template #trigger="{ displayValue, popupVisible }">
        <sd-button>
          {{ displayValue.filter(Boolean).join(' - ') || '请选择日期范围' }}
          （{{ popupVisible ? '收起' : '展开' }}）
        </sd-button>
      </template>
    </sd-range-picker>
  </sd-space>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref();
  const rangeValue = ref();
</script>
