<template>
  <sd-dropdown>
    <sd-button>Click Me</sd-button>
    <template #content>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 1</template>
      </sd-doption>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 2</template>
      </sd-doption>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>Option 3</template>
      </sd-doption>
    </template>
  </sd-dropdown>
</template>
