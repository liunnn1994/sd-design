<template>
  <div>
    <sd-row align="center">
      <sd-typography-text>labelPosition: &nbsp; &nbsp;</sd-typography-text>
      <sd-radio-group @change="onLabelPositionChange" :modelValue="pos">
        <sd-radio value="same">同侧</sd-radio>
        <sd-radio value="relative">相对位置</sd-radio>
      </sd-radio-group>
    </sd-row>
    <sd-row align="center" class="sd:mt-5 sd:mb-6">
      <sd-typography-text>mode: &nbsp; &nbsp;</sd-typography-text>
      <sd-radio-group @change="onModeChange" :modelValue="mode">
        <sd-radio value="left">左侧</sd-radio>
        <sd-radio value="right">右侧</sd-radio>
        <sd-radio value="alternate">交替</sd-radio>
      </sd-radio-group>
    </sd-row>
    <sd-timeline :mode="mode" :labelPosition="pos">
      <sd-timeline-item label="2017-03-10" dotColor="#52C419"> 第一个里程碑 </sd-timeline-item>
      <sd-timeline-item label="2018-05-12" dotColor="#F5222D" labelPosition="same">
        第二个里程碑
      </sd-timeline-item>
      <sd-timeline-item label="2020-09-30" position="bottom"> 第三个里程碑 </sd-timeline-item>
    </sd-timeline>
  </div>
</template>

<script setup lang="ts">
  import type { LabelPositionType, ModeType } from '@sdata/web-vue';

  import { ref } from 'vue';

  const mode = ref<ModeType>('left');
  const pos = ref<LabelPositionType>('same');

  const onLabelPositionChange = (_pos: string | number | boolean) => {
    pos.value = _pos as LabelPositionType;
  };

  const onModeChange = (_mode: string | number | boolean) => {
    mode.value = _mode as ModeType;
  };
</script>
