<template>
  <sd-space size="large">
    <sd-statistic title="新增用户" :value="125670" show-group-separator>
      <template #suffix>
        <icon-arrow-rise />
      </template>
    </sd-statistic>
    <sd-statistic
      title="用户增长率"
      :value="50.52"
      :precision="2"
      :value-style="{ color: '#0fbf60' }"
    >
      <template #prefix>
        <icon-arrow-rise />
      </template>
      <template #suffix>%</template>
    </sd-statistic>
  </sd-space>
</template>
