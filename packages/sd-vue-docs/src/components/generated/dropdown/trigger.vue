<template>
  <sd-space size="large">
    <sd-dropdown>
      <sd-button>Click Me</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown trigger="hover">
      <sd-button>Hover Me</sd-button>
      <template #content>
        <sd-doption>Option 1</sd-doption>
        <sd-doption>Option 2</sd-doption>
        <sd-doption>Option 3</sd-doption>
      </template>
    </sd-dropdown>
  </sd-space>
</template>
