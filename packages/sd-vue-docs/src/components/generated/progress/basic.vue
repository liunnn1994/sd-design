<template>
  <sd-progress :percent="0.2" :style="{ width: '50%' }" />
  <br />
  <br />
  <sd-progress :percent="0.3" :style="{ width: '50%' }">
    <template v-slot:text="scope"> 进度 {{ scope.percent * 100 }}% </template>
  </sd-progress>
</template>
