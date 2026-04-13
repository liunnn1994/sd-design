<template>
  <div>
    <a-space>
      <a-link href="link" icon>Link</a-link>
      <a-link href="link" disabled icon>Link</a-link>
    </a-space>
  </div>
  <div>
    <a-space>
      <a-link href="link">
        <template #icon>
          <icon-edit />
        </template>
        Link
      </a-link>
      <a-link href="link" disabled>
        <template #icon>
          <icon-edit />
        </template>
        Link
      </a-link>
    </a-space>
  </div>
</template>

<script>
  import { IconEdit } from '@sd-design/web-vue/es/icon';

  export default {
    components: { IconEdit }
  };
</script>
