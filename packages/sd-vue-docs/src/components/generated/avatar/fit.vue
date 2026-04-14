<template>
  <a-avatar
    :style="{
      marginRight: '24px',
      verticalAlign: 'middle',
      backgroundColor: '#14a9f8',
    }"
  >
    {{ text }}
  </a-avatar>
  <a-button type="secondary" @click="onClick" :style="{ verticalAlign: 'middle' }">
    Change
  </a-button>
</template>

<script>
  import { computed, ref } from 'vue';

  const list = ['B', 'SD', 'Design', 'Tom', 'AD'];
  export default {
    setup() {
      const index = ref(0);
      const text = computed(() => list[index.value]);

      const onClick = () => {
        index.value = index.value >= list.length - 1 ? 0 : index.value + 1;
      };

      return {
        text,
        onClick,
      };
    },
  };
</script>
