<template>
  <a-space direction="vertical">
    <a-radio-group type="button" v-model="format">
      <a-radio v-for="item in formatList" :value="item">{{item}}</a-radio>
    </a-radio-group>
    <a-color-picker defaultValue="#165DFF" :format="format" showText />
  </a-space>
</template>

<script setup>
import { ref } from 'vue';

const format = ref('hex')
const formatList = ['hex', 'rgb']
</script>
