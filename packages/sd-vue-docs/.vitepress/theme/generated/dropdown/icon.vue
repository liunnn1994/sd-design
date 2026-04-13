<template>
  <a-dropdown>
    <a-button>Click Me</a-button>
    <template #content>
      <a-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 1</template>
      </a-doption>
      <a-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 2</template>
      </a-doption>
      <a-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 3</template>
      </a-doption>
    </template>
  </a-dropdown>
</template>
