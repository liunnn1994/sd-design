<template>
  <sd-dropdown trigger="contextMenu" alignPoint :style="{ display: 'block' }">
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
      <sd-doption>Option 1</sd-doption>
      <sd-doption>Option 2</sd-doption>
      <sd-doption>Option 3</sd-doption>
    </template>
  </sd-dropdown>
</template>
