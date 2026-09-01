<template>
  <sd-regex-vis
    model-value="^(https?):\\/\\/(www\\.)?([a-z0-9-]+\\.)+[a-z]{2,6}(\\/[^\\s]*)?$"
    :show-input="false"
    readonly
    aria-label="网址正则表达式结构"
  />
</template>
