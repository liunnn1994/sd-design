<template>
  <div>
    <sd-space class="sd:mb-2">
      <sd-button size="small" @click="collapsed = !collapsed">
        {{ collapsed ? '展开' : '收起' }}
      </sd-button>
      <sd-button size="small" @click="pinned = !pinned">
        固定内容 {{ pinned ? '开' : '关' }}
      </sd-button>
    </sd-space>
    <div class="sd:h-75 sd:border sd:border-solid sd:rounded">
      <sd-panel-group class="sd:h-full">
        <sd-panel
          v-model:size="width"
          v-model:collapsed="collapsed"
          :min-size="180"
          max-size="55%"
          class="sd:overflow-hidden sd:p-2"
        >
          <div class="sd:flex sd:items-center sd:justify-between sd:mb-1">
            <span class="sd:text-sm sd:font-medium">侧栏</span>
            <sd-typography-text type="secondary">
              {{ collapsed ? '已折叠' : `${width}px` }}
            </sd-typography-text>
          </div>
          <sd-divider />
          <sd-typography-paragraph
            >侧边栏面板，收起动画期间内容保持原始宽度。</sd-typography-paragraph
          >
        </sd-panel>
        <sd-panel-separator />
        <sd-panel :pin="pinned" class="sd:overflow-hidden">
          <sd-typography-paragraph>
            固定的文本按面板折叠结束时的宽度排版，折叠动画期间文字不再逐帧重新换行，
            避免代码编辑器、虚拟滚动表格等真实内容在每一帧付出回流代价。
          </sd-typography-paragraph>
        </sd-panel>
      </sd-panel-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const collapsed = ref(false);
  const pinned = ref(true);
  const width = ref(240);
</script>
