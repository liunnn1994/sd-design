<template>
  <sd-space size="large">
    <sd-statistic title="New Users" :value="125670" show-group-separator>
      <template #suffix>
        <icon-arrow-rise />
      </template>
    </sd-statistic>
    <sd-statistic
      title="User Growth Rate"
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
