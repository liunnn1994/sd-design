<template>
  <sd-list>
    <sd-list-item v-for="idx in 4" :key="idx">
      <sd-list-item-meta
        title="Beijing Bytedance Technology Co., Ltd."
        description="Beijing ByteDance Technology Co., Ltd. is an enterprise located in China."
      >
        <template #avatar>
          <sd-avatar shape="square">
            <img
              alt="avatar"
              src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
            />
          </sd-avatar>
        </template>
      </sd-list-item-meta>
      <template #actions>
        <icon-edit />
        <icon-delete />
      </template>
    </sd-list-item>
  </sd-list>
</template>
