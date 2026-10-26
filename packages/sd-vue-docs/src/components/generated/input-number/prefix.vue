<template>
  <sd-space direction="vertical" size="large">
    <sd-input-number class="sd:w-80" placeholder="请输入内容" allow-clear>
      <template #prefix>
        <icon-user />
      </template>
    </sd-input-number>
    <sd-input-number class="sd:w-80" placeholder="请输入内容" allow-clear hide-button>
      <template #suffix>
        <icon-info-circle />
      </template>
    </sd-input-number>
  </sd-space>
</template>
