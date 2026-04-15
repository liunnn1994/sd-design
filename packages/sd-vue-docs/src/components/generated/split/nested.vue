<template>
  <div>
    <sd-split
      :style="{
        height: '200px',
        width: '100%',
        minWidth: '500px',
        border: '1px solid var(--color-border)',
      }"
    >
      <template #first>
        <sd-typography-paragraph>Left</sd-typography-paragraph>
      </template>
      <template #second>
        <div>
          <sd-split direction="vertical" :style="{ height: '200px' }">
            <template #first><sd-typography-paragraph>Top</sd-typography-paragraph></template>
            <template #second><sd-typography-paragraph>Bottom</sd-typography-paragraph></template>
          </sd-split>
        </div>
      </template>
    </sd-split>
  </div>
</template>
