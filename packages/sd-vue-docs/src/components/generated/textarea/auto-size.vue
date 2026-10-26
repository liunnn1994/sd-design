<template>
  <sd-textarea
    default-value="这是多行文本框的内容。这是多行文本框的内容。这是多行文本框的内容。"
    auto-size
  />
  <sd-textarea
    default-value="这是多行文本框的内容。这是多行文本框的内容。这是多行文本框的内容。"
    :auto-size="{
      minRows: 2,
      maxRows: 5,
    }"
    class="sd:mt-5"
  />
</template>
