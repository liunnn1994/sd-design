```yaml
title:
  zh-CN: 远程搜索
  en-US: Remote search
```

## zh-CN

使用 `search` 事件进行远程搜索，并改变选项。

---

## en-US

Use the `search` event to search remotely and change options.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <div>Show selections after search options</div>
    <sd-select
      :style="{ width: '320px' }"
      :loading="loading"
      placeholder="Please select ..."
      multiple
      @search="handleSearch"
      :filter-option="false"
    >
      <sd-option v-for="item of options" :value="item">{{ item }}</sd-option>
    </sd-select>
    <div>Hide selections after search options</div>
    <sd-select
      :options="options"
      :style="{ width: '320px' }"
      :loading="loading"
      placeholder="Please select ..."
      multiple
      @search="handleSearch"
      :filter-option="false"
      :show-extra-options="false"
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
