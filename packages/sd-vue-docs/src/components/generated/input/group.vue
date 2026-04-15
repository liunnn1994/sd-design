<template>
  <sd-space direction="vertical" size="large">
    <sd-input-group>
      <sd-input :style="{ width: '160px' }" placeholder="first" />
      <sd-input :style="{ width: '160px' }" placeholder="second" />
    </sd-input-group>
    <sd-input-group>
      <sd-select
        :options="['Option1', 'Option2', 'Option3']"
        :style="{ width: '160px' }"
        placeholder="first"
      />
      <sd-input :style="{ width: '160px' }" placeholder="second" />
    </sd-input-group>
  </sd-space>
</template>
