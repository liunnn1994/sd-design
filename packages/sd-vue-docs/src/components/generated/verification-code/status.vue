<template>
  <sd-space direction="vertical">
    <sd-space>
      <sd-typography-text style="width: 80px">Disabled:</sd-typography-text>
      <sd-verification-code defaultValue="123456" style="width: 300px" disabled />
    </sd-space>
    <sd-space>
      <sd-typography-text style="width: 80px">Readonly:</sd-typography-text>
      <sd-verification-code defaultValue="123456" style="width: 300px" readonly />
    </sd-space>
    <sd-space>
      <sd-typography-text style="width: 80px">Error:</sd-typography-text>
      <sd-verification-code defaultValue="123456" style="width: 300px" error />
    </sd-space>
  </sd-space>
</template>
