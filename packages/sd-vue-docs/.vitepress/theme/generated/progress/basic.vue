<template>
  <a-progress :percent="0.2" :style="{ width: '50%' }" />
  <br />
  <br />
  <a-progress :percent="0.3" :style="{ width: '50%' }">
    <template v-slot:text="scope"> 进度 {{ scope.percent * 100 }}% </template>
  </a-progress>
</template>
