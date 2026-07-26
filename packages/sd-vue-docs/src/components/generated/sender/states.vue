<template>
  <div class="sender-demo">
    <section>
      <div class="sender-demo-label">自适应高度（2 至 5 行）</div>
      <sd-sender
        v-model="value"
        :auto-size="{ minRows: 2, maxRows: 5 }"
        placeholder="输入多行内容观察高度变化"
      />
    </section>
    <section>
      <div class="sender-demo-label">只读（hover、点击或尝试修改时提示）</div>
      <sd-sender
        readonly="内容由系统生成，不可编辑"
        default-value="只读状态允许查看和选择内容，不允许编辑或发送。"
      />
    </section>
    <section>
      <div class="sender-demo-label">禁用</div>
      <sd-sender disabled default-value="禁用状态下所有输入与操作均不可用。" />
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('第一行\n第二行');
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 16px;
  }

  .sender-demo section {
    display: grid;
    gap: 8px;
  }

  .sender-demo-label {
    color: var(--sd-color-text-2);
    font-size: 13px;
    font-weight: 500;
  }
</style>
