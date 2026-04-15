<template>
  <sd-space size="large">
    <sd-dropdown-button>
      Publish
      <template #content>
        <sd-doption>Save now</sd-doption>
        <sd-doption>Save and Publish</sd-doption>
      </template>
    </sd-dropdown-button>
    <sd-dropdown-button disabled>
      Disabled
      <template #content>
        <sd-doption>Save now</sd-doption>
        <sd-doption>Save and Publish</sd-doption>
      </template>
    </sd-dropdown-button>
    <sd-dropdown-button>
      Publish
      <template #icon>
        <icon-down />
      </template>
      <template #content>
        <sd-doption>Save now</sd-doption>
        <sd-doption>Save and Publish</sd-doption>
      </template>
    </sd-dropdown-button>
  </sd-space>
</template>

<style>
  .sd-dropdown-open .sd-icon-down {
    transform: rotate(180deg);
  }
</style>
