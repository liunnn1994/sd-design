<template>
  <sd-card :bordered="false" class="sd:w-full">
    <sd-card-grid
      v-for="(_, index) in new Array(7)"
      :key="index"
      :hoverable="index % 2 === 0"
      class="sd:w-[25%]"
    >
      <sd-card class="card-demo" title="SD 卡片" :bordered="false">
        <template #extra>
          <sd-link>更多</sd-link>
        </template>
        <p class="sd:m-0">
          {{ index % 2 === 0 ? 'Card allow to hover' : '卡片内容' }}
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
