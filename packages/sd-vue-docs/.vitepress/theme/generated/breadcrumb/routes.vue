<template>
  <a-space direction="vertical">
    <a-breadcrumb :routes="routes"/>
    <a-breadcrumb :routes="routes">
      <template #item-render="{route, paths}">
        <a-link :href="paths.join('/')">
          {{route.label}}
        </a-link>
      </template>
    </a-breadcrumb>
  </a-space>
</template>

<script>
export default {
  data() {
    return {
      routes: [
        {
          path: '/',
          label: 'Home'
        },
        {
          path: '/channel',
          label: 'Channel',
        },
        {
          path: '/news',
          label: 'News'
        },
      ],
    }
  }
}
</script>
