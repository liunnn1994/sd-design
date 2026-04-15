```yaml
title:
  zh-CN: 段落
  en-US: Paragraph
```

## zh-CN

文本段落样式。

---

## en-US

Paragraph style.

---

```vue
<template>
  <sd-typography>
    <sd-typography-title :heading="5">Default</sd-typography-title>
    <sd-typography-paragraph>
      A design is a plan or specification for the construction of an object or system or for the
      implementation of an activity or process, or the result of that plan or specification in the
      form of a prototype, product or process. The verb to design expresses the process of
      developing a design. In some cases, the direct construction of an object without an explicit
      prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be
      considered to be a design activity.
    </sd-typography-paragraph>
    <sd-typography-title :heading="5">Secondary</sd-typography-title>
    <sd-typography-paragraph type="secondary">
      A design is a plan or specification for the construction of an object or system or for the
      implementation of an activity or process, or the result of that plan or specification in the
      form of a prototype, product or process. The verb to design expresses the process of
      developing a design. In some cases, the direct construction of an object without an explicit
      prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be
      considered to be a design activity.
    </sd-typography-paragraph>
    <sd-typography-title :heading="5">Spacing default</sd-typography-title>
    <sd-typography-paragraph>
      A design is a plan or specification for the construction of an object or system or for the
      implementation of an activity or process, or the result of that plan or specification in the
      form of a prototype, product or process. The verb to design expresses the process of
      developing a design. In some cases, the direct construction of an object without an explicit
      prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be
      considered to be a design activity.
    </sd-typography-paragraph>
    <sd-typography-title :heading="5">Spacing close</sd-typography-title>
    <sd-typography-paragraph type="secondary" spacing="close">
      A design is a plan or specification for the construction of an object or system or for the
      implementation of an activity or process, or the result of that plan or specification in the
      form of a prototype, product or process. The verb to design expresses the process of
      developing a design.
    </sd-typography-paragraph>
  </sd-typography>
</template>
```
