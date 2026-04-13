<template>
  <a-space size="large">
    <a-dropdown>
      <a-button>Click Me</a-button>
      <template #content>
        <a-doption>Option 1</a-doption>
        <a-doption>Option 2</a-doption>
        <a-doption>Option 3</a-doption>
      </template>
    </a-dropdown>
    <a-dropdown trigger="hover">
      <a-button>Hover Me</a-button>
      <template #content>
        <a-doption>Option 1</a-doption>
        <a-doption>Option 2</a-doption>
        <a-doption>Option 3</a-doption>
      </template>
    </a-dropdown>
  </a-space>
</template>
