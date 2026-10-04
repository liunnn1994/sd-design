<template>
  <div class="sd:grid sd:gap-4">
    <div>
      <sd-space>
        <sd-link href="#" icon>Link</sd-link>
        <sd-link href="#" disabled icon>Link</sd-link>
      </sd-space>
    </div>
    <div>
      <sd-space>
        <sd-link href="#">
          <template #icon>
            <icon-edit />
          </template>
          Link
        </sd-link>
        <sd-link href="#" disabled>
          <template #icon>
            <icon-edit />
          </template>
          Link
        </sd-link>
      </sd-space>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconEdit } from '@sdata/web-vue/es/icon/index.js';
</script>
