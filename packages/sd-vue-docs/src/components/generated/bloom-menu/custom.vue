<template>
  <div class="bloom-menu-demo">
    <sd-bloom-menu :items="items" title="成员操作">
      <template #trigger>
        <span class="custom-trigger">邀请成员 <span aria-hidden="true">＋</span></span>
      </template>
      <template #header="{ close }">
        <strong>选择邀请方式</strong>
        <sd-button size="mini" type="text" @click="close(true)">取消</sd-button>
      </template>
      <template #item="{ item }">
        <span class="custom-item">
          <span class="custom-item-title">{{ item.label }}</span>
          <small>{{ getDescription(item.value) }}</small>
        </span>
      </template>
    </sd-bloom-menu>
  </div>
</template>

<script setup lang="ts">
  import type { BloomMenuItem } from '@sdata/web-vue';

  type InviteItem = BloomMenuItem & { description: string };

  const items: InviteItem[] = [
    { value: 'email', label: '邮件邀请', description: '发送带有效期的邀请链接' },
    { value: 'link', label: '复制链接', description: '分享团队的公开邀请地址' },
    { value: 'disabled', label: '批量导入', description: '当前工作区暂不可用', disabled: true },
  ];

  function getDescription(value: BloomMenuItem['value']) {
    return items.find((item) => item.value === value)?.description;
  }
</script>

<style scoped>
  .bloom-menu-demo {
    display: grid;
    place-items: center;
    min-height: 320px;
  }

  .custom-trigger {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .custom-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    text-align: left;
  }

  .custom-item-title {
    color: var(--sd-color-text-1);
    font-weight: 500;
  }

  small {
    color: var(--sd-color-text-3);
    font-size: 12px;
    line-height: 1.4;
    white-space: normal;
  }
</style>
