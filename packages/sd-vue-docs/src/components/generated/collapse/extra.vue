<template>
  <a-collapse>
    <a-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
      <template #extra>
        <icon-copy />
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </a-collapse-item>
    <a-collapse-item header="Beijing Toutiao Technology Co., Ltd." :key="2">
      <template #extra>
        <a-button type="primary" size="mini" @click.stop="sayHello">hello</a-button>
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </a-collapse-item>
    <a-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
      <template #extra>
        <a-tag size="small">city</a-tag>
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </a-collapse-item>
  </a-collapse>
</template>

<script>
  import { Message } from '@sdata/web-vue';

  export default {
    setup() {
      const sayHello = () => {
        Message.info('hello');
      };

      return {
        sayHello,
      };
    },
  };
</script>
