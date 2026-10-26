<template>
  <sd-space direction="vertical">
    <sd-button-group>
      <sd-button>发布</sd-button>
      <sd-button>
        <template #icon>
          <icon-down />
        </template>
      </sd-button>
    </sd-button-group>
    <sd-button-group>
      <sd-button>发布</sd-button>
      <sd-button>
        <template #icon>
          <icon-more />
        </template>
      </sd-button>
    </sd-button-group>
    <sd-button-group>
      <sd-button type="primary">
        <icon-left />
        上一步
      </sd-button>
      <sd-button type="primary">
        下一步
        <icon-right />
      </sd-button>
    </sd-button-group>
    <sd-space size="large">
      <sd-button-group type="primary">
        <sd-button> 复制 </sd-button>
        <sd-button> 剪切 </sd-button>
        <sd-button> 查找 </sd-button>
      </sd-button-group>
      <sd-button-group type="primary" status="warning">
        <sd-button>
          <template #icon><icon-heart-fill /></template>
        </sd-button>
        <sd-button>
          <template #icon><icon-star-fill /></template>
        </sd-button>
        <sd-button>
          <template #icon><icon-thumb-up-fill /></template>
        </sd-button>
      </sd-button-group>
      <sd-button-group size="small" disabled>
        <sd-button> 上一项 </sd-button>
        <sd-button> 下一项 </sd-button>
      </sd-button-group>
    </sd-space>
  </sd-space>
</template>
