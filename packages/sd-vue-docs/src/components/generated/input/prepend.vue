<template>
  <sd-space direction="vertical" size="large">
    <sd-input class="sd:w-80" placeholder="请输入内容" allow-clear>
      <template #prepend> +86 </template>
    </sd-input>
    <sd-input class="sd:w-80" placeholder="请输入内容" allow-clear>
      <template #append> RMB </template>
    </sd-input>

    <sd-input class="sd:w-80" placeholder="请输入内容" allow-clear prepend="+86"> </sd-input>
    <sd-input class="sd:w-80" placeholder="请输入内容" allow-clear append="RMB"> </sd-input>
  </sd-space>
</template>
