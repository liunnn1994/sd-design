<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert closable>
        <template #close-element>
          <icon-close-circle />
        </template>
        这是一条信息提示。
      </sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert closable>
        <template #close-element> 关闭 </template>
        这是一条信息提示。
      </sd-alert>
    </sd-col>
  </sd-row>
</template>
