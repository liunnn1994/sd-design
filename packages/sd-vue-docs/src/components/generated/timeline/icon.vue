<template>
  <sd-timeline>
    <sd-timeline-item label="2017-03-10" dotColor="#00B42A"> 第一个里程碑 </sd-timeline-item>
    <sd-timeline-item label="2018-05-22">第二个里程碑</sd-timeline-item>
    <sd-timeline-item label="2020-06-22" dotColor="#F53F3F">
      第三个里程碑
      <IconExclamationCircleFill class="sd:text-[f53f3f] sd:text-xs sd:ml-1" />
    </sd-timeline-item>
    <sd-timeline-item label="2020-09-30" dotColor="#C9CDD4"> 第四个里程碑 </sd-timeline-item>
  </sd-timeline>
</template>

<script setup lang="ts">
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon/index.js';
</script>
