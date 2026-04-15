<template>
  <sd-card :bordered="false" :style="{ width: '100%' }">
    <sd-card-grid
      v-for="(_, index) in new Array(7)"
      :key="index"
      :hoverable="index % 2 === 0"
      :style="{ width: '25%' }"
    >
      <sd-card class="card-demo" title="SD Card" :bordered="false">
        <template #extra>
          <sd-link>More</sd-link>
        </template>
        <p :style="{ margin: 0 }">
          {{ index % 2 === 0 ? 'Card allow to hover' : 'Card content' }}
        </p>
      </sd-card>
    </sd-card-grid>
  </sd-card>
</template>
<style scoped>
  .card-demo {
    width: 100%;
  }

  .card-demo :deep(.sd-card-header) {
    border: none;
  }
</style>
