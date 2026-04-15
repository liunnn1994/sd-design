```yaml
title:
  zh-CN: 下拉菜单的页脚
  en-US: Dropdown Footer
```

## zh-CN

自定义下拉菜单的页脚

---

## en-US

custom dropdown menu footer

---

```vue
<template>
  <sd-space>
    <sd-select
      :default-value="'Beijing'"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      allow-search
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
      <template #footer>
        <div style="padding: 6px 0; text-align: center;">
          <sd-button>Click Me</sd-button>
        </div>
      </template>
    </sd-select>
    <sd-select
      :default-value="'Beijing'"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      allow-search
      show-footer-on-empty
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
      <template #footer>
        <div style="padding: 6px 0; text-align: center;">
          <sd-button>Click Me</sd-button>
        </div>
      </template>
    </sd-select>
  </sd-space>
</template>
```
