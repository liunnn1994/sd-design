<template>
  <div class="sd:flex">
    <sd-card class="sd:w-90" title="SD 卡片" hoverable>
      <template #extra>
        <sd-link>更多</sd-link>
      </template>
      卡片内容 <br />
      卡片内容
    </sd-card>
    <sd-card class="card-demo" title="自定义悬停样式" hoverable>
      <template #extra>
        <sd-link>更多</sd-link>
      </template>
      卡片内容 <br />
      卡片内容
    </sd-card>
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
