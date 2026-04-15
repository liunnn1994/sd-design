```yaml
title:
  zh-CN: 确认框类型
  en-US: Type
```

## zh-CN

通过 `type` 属性可以设置确认框类型。

---

## en-US

The type of the confirmation box can be set via the `type` property.

---

```vue
<template>
  <sd-space>
    <sd-popconfirm content="Are you sure you want to delete?" type="info">
      <sd-button>Click To Delete</sd-button>
    </sd-popconfirm>
    <sd-popconfirm content="Are you sure you want to delete?" type="success">
      <sd-button>Click To Delete</sd-button>
    </sd-popconfirm>
    <sd-popconfirm content="Are you sure you want to delete?" type="warning">
      <sd-button>Click To Delete</sd-button>
    </sd-popconfirm>
    <sd-popconfirm content="Are you sure you want to delete?" type="error">
      <sd-button>Click To Delete</sd-button>
    </sd-popconfirm>
  </sd-space>
</template>
```
