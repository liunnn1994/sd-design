<template>
  <sd-list :gridProps="{ gutter: 0, span: 6 }" :bordered="false">
    <sd-list-item>
      <sd-list>
        <template #header>平台</template>
        <sd-list-item>iOS</sd-list-item>
        <sd-list-item>Android</sd-list-item>
        <sd-list-item>Web</sd-list-item>
      </sd-list>
    </sd-list-item>
    <sd-list-item>
      <sd-list>
        <template #header>框架</template>
        <sd-list-item>Angular</sd-list-item>
        <sd-list-item>Vue</sd-list-item>
        <sd-list-item>React</sd-list-item>
      </sd-list>
    </sd-list-item>
    <sd-list-item>
      <sd-list>
        <template #header>语言</template>
        <sd-list-item>C++</sd-list-item>
        <sd-list-item>JavaScript</sd-list-item>
        <sd-list-item>Python</sd-list-item>
      </sd-list>
    </sd-list-item>
    <sd-list-item>
      <sd-list>
        <template #header>组件</template>
        <sd-list-item>按钮</sd-list-item>
        <sd-list-item>面包屑</sd-list-item>
        <sd-list-item>穿梭框</sd-list-item>
      </sd-list>
    </sd-list-item>
  </sd-list>
</template>
