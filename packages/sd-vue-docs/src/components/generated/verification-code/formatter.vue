<template>
  <sd-space direction="vertical">
    <sd-verification-code
      defaultValue="123456"
      style="width: 300px"
      :formatter="(inputValue) => (/^\d*$/.test(inputValue) ? inputValue : false)"
    />
    <sd-verification-code
      defaultValue="abcdef"
      style="width: 300px"
      :formatter="(inputValue) => (/^[a-zA-Z]*$/.test(inputValue) ? inputValue.toUpperCase() : '')"
    />
  </sd-space>
</template>
