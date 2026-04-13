<template>
  <a-typography>
    <a-typography-paragraph copyable>
      Click the icon to copy this text.
    </a-typography-paragraph>
    <a-typography-paragraph
      editable
      v-model:editText="str"
    >
      {{str}}
    </a-typography-paragraph>
  </a-typography>
</template>
<script>
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const str = ref('Click the icon to edit this text.');
    return {
      str,
    }
  }
});
</script>
