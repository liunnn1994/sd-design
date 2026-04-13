<template>
  <a-space :size="32">
    <a-avatar-group>
      <a-avatar :style="{ backgroundColor: '#7BC616' }">A</a-avatar>
      <a-avatar :style="{ backgroundColor: '#14C9C9' }">B</a-avatar>
      <a-avatar :style="{ backgroundColor: '#168CFF' }">C</a-avatar>
      <a-avatar :style="{ backgroundColor: '#FF7D00' }">Arco</a-avatar>
      <a-avatar :style="{ backgroundColor: '#FFC72E' }">Design</a-avatar>
    </a-avatar-group>

    <a-avatar-group :size="24">
      <a-avatar :style="{ backgroundColor: '#7BC616' }">A</a-avatar>
      <a-avatar :style="{ backgroundColor: '#14C9C9' }">B</a-avatar>
      <a-avatar :style="{ backgroundColor: '#168CFF' }">C</a-avatar>
      <a-avatar :style="{ backgroundColor: '#FF7D00' }">Arco</a-avatar>
      <a-avatar :style="{ backgroundColor: '#FFC72E' }">Design</a-avatar>
    </a-avatar-group>

    <a-avatar-group :size="24" :max-count="3">
      <a-avatar :style="{ backgroundColor: '#7BC616' }">A</a-avatar>
      <a-avatar :style="{ backgroundColor: '#14C9C9' }">B</a-avatar>
      <a-avatar :style="{ backgroundColor: '#168CFF' }">C</a-avatar>
      <a-avatar :style="{ backgroundColor: '#FF7D00' }">Arco</a-avatar>
      <a-avatar :style="{ backgroundColor: '#FFC72E' }">Design</a-avatar>
    </a-avatar-group>
  </a-space>
</template>
