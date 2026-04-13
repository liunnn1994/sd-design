<template>
  <a-row justify="space-between">
    <a-timeline mode="alternate" :style="{ flex: 1 }">
      <a-timeline-item label="2017-03-10">The first milestone</a-timeline-item>
      <a-timeline-item label="2018-05-12">The second milestone</a-timeline-item>
      <a-timeline-item label="2020-09-30" position="bottom"> The third milestone </a-timeline-item>
    </a-timeline>
    <a-timeline mode="right" :style="{ flex: 1 }">
      <a-timeline-item label="2017-03-10">The first milestone</a-timeline-item>
      <a-timeline-item label="2018-05-12">The second milestone</a-timeline-item>
      <a-timeline-item label="2020-09-30" position="bottom"> The third milestone </a-timeline-item>
    </a-timeline>
  </a-row>
</template>
