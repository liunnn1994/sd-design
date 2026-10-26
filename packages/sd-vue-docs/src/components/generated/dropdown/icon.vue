<template>
  <sd-dropdown>
    <sd-button>点击我</sd-button>
    <template #content>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>选项 1</template>
      </sd-doption>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>选项 2</template>
      </sd-doption>
      <sd-doption>
        <template #icon>
          <icon-location />
        </template>
        <template #default>选项 3</template>
      </sd-doption>
    </template>
  </sd-dropdown>
</template>
