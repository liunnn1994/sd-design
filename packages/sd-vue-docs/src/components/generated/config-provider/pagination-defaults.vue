<template>
  <sd-config-provider :pagination="paginationDefaults">
    <sd-space direction="vertical" fill>
      <sd-pagination :total="120" />
      <sd-pagination :total="120" :show-page-size="false" show-jumper />
    </sd-space>
  </sd-config-provider>
</template>

<script setup lang="ts">
  const paginationDefaults = {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: true,
    showPageSize: true,
  };
</script>
