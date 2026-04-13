<template>
  <a-space size="large">
    <a-dropdown-button>
      Publish
      <template #content>
        <a-doption>Save now</a-doption>
        <a-doption>Save and Publish</a-doption>
      </template>
    </a-dropdown-button>
    <a-dropdown-button disabled>
      Disabled
      <template #content>
        <a-doption>Save now</a-doption>
        <a-doption>Save and Publish</a-doption>
      </template>
    </a-dropdown-button>
    <a-dropdown-button>
      Publish
      <template #icon>
        <icon-down />
      </template>
      <template #content>
        <a-doption>Save now</a-doption>
        <a-doption>Save and Publish</a-doption>
      </template>
    </a-dropdown-button>
  </a-space>

</template>

<style>
.sd-dropdown-open .sd-icon-down {
  transform: rotate(180deg);
}
</style>
