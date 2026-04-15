<template>
  <sd-space direction="vertical">
    <sd-breadcrumb :routes="routes" />
    <sd-breadcrumb :routes="routes">
      <template #item-render="{ route, paths }">
        <sd-link :href="paths.join('/')">
          {{ route.label }}
        </sd-link>
      </template>
    </sd-breadcrumb>
  </sd-space>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          {
            path: '/',
            label: 'Home',
          },
          {
            path: '/channel',
            label: 'Channel',
          },
          {
            path: '/news',
            label: 'News',
          },
        ],
      };
    },
  };
</script>
