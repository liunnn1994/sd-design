```yaml
title:
  zh-CN: 自定义节点内容
  en-US: Icon
```

## zh-CN

自定义节点内容

---

## en-US

Custom node content

---

```vue
<template>
  <sd-timeline>
    <sd-timeline-item label="2017-03-10" dotColor="#00B42A"> The first milestone </sd-timeline-item>
    <sd-timeline-item label="2018-05-22">The second milestone</sd-timeline-item>
    <sd-timeline-item label="2020-06-22" dotColor="#F53F3F">
      The third milestone
      <IconExclamationCircleFill
        :style="{ color: 'F53F3F', fontSize: '12px', marginLeft: '4px' }"
      />
    </sd-timeline-item>
    <sd-timeline-item label="2020-09-30" dotColor="#C9CDD4"> The fourth milestone </sd-timeline-item>
  </sd-timeline>
</template>

<script>
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconExclamationCircleFill },
  };
</script>
```
