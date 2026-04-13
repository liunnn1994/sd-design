<template>
  <a-image
    width="200px"
    :src="src"
    :title="title"
    :description="description"
  />
  <a-image
    width="200px"
    :src="src"
    :title="title"
    :description="description"
    footerPosition="outer"
    style="margin-left: 67px; vertical-align: top;"
  />
</template>

<script>
export default {
  setup() {
    return {
      src: 'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',
      title: 'A user’s avatar',
      description: 'Present by SD Design',
    }
  }
}
</script>
