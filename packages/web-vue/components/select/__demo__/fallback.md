```yaml
title:
  zh-CN: 回退选项
  en-US: Fallback Option
```

## zh-CN

使用 `fallback-option` 自定义选项中不存在的值，默认会在输入框中展示不存在的选项值。可能用于选项还没有获取完，或者远程搜索时选项改变了。

---

## en-US

Use `fallback-option` to customize the value that does not exist in the option. By default, the value of the option that does not exist in the input box will display. It may be used when the options have not been obtained, or the options have changed during remote search.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-select
      defaultValue="Shanxi"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      :fallback-option="fallback"
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
    <sd-select
      defaultValue="Shanxi"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      :fallback-option="fallback"
      :show-extra-options="false"
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Shanxi', 'Nanjing', 'Hangzhou']"
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      multiple
      :fallback-option="fallback"
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
  </sd-space>
</template>

<script>
  export default {
    setup() {
      const fallback = (value) => {
        return {
          value,
          label: `++${value}++`,
        };
      };
      return {
        fallback,
      };
    },
  };
</script>
```
