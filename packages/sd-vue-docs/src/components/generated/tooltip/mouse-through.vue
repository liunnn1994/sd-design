<template>
  <sd-space>
    <sd-tooltip content="鼠标会穿过气泡，离开按钮后自动隐藏">
      <sd-button>默认穿透</sd-button>
    </sd-tooltip>
    <sd-tooltip :mouse-through="false" content="鼠标可以移入气泡并保持显示">
      <sd-button>关闭穿透</sd-button>
    </sd-tooltip>
  </sd-space>
</template>
