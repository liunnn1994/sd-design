<template>
  <a-steps>
    <a-step description="This is a description">
      Succeeded
      <template #icon>
        <icon-home />
      </template>
    </a-step>
    <a-step description="This is a description">
      Processing
      <template #icon>
        <icon-loading />
      </template>
    </a-step>
    <a-step description="This is a description">
      Pending
      <template #icon>
        <icon-thumb-up />
      </template>
    </a-step>
  </a-steps>
</template>
