```yaml
title:
  zh-CN: 下拉菜单滚动
  en-US: Dropdown Scroll
```

## zh-CN

可以通过 `dropdown-scroll` 监听下拉菜单的滚动事件。或者通过 `dropdown-reach-bottom` 监听下拉菜单滚动到底部的事件。

---

## en-US

You can monitor the scroll event of the drop-down menu through `dropdown-scroll`. Or use `dropdown-reach-bottom` to monitor the event of the drop-down menu scrolling to the bottom.

---

```vue
<template>
  <sd-select
    :style="{ width: '320px' }"
    default-value="Beijing"
    placeholder="Please select ..."
    @dropdown-scroll="handleScroll"
    @dropdown-reach-bottom="handleReachBottom"
  >
    <sd-option>Beijing</sd-option>
    <sd-option>Shanghai</sd-option>
    <sd-option>Guangzhou</sd-option>
    <sd-option disabled>Disabled</sd-option>
    <sd-option>Shenzhen</sd-option>
    <sd-option>Chengdu</sd-option>
    <sd-option>Wuhan</sd-option>
  </sd-select>
</template>

<script>
  export default {
    setup() {
      const handleScroll = (ev) => {
        console.log('scroll', ev);
      };
      const handleReachBottom = (ev) => {
        console.log('reach the bottom', ev);
      };

      return {
        handleScroll,
        handleReachBottom,
      };
    },
  };
</script>
```
