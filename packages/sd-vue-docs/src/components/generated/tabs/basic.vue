<template>
  <sd-tabs default-active-key="2">
    <sd-tab-pane key="1" title="Tab 1"> Content of Tab Panel 1 </sd-tab-pane>
    <sd-tab-pane key="2" title="Tab 2"> Content of Tab Panel 2 </sd-tab-pane>
    <sd-tab-pane key="3">
      <template #title>Tab 3</template>
      Content of Tab Panel 3
    </sd-tab-pane>
  </sd-tabs>
</template>
