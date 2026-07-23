<template>
  <div class="demo">
    <h4>HTTP Header</h4>
    <KvList v-model:json="headers" v-model:bulk="headerBulk" type="http-header" />

    <h4>Secret</h4>
    <KvList v-model:json="secrets" v-model:bulk="secretBulk" type="secret" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { KvList } from '@sdata/web-vue';

  const headers = ref([{ key: 'Content-Type', value: 'application/json' }]);
  const headerBulk = ref('');
  const secrets = ref([{ key: 'API_TOKEN', value: 'secret-value' }]);
  const secretBulk = ref('');
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }

  h4 {
    margin: 0;
  }
</style>
