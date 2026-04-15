<template>
  <sd-space>
    <sd-popover title="Title">
      <sd-button>Hover Me</sd-button>
      <template #content>
        <p>Here is the text content</p>
        <p>Here is the text content</p>
      </template>
    </sd-popover>
    <sd-popover title="Title" trigger="click">
      <sd-button>Click Me</sd-button>
      <template #content>
        <p>Here is the text content</p>
        <p>Here is the text content</p>
      </template>
    </sd-popover>
  </sd-space>
</template>
