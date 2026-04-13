<template>
  <a-space direction="vertical" size="large" style="width: 100%">
    <a-mention :data="['Bytedance', 'Bytedesign', 'Bytenumner']" placeholder="input @" />
    <a-mention :data="['Bytedance', 'Bytedesign', 'Bytenumner']" prefix="#" placeholder="input #" />
    <a-mention :data="['Bytedance', 'Bytedesign', 'Bytenumner']" prefix="$" placeholder="input $" />
  </a-space>
</template>
