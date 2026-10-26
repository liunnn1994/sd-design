<template>
  <sd-list>
    <sd-list-item v-for="idx in 4" :key="idx">
      <sd-list-item-meta
        title="示例科技有限公司"
        description="示例科技有限公司致力于提供便捷的数据服务。"
      >
        <template #avatar>
          <sd-avatar shape="square">
            <img alt="头像" src="https://picsum.photos/1000/1000" />
          </sd-avatar>
        </template>
      </sd-list-item-meta>
    </sd-list-item>
  </sd-list>
</template>
