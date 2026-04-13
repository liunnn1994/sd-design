<template>
  <a-card title="Arco Card">
    <a-card :style="{ marginBottom: '20px' }" title="Inner Card Title">
      <template #extra>
        <a-link>More</a-link>
      </template>
      Inner Card Content
    </a-card>
    <a-card title="Inner Card Title">
      <template #extra>
        <a-link>More</a-link>
      </template>
      Inner Card Content
    </a-card>
  </a-card>
</template>
