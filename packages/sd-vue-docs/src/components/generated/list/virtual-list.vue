<template>
  <h3 :style="{ color: 'var(--color-text-2)' }">10000 items</h3>
  <sd-list
    :style="{ width: `600px` }"
    :virtualListProps="{
      height: 560,
    }"
    :data="list"
  >
    <template #item="{ item, index }">
      <sd-list-item :key="index">
        <sd-list-item-meta :title="item.title" :description="item.description">
          <template #avatar>
            <sd-avatar shape="square"> A </sd-avatar>
          </template>
        </sd-list-item-meta>
      </sd-list-item>
    </template>
  </sd-list>
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const list = reactive(
        Array(10000)
          .fill(null)
          .map((_, index) => {
            const prefix = `0000${index}`.slice(-5);
            return {
              title: 'Beijing Bytedance Technology Co., Ltd.',
              description: `(${prefix}) Beijing ByteDance Technology Co., Ltd. is an enterprise located in China.`,
            };
          }),
      );

      return {
        list,
      };
    },
  };
</script>
