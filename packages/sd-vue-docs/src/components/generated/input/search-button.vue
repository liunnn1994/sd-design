<template>
  <sd-space direction="vertical" size="large">
    <sd-input-search class="sd:w-80" placeholder="请输入内容" button-text="搜索" search-button />
    <sd-input-search class="sd:w-80" placeholder="请输入内容" search-button>
      <template #button-icon>
        <icon-search />
      </template>
      <template #button-default> 搜索 </template>
    </sd-input-search>
  </sd-space>
</template>
