<template>
  <sd-space>
    <sd-popover title="标题">
      <sd-button>悬停此处</sd-button>
      <template #content>
        <p>这里是文本内容</p>
        <p>这里是文本内容</p>
      </template>
    </sd-popover>
    <sd-popover title="标题" trigger="click">
      <sd-button>点击我</sd-button>
      <template #content>
        <p>这里是文本内容</p>
        <p>这里是文本内容</p>
      </template>
    </sd-popover>
  </sd-space>
</template>
