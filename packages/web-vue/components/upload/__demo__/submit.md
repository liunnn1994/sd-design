```yaml
title:
  zh-CN: 手动上传
  en-US: manual upload
```

## zh-CN

设置 `auto-upload` 为 `false` 时候，可以通过调用 `submit` 方法进行手动上传。

---

## en-US

When setting `auto-upload` to `false`, you can manually upload by calling the `submit` method.

---

```vue
<template>
  <div>
    <sd-upload action="/" :auto-upload="false" ref="uploadRef" @change="onChange" multiple>
      <template #upload-button>
        <sd-space>
          <sd-button> select file</sd-button>
          <sd-button type="primary" @click="submit"> start upload</sd-button>
          <sd-button type="primary" @click="submitOne"> only upload one </sd-button>
        </sd-space>
      </template>
    </sd-upload>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const uploadRef = ref();
      const files = ref([]);

      const submitOne = (e) => {
        e.stopPropagation();
        console.log(files.value);
        uploadRef.value.submit(files.value.find((x) => x.status === 'init'));
      };

      const submit = (e) => {
        e.stopPropagation();
        uploadRef.value.submit();
      };

      const onChange = (fileList) => {
        files.value = fileList;
      };

      return {
        uploadRef,
        files,
        submitOne,
        submit,
        onChange,
      };
    },
  };
</script>
```
