<template>
  <div
    :style="{
      boxSizing: 'border-box',
      width: '100%',
      padding: '40px',
      backgroundColor: 'var(--color-fill-2)',
    }"
  >
    <sd-row :gutter="20" :style="{ marginBottom: '20px' }">
      <sd-col :span="8">
        <sd-card title="SD Card" :bordered="false" :style="{ width: '100%' }">
          <template #extra>
            <sd-link>More</sd-link>
          </template>
          Card content
        </sd-card>
      </sd-col>
      <sd-col :span="8">
        <sd-card title="SD Card" :bordered="false" :style="{ width: '100%' }">
          <template #extra>
            <sd-link>More</sd-link>
          </template>
          Card content
        </sd-card>
      </sd-col>
      <sd-col :span="8">
        <sd-card title="SD Card" :bordered="false" :style="{ width: '100%' }">
          <template #extra>
            <sd-link>More</sd-link>
          </template>
          Card content
        </sd-card>
      </sd-col>
    </sd-row>
    <sd-row :gutter="20">
      <sd-col :span="16">
        <sd-card title="SD Card" :bordered="false" :style="{ width: '100%' }">
          <template #extra>
            <sd-link>More</sd-link>
          </template>
          Card content
        </sd-card>
      </sd-col>
      <sd-col :span="8">
        <sd-card title="SD Card" :bordered="false" :style="{ width: '100%' }">
          <template #extra>
            <sd-link>More</sd-link>
          </template>
          Card content
        </sd-card>
      </sd-col>
    </sd-row>
  </div>
</template>
