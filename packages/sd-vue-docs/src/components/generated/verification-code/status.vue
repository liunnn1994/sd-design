<template>
  <sd-space direction="vertical">
    <sd-space>
      <sd-typography-text class="sd:w-20">禁用：</sd-typography-text>
      <sd-verification-code defaultValue="123456" class="sd:w-75" disabled />
    </sd-space>
    <sd-space>
      <sd-typography-text class="sd:w-20">只读：</sd-typography-text>
      <sd-verification-code defaultValue="123456" class="sd:w-75" readonly />
    </sd-space>
    <sd-space>
      <sd-typography-text class="sd:w-20">错误：</sd-typography-text>
      <sd-verification-code defaultValue="123456" class="sd:w-75" error />
    </sd-space>
  </sd-space>
</template>
