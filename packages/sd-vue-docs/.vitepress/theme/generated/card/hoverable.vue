<template>
  <div :style="{ display: 'flex' }">
    <a-card :style="{ width: '360px' }" title="SD Card" hoverable>
      <template #extra>
        <a-link>More</a-link>
      </template>
      Card content <br />
      Card content
    </a-card>
    <a-card
      class="card-demo"
      title="Custom hover style"
      hoverable
    >
      <template #extra>
        <a-link>More</a-link>
      </template>
      Card content <br />
      Card content
    </a-card>
  </div>
</template>
<style scoped>
.card-demo {
  width: 360px;
  margin-left: 24px;
  transition-property: all;
}
.card-demo:hover {
  transform: translateY(-4px);
}
</style>
