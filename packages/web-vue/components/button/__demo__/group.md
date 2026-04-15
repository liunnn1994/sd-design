```yaml
title:
  zh-CN: 组合按钮
  en-US: Button Group
```

## zh-CN

通过 `<sd-button-group>` 组件使按钮以组合方式出现。可用在同级多项操作中。

---

## en-US

Use the `<sd-button-group>` component to make the buttons appear as a group. Can be used in multiple operations at the same level.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-button-group>
      <sd-button>Publish</sd-button>
      <sd-button>
        <template #icon>
          <icon-down />
        </template>
      </sd-button>
    </sd-button-group>
    <sd-button-group>
      <sd-button>Publish</sd-button>
      <sd-button>
        <template #icon>
          <icon-more />
        </template>
      </sd-button>
    </sd-button-group>
    <sd-button-group>
      <sd-button type="primary">
        <icon-left />
        Prev
      </sd-button>
      <sd-button type="primary">
        Next
        <icon-right />
      </sd-button>
    </sd-button-group>
    <sd-space size="large">
      <sd-button-group type="primary">
        <sd-button> copy </sd-button>
        <sd-button> cut </sd-button>
        <sd-button> find </sd-button>
      </sd-button-group>
      <sd-button-group type="primary" status="warning">
        <sd-button>
          <template #icon><icon-heart-fill /></template>
        </sd-button>
        <sd-button>
          <template #icon><icon-star-fill /></template>
        </sd-button>
        <sd-button>
          <template #icon><icon-thumb-up-fill /></template>
        </sd-button>
      </sd-button-group>
      <sd-button-group size="small" disabled>
        <sd-button> prev </sd-button>
        <sd-button> next </sd-button>
      </sd-button-group>
    </sd-space>
  </sd-space>
</template>
```
