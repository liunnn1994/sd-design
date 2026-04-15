<template>
  <div>
    <sd-space>
      <sd-link href="link" icon>Link</sd-link>
      <sd-link href="link" disabled icon>Link</sd-link>
    </sd-space>
  </div>
  <div>
    <sd-space>
      <sd-link href="link">
        <template #icon>
          <icon-edit />
        </template>
        Link
      </sd-link>
      <sd-link href="link" disabled>
        <template #icon>
          <icon-edit />
        </template>
        Link
      </sd-link>
    </sd-space>
  </div>
</template>

<script>
  import { IconEdit } from '@sdata/web-vue/es/icon/index.js';

  export default {
    components: { IconEdit },
  };
</script>
