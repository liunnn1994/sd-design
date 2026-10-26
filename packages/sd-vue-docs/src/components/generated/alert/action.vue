<template>
  <sd-space direction="vertical" size="large" class="sd:w-full">
    <sd-alert closable>
      这是一条信息提示。
      <template #action>
        <sd-button size="small" type="primary">详情</sd-button>
      </template>
    </sd-alert>
    <sd-alert title="示例" closable>
      这是一条信息提示。
      <template #action>
        <sd-button size="small" type="primary">详情</sd-button>
      </template>
    </sd-alert>
  </sd-space>
</template>
