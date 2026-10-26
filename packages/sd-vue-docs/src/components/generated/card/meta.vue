<template>
  <sd-card hoverable class="sd:w-90">
    <template #cover>
      <div class="sd:h-51 sd:overflow-hidden">
        <img class="sd:w-full sd:-translate-y-5" alt="甜点" src="https://picsum.photos/1260/840" />
      </div>
    </template>
    <sd-card-meta title="卡片标题">
      <template #description>
        卡片内容 <br />
        卡片内容
      </template>
    </sd-card-meta>
  </sd-card>
</template>
