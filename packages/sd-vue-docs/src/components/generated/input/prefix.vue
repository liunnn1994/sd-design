<template>
  <sd-space direction="vertical" size="large">
    <sd-input class="sd:w-80" placeholder="请输入内容" allow-clear>
      <template #prefix>
        <icon-user />
      </template>
    </sd-input>
    <sd-input class="sd:w-80" placeholder="请输入内容" allow-clear>
      <template #suffix>
        <icon-info-circle />
      </template>
    </sd-input>
  </sd-space>
</template>
