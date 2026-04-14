<template>
  <a-space direction="vertical">
    <a-verification-code
      defaultValue="123456"
      style="width: 300px"
      :formatter="(inputValue) => (/^\d*$/.test(inputValue) ? inputValue : false)"
    />
    <a-verification-code
      defaultValue="abcdef"
      style="width: 300px"
      :formatter="(inputValue) => (/^[a-zA-Z]*$/.test(inputValue) ? inputValue.toUpperCase() : '')"
    />
  </a-space>
</template>
