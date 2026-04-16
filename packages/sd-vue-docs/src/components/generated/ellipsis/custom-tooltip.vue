<template>
  <sd-ellipsis
    :tooltip="{ position: 'bottom', mini: true }"
    style="display: block; max-width: 260px"
  >
    Hover the truncated content to show a custom tooltip body rendered by the tooltip slot.
    <template #tooltip>
      <div>
        <strong>Full content</strong>
        <div style="margin-top: 4px">
          Hover the truncated content to show a custom tooltip body rendered by the tooltip slot.
        </div>
      </div>
    </template>
  </sd-ellipsis>
</template>
