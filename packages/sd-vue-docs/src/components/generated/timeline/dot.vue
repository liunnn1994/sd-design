<template>
  <div class="sd:flex">
    <sd-timeline class="sd:mr-10">
      <sd-timeline-item label="2020-04-12" dotColor="#00B42A"> 第一个里程碑 </sd-timeline-item>
      <sd-timeline-item label="2020-05-17"> 第二个里程碑 </sd-timeline-item>
      <sd-timeline-item label="2020-06-22">
        <template #dot>
          <IconClockCircle class="sd:text-xs sd:text-[#f53f3f]" />
        </template>
        第三个里程碑
      </sd-timeline-item>
      <sd-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        第三个里程碑
      </sd-timeline-item>
    </sd-timeline>

    <sd-timeline class="sd:mr-10">
      <sd-timeline-item label="2020-04-12">
        <template #dot>
          <IconCheck
            class="sd:text-xs sd:p-0.5 sd:box-border sd:rounded-full sd:bg-[var(--color-primary-light-1)]"
          />
        </template>
        第一个里程碑
      </sd-timeline-item>
      <sd-timeline-item label="2020-05-17">
        <template #dot>
          <IconCheck
            class="sd:text-xs sd:p-0.5 sd:box-border sd:rounded-full sd:bg-[var(--color-primary-light-1)]"
          />
        </template>
      </sd-timeline-item>
      <sd-timeline-item label="2020-06-22">第三个里程碑</sd-timeline-item>
      <sd-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        第三个里程碑
      </sd-timeline-item>
    </sd-timeline>

    <sd-timeline>
      <sd-timeline-item label="2020-04-12">第一个里程碑</sd-timeline-item>
      <sd-timeline-item label="2020-05-17" dotColor="var(--color-fill-4)">
        第二个里程碑
      </sd-timeline-item>
      <sd-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        第三个里程碑
      </sd-timeline-item>
    </sd-timeline>
  </div>
</template>

<script setup lang="ts">
  import { IconCheck } from '@sdata/web-vue/es/icon/index.js';
</script>
