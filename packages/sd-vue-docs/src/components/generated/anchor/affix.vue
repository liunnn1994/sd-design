<template>
  <a-affix :offsetTop="80">
    <a-anchor :style="{ backgroundColor: 'var(--color-bg-1)' }">
      <a-anchor-link href="#basic">Basic</a-anchor-link>
      <a-anchor-link href="#line-less">LineLess Mode</a-anchor-link>
      <a-anchor-link href="#affix">
        Affix
        <template #sublist>
          <a-anchor-link href="#boundary">Scroll Boundary</a-anchor-link>
          <a-anchor-link href="#hash">Hash mode</a-anchor-link>
        </template>
      </a-anchor-link>
    </a-anchor>
  </a-affix>
</template>
