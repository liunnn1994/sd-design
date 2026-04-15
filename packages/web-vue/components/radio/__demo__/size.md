```yaml
title:
  zh-CN: 按钮类型单选框组的尺寸
  en-US: Button Radio Group Size
```

## zh-CN

按钮类型的单选框组分为 `mini`、`small`、`medium`、`large` 四种尺寸。

---

## en-US

The radio buttons of the button type have four sizes of `mini`, `small`, `medium`, and `large`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" size="mini">
      <sd-radio value="Beijing">Beijing</sd-radio>
      <sd-radio value="Shanghai">Shanghai</sd-radio>
      <sd-radio value="Guangzhou">Guangzhou</sd-radio>
      <sd-radio value="Shenzhen">Shenzhen</sd-radio>
    </sd-radio-group>
    <sd-radio-group type="button" size="small">
      <sd-radio value="Beijing">Beijing</sd-radio>
      <sd-radio value="Shanghai">Shanghai</sd-radio>
      <sd-radio value="Guangzhou">Guangzhou</sd-radio>
      <sd-radio value="Shenzhen">Shenzhen</sd-radio>
    </sd-radio-group>
    <sd-radio-group type="button">
      <sd-radio value="Beijing">Beijing</sd-radio>
      <sd-radio value="Shanghai">Shanghai</sd-radio>
      <sd-radio value="Guangzhou">Guangzhou</sd-radio>
      <sd-radio value="Shenzhen">Shenzhen</sd-radio>
    </sd-radio-group>
    <sd-radio-group type="button" size="large">
      <sd-radio value="Beijing">Beijing</sd-radio>
      <sd-radio value="Shanghai">Shanghai</sd-radio>
      <sd-radio value="Guangzhou">Guangzhou</sd-radio>
      <sd-radio value="Shenzhen">Shenzhen</sd-radio>
    </sd-radio-group>
  </sd-space>
</template>
```
