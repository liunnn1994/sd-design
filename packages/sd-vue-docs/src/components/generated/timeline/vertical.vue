<template>
  <div>
    <sd-row align="center" class="sd:mb-6">
      <sd-typography-text>mode: &nbsp; &nbsp;</sd-typography-text>
      <sd-radio-group @change="onChange" :modelValue="mode">
        <sd-radio value="left">左侧</sd-radio>
        <sd-radio value="right">右侧</sd-radio>
        <sd-radio value="alternate">交替</sd-radio>
      </sd-radio-group>
    </sd-row>
    <sd-timeline :mode="mode" labelPosition="relative">
      <sd-timeline-item label="2012-08">
        <sd-row class="sd:inline-flex sd:items-center">
          <img alt="" width="40" class="sd:mr-4 sd:mb-3" src="https://picsum.photos/240/240" />
          <div class="sd:mb-3">
            事项一
            <div class="sd:text-xs sd:text-[#4e5969]"> 成立于 2012 年 </div>
          </div>
        </sd-row>
      </sd-timeline-item>
      <sd-timeline-item label="2017-05">
        <sd-row class="sd:inline-flex sd:items-center">
          <img alt="" width="40" class="sd:mr-4 sd:mb-3" src="https://picsum.photos/240/240" />
          <div class="sd:mb-3">
            事项二
            <div class="sd:text-xs sd:text-[#4e5969]"> 成立于 2017 年 </div>
          </div>
        </sd-row>
      </sd-timeline-item>
      <sd-timeline-item label="2018-07">
        <sd-row class="sd:inline-flex sd:items-center">
          <img alt="" width="40" class="sd:mr-4 sd:mb-3" src="https://picsum.photos/240/240" />
          <div class="sd:mb-3">
            事项三
            <div class="sd:text-xs sd:text-[#4e5969]"> 成立于 2018 年 </div>
          </div>
        </sd-row>
      </sd-timeline-item>
    </sd-timeline>
  </div>
</template>

<script setup lang="ts">
  import type { ModeType } from '@sdata/web-vue';

  import { ref } from 'vue';

  const mode = ref<ModeType>('left');

  const onChange = (_mode: string | number | boolean) => {
    mode.value = _mode as ModeType;
  };
</script>
