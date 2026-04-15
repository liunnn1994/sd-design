```yaml
title:
  zh-CN: 自定义标签
  en-US: Custom Label
```

## zh-CN

可以通过 `label` 插槽自定义标签

---

## en-US

You can customize labels through the 'label' slot

---

```vue
<template>
  <sd-timeline>
    <sd-timeline-item>
      Code Review
      <template #label>
        <sd-tag>
          <template #icon>
            <icon-check-circle-fill />
          </template>
          Passed
        </sd-tag>
      </template>
    </sd-timeline-item>
  </sd-timeline>
</template>
```
