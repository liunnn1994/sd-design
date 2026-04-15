<template>
  <sd-form auto-label-width>
    <sd-form-item label="Tag Number">
      <sd-input-number v-model="number" :min="0" :max="20" style="width: 200px" />
    </sd-form-item>
    <sd-form-item label="List Width">
      <sd-slider v-model="width" :min="0" :max="800" />
    </sd-form-item>
  </sd-form>
  <div :style="{ width: `${width}px`, marginTop: '20px' }">
    <sd-overflow-list from="start">
      <div>DIV Element</div>
      <sd-tag v-for="item of tags" :key="item">Tag{{ item }}</sd-tag>
    </sd-overflow-list>
  </div>
</template>

<script>
  import { computed, ref } from 'vue';

  export default {
    setup() {
      const width = ref(500);
      const number = ref(10);
      const tags = computed(() => Array.from({ length: number.value }, (_, idx) => idx + 1));

      return {
        width,
        number,
        tags,
      };
    },
  };
</script>
