<template>
  <sd-row :gutter="[40, 20]">
    <sd-col :span="12">
      <sd-alert title="信息">这是一条信息提示。</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert title="成功" type="success">这是一条成功提示。</sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="warning">
        <template #title> 警告 </template>
        这是一条警告提示。
      </sd-alert>
    </sd-col>
    <sd-col :span="12">
      <sd-alert type="error">
        <template #title> 错误 </template>
        这是一条错误提示。
      </sd-alert>
    </sd-col>
  </sd-row>
</template>
