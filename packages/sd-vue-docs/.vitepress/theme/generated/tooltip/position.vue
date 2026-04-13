<template>
  <div :style="{position: 'relative', width: '440px', height: '280px'}">
    <a-tooltip content="This is a Tooltip" position="tl">
      <a-button class="button" :style="{position: 'absolute',top:'0',left:'70px'}">TL</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="top">
      <a-button class="button" :style="{position: 'absolute',top:'0',left:'180px'}">TOP</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="tr">
      <a-button class="button" :style="{position: 'absolute',top:'0',left:'290px'}">TR</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="bl">
      <a-button class="button" :style="{position: 'absolute',top:'240px',left:'70px'}">BL</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="bottom">
      <a-button class="button" :style="{position: 'absolute',top:'240px',left:'180px'}">BOTTOM</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="br">
      <a-button class="button" :style="{position: 'absolute',top:'240px',left:'290px'}">BR</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="lt">
      <a-button class="button" :style="{position: 'absolute',top:'60px',left:'10px'}">LT</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="left">
      <a-button class="button" :style="{position: 'absolute',top:'120px',left:'10px'}">LEFT</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="lb">
      <a-button class="button" :style="{position: 'absolute',top:'180px',left:'10px'}">LB</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="rt">
      <a-button class="button" :style="{position: 'absolute',top:'60px',left:'350px'}">RT</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="right">
      <a-button class="button" :style="{position: 'absolute',top:'120px',left:'350px'}">RIGHT</a-button>
    </a-tooltip>
    <a-tooltip content="This is a Tooltip" position="rb">
      <a-button class="button" :style="{position: 'absolute',top:'180px',left:'350px'}">RB</a-button>
    </a-tooltip>
  </div>
</template>

<style scoped>
.button {
  width: 100px;
}
</style>
