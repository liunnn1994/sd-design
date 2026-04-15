```yaml
title:
  zh-CN: 标签文本位置
  en-US: Label Position
```

## zh-CN

通过 `labelPosition` 可以设置标签文本的位置。

---

## en-US

The position of the label text can be set by `labelPosition`.

---

```vue
<template>
  <div>
    <sd-row align="center">
      <sd-typography-text>labelPosition: &nbsp; &nbsp;</sd-typography-text>
      <sd-radio-group @change="onLabelPositionChange" :modelValue="pos">
        <sd-radio value="same">same</sd-radio>
        <sd-radio value="relative">relative</sd-radio>
      </sd-radio-group>
    </sd-row>
    <sd-row align="center" :style="{ margin: '20px 0px 24px' }">
      <sd-typography-text>mode: &nbsp; &nbsp;</sd-typography-text>
      <sd-radio-group @change="onModeChange" :modelValue="mode">
        <sd-radio value="left">left</sd-radio>
        <sd-radio value="right">right</sd-radio>
        <sd-radio value="alternate">alternate</sd-radio>
      </sd-radio-group>
    </sd-row>
    <sd-timeline :mode="mode" :labelPosition="pos">
      <sd-timeline-item label="2017-03-10" dotColor="#52C419"> The first milestone </sd-timeline-item>
      <sd-timeline-item label="2018-05-12" dotColor="#F5222D" labelPosition="same">
        The second milestone
      </sd-timeline-item>
      <sd-timeline-item label="2020-09-30" position="bottom"> The third milestone </sd-timeline-item>
    </sd-timeline>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const mode = ref('left');
      const pos = ref('same');

      const onLabelPositionChange = (_pos) => {
        pos.value = _pos;
      };

      const onModeChange = (_mode) => {
        mode.value = _mode;
      };

      return {
        mode,
        pos,
        onLabelPositionChange,
        onModeChange,
      };
    },
  };
</script>
```
