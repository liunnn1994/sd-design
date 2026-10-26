<template>
  <sd-dropdown>
    <sd-button>点击我</sd-button>
    <template #content>
      <sd-doption>选项 1</sd-doption>
      <sd-dsubmenu value="option-1">
        <template #default>选项 2</template>
        <template #content>
          <sd-doption>选项 2-1</sd-doption>
          <sd-dsubmenu value="option-2-2" trigger="hover">
            <template #default>选项 2-2</template>
            <template #content>
              <sd-doption>选项 2-1</sd-doption>
              <sd-doption>选项 2-2</sd-doption>
              <sd-doption>选项 2-3</sd-doption>
            </template>
            <template #footer>
              <div class="sd:p-1.5 sd:text-center">
                <sd-button>点击</sd-button>
              </div>
            </template>
          </sd-dsubmenu>
          <sd-doption>选项 2-3</sd-doption>
        </template>
      </sd-dsubmenu>
      <sd-doption>选项 3</sd-doption>
    </template>
  </sd-dropdown>
</template>
