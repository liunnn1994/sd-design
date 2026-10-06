<template>
  <sd-space direction="vertical" fill>
    <sd-space>
      <sd-button @click="orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'">
        切换方向
      </sd-button>
      <sd-button @click="disabled = !disabled">{{ disabled ? '启用调整' : '禁用调整' }}</sd-button>
      <sd-typography-text type="secondary">{{ phase }}</sd-typography-text>
    </sd-space>
    <sd-panel-group
      component="section"
      :orientation="orientation"
      :disabled="disabled"
      class="sd:h-75 sd:border sd:border-solid sd:rounded"
      @move-start="phase = '开始拖拽'"
      @moving="phase = '拖拽中'"
      @move-end="phase = '拖拽结束'"
    >
      <sd-panel default-size="50%" :min-size="80" class="sd:p-3">
        <sd-typography-paragraph>
          只设置 defaultSize，无需绑定尺寸即可拖拽。切换方向会保留面板内容；双击伸缩杆恢复一半大小。
        </sd-typography-paragraph>
      </sd-panel>
      <sd-panel-separator />
      <sd-panel class="sd:p-3">填充面板占据剩余空间。</sd-panel>
    </sd-panel-group>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const orientation = ref<'horizontal' | 'vertical'>('horizontal');
  const disabled = ref(false);
  const phase = ref('等待拖拽');
</script>
