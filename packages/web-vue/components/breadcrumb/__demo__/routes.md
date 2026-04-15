```yaml
title:
  zh-CN: 参数化配置
  en-US: Parameterized configuration
```

## zh-CN

通过 `routes` 来传递面包屑数据。若是要自定义面包屑的话，建议使用 `<sd-breadcrumb-item />` 组件。默认使用 `a` 标签的 `href` 属性绑定路径，可通过 `item` 插槽自定义渲染。

---

## en-US

Transfer breadcrumb data through `routes`. If you want to customize bread crumbs, it is recommended to use the `< a-breadcrumb-item />` component. the path is bound with the `href` attribute of the `a` tag by default, you can customize the rendering through the `item` slot.

---

```vue
<template>
  <sd-space direction="vertical">
    <sd-breadcrumb :routes="routes" />
    <sd-breadcrumb :routes="routes">
      <template #item-render="{ route, paths }">
        <sd-link :href="paths.join('/')">
          {{ route.label }}
        </sd-link>
      </template>
    </sd-breadcrumb>
  </sd-space>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          {
            path: '/',
            label: 'Home',
          },
          {
            path: '/channel',
            label: 'Channel',
          },
          {
            path: '/news',
            label: 'News',
          },
        ],
      };
    },
  };
</script>
```
