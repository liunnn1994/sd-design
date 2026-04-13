<template>
  <a-space>
    <a-color-picker v-model="value" size="mini" >
      <a-tag :color="value">
        <template #icon>
          <icon-bg-colors style="color: #fff" />
        </template>
        {{value}}
      </a-tag>
    </a-color-picker>
  </a-space>
</template>

<script setup>
import { ref } from 'vue';

const value = ref('#165DFF');
</script>
