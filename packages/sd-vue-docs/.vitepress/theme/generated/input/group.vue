<template>
  <a-space direction="vertical" size="large">
    <a-input-group>
      <a-input :style="{ width: '160px' }" placeholder="first" />
      <a-input :style="{ width: '160px' }" placeholder="second" />
    </a-input-group>
    <a-input-group>
      <a-select
        :options="['Option1', 'Option2', 'Option3']"
        :style="{ width: '160px' }"
        placeholder="first"
      />
      <a-input :style="{ width: '160px' }" placeholder="second" />
    </a-input-group>
  </a-space>
</template>
