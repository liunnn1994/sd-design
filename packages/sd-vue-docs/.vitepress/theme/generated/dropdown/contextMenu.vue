<template>
  <a-dropdown trigger="contextMenu" alignPoint :style="{ display: 'block' }">
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        backgroundColor: 'var(--color-fill-2)',
      }"
    >
      <div>Click Me</div>
    </div>
    <template #content>
      <a-doption>Option 1</a-doption>
      <a-doption>Option 2</a-doption>
      <a-doption>Option 3</a-doption>
    </template>
  </a-dropdown>
</template>
