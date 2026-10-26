<template>
  <div
    class="sd:box-border sd:w-full sd:p-10"
    :style="{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` }"
  >
    <sd-row :gutter="20" class="sd:mb-5">
      <sd-col :span="8">
        <sd-card title="SD 卡片" :bordered="false" class="sd:w-full">
          <template #extra>
            <sd-link>更多</sd-link>
          </template>
          卡片内容
        </sd-card>
      </sd-col>
      <sd-col :span="8">
        <sd-card title="SD 卡片" :bordered="false" class="sd:w-full">
          <template #extra>
            <sd-link>更多</sd-link>
          </template>
          卡片内容
        </sd-card>
      </sd-col>
      <sd-col :span="8">
        <sd-card title="SD 卡片" :bordered="false" class="sd:w-full">
          <template #extra>
            <sd-link>更多</sd-link>
          </template>
          卡片内容
        </sd-card>
      </sd-col>
    </sd-row>
    <sd-row :gutter="20">
      <sd-col :span="16">
        <sd-card title="SD 卡片" :bordered="false" class="sd:w-full">
          <template #extra>
            <sd-link>更多</sd-link>
          </template>
          卡片内容
        </sd-card>
      </sd-col>
      <sd-col :span="8">
        <sd-card title="SD 卡片" :bordered="false" class="sd:w-full">
          <template #extra>
            <sd-link>更多</sd-link>
          </template>
          卡片内容
        </sd-card>
      </sd-col>
    </sd-row>
  </div>
</template>

<script setup lang="ts">
  import { getCssVarToken } from '@sdata/web-vue';
</script>
