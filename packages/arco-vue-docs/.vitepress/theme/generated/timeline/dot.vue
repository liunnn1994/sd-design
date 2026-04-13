<template>
  <div :style="{ display: 'flex' }">
    <a-timeline :style="{ marginRight: '40px' }">
      <a-timeline-item label="2020-04-12" dotColor="#00B42A">
        The first milestone
      </a-timeline-item>
      <a-timeline-item label="2020-05-17">
        The second milestone
      </a-timeline-item>
      <a-timeline-item label="2020-06-22">
        <template #dot>
          <IconClockCircle :style="{ fontSize: '12px', color: '#F53F3F' }" />
        </template>
        The third milestone
      </a-timeline-item>
      <a-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        The third milestone
      </a-timeline-item>
    </a-timeline>

    <a-timeline :style="{ marginRight: '40px' }">
      <a-timeline-item label="2020-04-12">
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
      </a-timeline-item>
      <a-timeline-item label="2020-05-17">
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
      </a-timeline-item>
      <a-timeline-item label="2020-06-22">The third milestone</a-timeline-item>
      <a-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        The third milestone
      </a-timeline-item>
    </a-timeline>

    <a-timeline>
      <a-timeline-item label="2020-04-12">The first milestone</a-timeline-item>
      <a-timeline-item label="2020-05-17" dotColor="var(--color-fill-4)">
        The second milestone
      </a-timeline-item>
      <a-timeline-item label="2020-06-22" dotColor="var(--color-fill-4)">
        The third milestone
      </a-timeline-item>
    </a-timeline>
  </div>
</template>

<script>
import { IconCheck } from '@arco-design/web-vue/es/icon';

export default {
  components: { IconCheck },
};
</script>
