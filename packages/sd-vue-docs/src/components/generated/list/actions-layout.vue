<template>
  <sd-list
    class="list-demo-action-layout"
    :bordered="false"
    :data="dataSource"
    :pagination-props="paginationProps"
  >
    <template #item="{ item }">
      <sd-list-item class="list-demo-item" action-layout="vertical">
        <template #actions>
          <span><icon-heart />83</span>
          <span><icon-star />{{ item.index }}</span>
          <span><icon-message />回复</span>
        </template>
        <template #extra>
          <div className="image-area">
            <img alt="sd-design" :src="item.imageSrc" />
          </div>
        </template>
        <sd-list-item-meta :title="item.title" :description="item.description">
          <template #avatar>
            <sd-avatar shape="square">
              <img alt="头像" :src="item.avatar" />
            </sd-avatar>
          </template>
        </sd-list-item-meta>
      </sd-list-item>
    </template>
  </sd-list>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  const names = ['苏格拉底', '巴尔扎克', '柏拉图'];
  const avatarSrc = [
    '//picsum.photos/1000/1000',
    '//picsum.photos/1000/1000',
    '//picsum.photos/1000/1000',
  ];
  const imageSrc = [
    '//picsum.photos/1200/840',
    '//picsum.photos/1200/840',
    '//picsum.photos/1200/840',
  ];
  const dataSource = Array.from({ length: 15 }, (_, index) => {
    return {
      index: index,
      avatar: avatarSrc[index % avatarSrc.length],
      title: names[index % names.length],
      description:
        '示例科技有限公司专注于数据分析与应用开发，通过统一的设计语言和组件，帮助团队构建高效、易用的产品。',
      imageSrc: imageSrc[index % imageSrc.length],
    };
  });

  const paginationProps = reactive({
    defaultPageSize: 3,
    total: dataSource.length,
  });
</script>

<style scoped>
  .list-demo-action-layout .image-area {
    width: 183px;
    height: 119px;
    overflow: hidden;
    border-radius: 2px;
  }

  .list-demo-action-layout .list-demo-item {
    padding: 20px 0;
    border-bottom: 1px solid var(--color-fill-3);
  }

  .list-demo-action-layout .image-area img {
    width: 100%;
  }

  .list-demo-action-layout .sd-list-item-action .sd-icon {
    margin: 0 4px;
  }
</style>
