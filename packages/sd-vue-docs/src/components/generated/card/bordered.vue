<template>
  <div
    :style="{
      display: 'flex',
      width: '100%',
      boxSizing: 'border-box',
      padding: '40px',
      backgroundColor: 'var(--color-fill-2)',
    }"
  >
    <sd-card :style="{ width: '360px' }" title="SD Card" :bordered="false">
      <template #extra>
        <sd-link>More</sd-link>
      </template>
      Card content
      <br />
      Card content
    </sd-card>
    <sd-card
      :style="{ width: '360px', marginLeft: '24px' }"
      title="Hover me"
      hoverable
      :bordered="false"
    >
      <template #extra>
        <sd-link>More</sd-link>
      </template>
      Card content
      <br />
      Card content
    </sd-card>
  </div>
</template>
