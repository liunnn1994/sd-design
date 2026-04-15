<template>
  <sd-trigger trigger="click">
    <sd-button>Click Me</sd-button>
    <template #content>
      <div class="trigger-demo-nest">
        <sd-empty />
        <sd-trigger position="right">
          <sd-button>Hover Me</sd-button>
          <template #content>
            <div class="trigger-demo-nest">
              <sd-empty />
              <sd-trigger trigger="click" position="right">
                <sd-button>Click Me</sd-button>
                <template #content>
                  <div class="trigger-demo-nest">
                    <sd-empty />
                    <sd-trigger position="right">
                      <sd-button>Hover Me</sd-button>
                      <template #content>
                        <sd-empty class="trigger-demo-nest" />
                      </template>
                    </sd-trigger>
                  </div>
                </template>
              </sd-trigger>
            </div>
          </template>
        </sd-trigger>
      </div>
    </template>
  </sd-trigger>
</template>

<style scoped>
  .trigger-demo-nest {
    width: 200px;
    padding: 10px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }

  .trigger-demo-nest-popup-content {
    text-align: right;
  }
</style>
