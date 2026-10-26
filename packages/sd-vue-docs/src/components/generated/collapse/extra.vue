<template>
  <sd-collapse>
    <sd-collapse-item header="示例数据有限公司" key="1">
      <template #extra>
        <icon-copy />
      </template>
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item header="示例数据有限公司" :key="2">
      <template #extra>
        <sd-button type="primary" size="mini" @click.stop="sayHello">你好</sd-button>
      </template>
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
    <sd-collapse-item header="示例数据有限公司" key="3">
      <template #extra>
        <sd-tag size="small">城市</sd-tag>
      </template>
      <div>示例数据有限公司</div>
      <div>示例数据有限公司</div>
    </sd-collapse-item>
  </sd-collapse>
</template>

<script setup lang="ts">
  import { Message } from '@sdata/web-vue';

  const sayHello = () => {
    Message.info('hello');
  };
</script>
