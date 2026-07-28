<template>
  <sd-sender
    v-model="value"
    :loading="loading"
    suffix-placement="footer"
    @submit="handleSubmit"
    @cancel="loading = false"
  >
    <template #prefix>
      <sd-button type="text" size="small">附件</sd-button>
    </template>
    <template #suffix="{ actions }">
      <div class="custom-actions">
        <sd-button
          v-if="value"
          type="text"
          size="small"
          :disabled="actions.clearDisabled"
          @click="actions.clear"
        >
          清空
        </sd-button>
        <sd-button
          :type="loading ? 'outline' : 'primary'"
          size="small"
          :disabled="loading ? actions.cancelDisabled : actions.submitDisabled"
          @click="loading ? actions.cancel() : actions.send()"
        >
          {{ loading ? '停止' : '发送' }}
        </sd-button>
      </div>
    </template>
    <template #footer>
      <span class="footer-tip">内容由 AI 生成，请核对重要信息。</span>
    </template>
  </sd-sender>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('请总结今天的会议记录');
  const loading = ref(false);

  function handleSubmit() {
    loading.value = true;
  }
</script>

<style scoped>
  .custom-actions {
    display: flex;
    gap: 8px;
  }

  .footer-tip {
    color: var(--sd-color-text-3);
    font-size: 12px;
  }
</style>
