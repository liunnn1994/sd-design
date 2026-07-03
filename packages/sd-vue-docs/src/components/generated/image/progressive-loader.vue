<template>
  <div>
    <sd-button
      type="primary"
      @click="
        () => {
          timestamp = Date.now();
        }
      "
      class="sd:mb-5"
    >
      reload
    </sd-button>
  </div>
  <sd-image
    width="200"
    height="200"
    :src="`https://picsum.photos/id/10/1000/1000?t=image-demo-timestamp-17-${timestamp}`"
  >
    <template #loader>
      <img
        alt=""
        width="200"
        src="https://picsum.photos/id/10/1000/1000?t=image-demo-17"
        class="sd:blur-[5px]"
      />
    </template>
  </sd-image>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const timestamp = ref(Date.now());
</script>
