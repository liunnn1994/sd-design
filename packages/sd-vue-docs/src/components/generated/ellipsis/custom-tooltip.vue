<template>
  <sd-ellipsis
    :tooltip="{ position: 'bottom', mini: true }"
    style="display: block; width: min(100%, 14rem)"
  >
    将鼠标悬停在截断的内容上，即可显示通过提示插槽渲染的自定义内容。
    <template #tooltip>
      <div>
        <strong>完整内容</strong>
        <div class="sd:mt-1">
          将鼠标悬停在截断的内容上，即可显示通过提示插槽渲染的自定义内容。
        </div>
      </div>
    </template>
  </sd-ellipsis>
</template>
