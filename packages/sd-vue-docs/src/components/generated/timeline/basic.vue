<template>
  <div class="sd:mb-10">
    <sd-typography-text class="sd:mr-2 sd:align-middle"> 倒序 </sd-typography-text>
    <sd-radio-group @change="onChange" class="sd:mb-7.5" :modelValue="isReverse">
      <sd-radio :value="false">不倒序</sd-radio>
      <sd-radio :value="true">倒序</sd-radio>
    </sd-radio-group>
  </div>
  <sd-timeline :reverse="isReverse">
    <sd-timeline-item label="2017-03-10">第一个里程碑</sd-timeline-item>
    <sd-timeline-item label="2018-05-12">第二个里程碑</sd-timeline-item>
    <sd-timeline-item label="2020-09-30">第三个里程碑</sd-timeline-item>
  </sd-timeline>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const isReverse = ref(false);

  const onChange = (bool: string | number | boolean) => {
    isReverse.value = Boolean(bool);
  };
</script>
