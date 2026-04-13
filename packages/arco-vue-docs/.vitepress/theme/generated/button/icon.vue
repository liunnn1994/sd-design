<template>
  <a-space>
    <a-button type="primary">
      <template #icon>
        <icon-plus />
      </template>
    </a-button>
    <a-button type="primary">
      <template #icon>
        <icon-delete />
      </template>
      <!-- Use the default slot to avoid extra spaces -->
      <template #default>Delete</template>
    </a-button>
  </a-space>
</template>

<script>
import { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon';

export default {
  components: { IconPlus, IconDelete }
};
</script>
