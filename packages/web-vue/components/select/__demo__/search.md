```yaml
title:
  zh-CN: 允许搜索
  en-US: Allow Search
```

## zh-CN

通过设置 `allow-search` ，可以让选择器支持对选项的搜索，配合 `filter-option` 可以自定义搜索。

---

## en-US

By setting `allow-search`, you can make the selector support searching for options, and you can customize the search with `filter-option`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-select :style="{ width: '320px' }" placeholder="Please select ..." allow-search>
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select
      :style="{ width: '320px' }"
      placeholder="Please select ..."
      :allow-search="{ retainInputValue: true }"
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select
      :options="options"
      :style="{ width: '320px' }"
      :loading="loading"
      placeholder="Please select ..."
      multiple
      @search="handleSearch"
    />
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const options = ref(['Option1', 'Option2', 'Option3']);
      const loading = ref(false);

      const handleSearch = (value) => {
        if (value) {
          loading.value = true;
          window.setTimeout(() => {
            options.value = [`${value}-Option1`, `${value}-Option2`, `${value}-Option3`];
            loading.value = false;
          }, 2000);
        } else {
          options.value = [];
        }
      };

      return {
        options,
        loading,
        handleSearch,
      };
    },
  };
</script>
```
