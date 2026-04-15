<template>
  <sd-space :size="32">
    <sd-avatar-group>
      <sd-avatar :style="{ backgroundColor: '#7BC616' }">A</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#14C9C9' }">B</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#168CFF' }">C</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FF7D00' }">SD</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FFC72E' }">Design</sd-avatar>
    </sd-avatar-group>

    <sd-avatar-group :size="24">
      <sd-avatar :style="{ backgroundColor: '#7BC616' }">A</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#14C9C9' }">B</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#168CFF' }">C</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FF7D00' }">SD</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FFC72E' }">Design</sd-avatar>
    </sd-avatar-group>

    <sd-avatar-group :size="24" :max-count="3">
      <sd-avatar :style="{ backgroundColor: '#7BC616' }">A</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#14C9C9' }">B</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#168CFF' }">C</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FF7D00' }">SD</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FFC72E' }">Design</sd-avatar>
    </sd-avatar-group>
  </sd-space>
</template>
