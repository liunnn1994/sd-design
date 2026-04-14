<template>
  <a-row :gutter="[40, 20]">
    <a-col :span="12">
      <a-alert closable>
        <template #close-element>
          <icon-close-circle />
        </template>
        This is an info alert.
      </a-alert>
    </a-col>
    <a-col :span="12">
      <a-alert closable>
        <template #close-element> Close </template>
        This is an info alert.
      </a-alert>
    </a-col>
  </a-row>
</template>
