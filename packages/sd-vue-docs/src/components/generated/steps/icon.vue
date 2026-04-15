<template>
  <sd-steps>
    <sd-step description="This is a description">
      Succeeded
      <template #icon>
        <icon-home />
      </template>
    </sd-step>
    <sd-step description="This is a description">
      Processing
      <template #icon>
        <icon-loading />
      </template>
    </sd-step>
    <sd-step description="This is a description">
      Pending
      <template #icon>
        <icon-thumb-up />
      </template>
    </sd-step>
  </sd-steps>
</template>
