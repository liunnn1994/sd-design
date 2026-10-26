<template>
  <div class="sd:mb-2.5">
    <sd-switch v-model="scrollbar" />
    虚拟滚动条
  </div>
  <sd-list :max-height="240" @reach-bottom="fetchData" :scrollbar="scrollbar">
    <template #header> 列表标题 </template>
    <template #scroll-loading>
      <div v-if="bottom">没有更多数据</div>
      <sd-spin v-else />
    </template>
    <sd-list-item v-for="item of data">{{ item }}</sd-list-item>
  </sd-list>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';

  const current = ref(1);
  const bottom = ref(false);
  const data = reactive<string[]>([]);
  const scrollbar = ref(true);

  const fetchData = () => {
    console.log('已滚动到底部！');
    if (current.value <= 5) {
      window.setTimeout(() => {
        const index = data.length;
        data.push(
          `示例科技有限公司 ${index + 1}`,
          `示例科技研发中心 ${index + 2}`,
          `示例数据有限公司 ${index + 3}`,
          `示例云服务有限公司 ${index + 4}`,
          `示例科技北京分公司 ${index + 5}`,
        );
        current.value += 1;
      }, 2000);
    } else {
      bottom.value = true;
    }
  };
</script>
