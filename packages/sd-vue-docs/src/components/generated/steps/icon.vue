<template>
  <sd-steps>
    <sd-step description="这是一段描述">
      已成功
      <template #icon>
        <icon-home />
      </template>
    </sd-step>
    <sd-step description="这是一段描述">
      处理中
      <template #icon>
        <icon-loading />
      </template>
    </sd-step>
    <sd-step description="这是一段描述">
      等待中
      <template #icon>
        <icon-thumb-up />
      </template>
    </sd-step>
  </sd-steps>
</template>
