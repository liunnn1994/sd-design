<template>
  <sd-space direction="vertical" size="large">
    <sd-input-group>
      <sd-input class="sd:w-40" placeholder="第一项" />
      <sd-input class="sd:w-40" placeholder="第二项" />
    </sd-input-group>
    <sd-input-group>
      <sd-select :options="['选项 1', '选项 2', '选项 3']" class="sd:w-40" placeholder="第一项" />
      <sd-input class="sd:w-40" placeholder="第二项" />
    </sd-input-group>
  </sd-space>
</template>
