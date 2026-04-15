<template>
  <div :style="{ display: 'flex' }">
    <sd-timeline :style="{ marginRight: '40px' }">
      <sd-timeline-item label="2020-04-12" dotColor="#00B42A">
        The first milestone
      </sd-timeline-item>
      <sd-timeline-item label="2020-05-17"> The second milestone </sd-timeline-item>
      <sd-timeline-item label="2020-06-22">
        <template #dot>
          <IconClockCircle :style="{ fontSize: '12px', color: '#F53F3F' }" />
        </template>
        The third milestone
      </sd-timeline-item>
      <sd-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        The third milestone
      </sd-timeline-item>
    </sd-timeline>

    <sd-timeline :style="{ marginRight: '40px' }">
      <sd-timeline-item label="2020-04-12">
        <template #dot>
          <IconCheck
            :style="{
              fontSize: '12px',
              padding: '2px',
              boxSizing: 'border-box',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light-1)',
            }"
          />
        </template>
        The first milestone
      </sd-timeline-item>
      <sd-timeline-item label="2020-05-17">
        <template #dot>
          <IconCheck
            :style="{
              fontSize: '12px',
              padding: '2px',
              boxSizing: 'border-box',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light-1)',
            }"
          />
        </template>
      </sd-timeline-item>
      <sd-timeline-item label="2020-06-22">The third milestone</sd-timeline-item>
      <sd-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        The third milestone
      </sd-timeline-item>
    </sd-timeline>

    <sd-timeline>
      <sd-timeline-item label="2020-04-12">The first milestone</sd-timeline-item>
      <sd-timeline-item label="2020-05-17" dotColor="var(--color-fill-4)">
        The second milestone
      </sd-timeline-item>
      <sd-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        The third milestone
      </sd-timeline-item>
    </sd-timeline>
  </div>
</template>

<script>
  import { IconCheck } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconCheck },
  };
</script>
