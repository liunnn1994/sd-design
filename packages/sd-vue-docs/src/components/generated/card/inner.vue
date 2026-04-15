<template>
  <sd-card title="SD Card">
    <sd-card :style="{ marginBottom: '20px' }" title="Inner Card Title">
      <template #extra>
        <sd-link>More</sd-link>
      </template>
      Inner Card Content
    </sd-card>
    <sd-card title="Inner Card Title">
      <template #extra>
        <sd-link>More</sd-link>
      </template>
      Inner Card Content
    </sd-card>
  </sd-card>
</template>
