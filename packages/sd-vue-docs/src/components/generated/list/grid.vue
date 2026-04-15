<template>
  <sd-list :gridProps="{ gutter: 0, span: 6 }" :bordered="false">
    <sd-list-item>
      <sd-list>
        <template #header>Platform</template>
        <sd-list-item>iOS</sd-list-item>
        <sd-list-item>Android</sd-list-item>
        <sd-list-item>Web</sd-list-item>
      </sd-list>
    </sd-list-item>
    <sd-list-item>
      <sd-list>
        <template #header>Framework</template>
        <sd-list-item>Angular</sd-list-item>
        <sd-list-item>Vue</sd-list-item>
        <sd-list-item>React</sd-list-item>
      </sd-list>
    </sd-list-item>
    <sd-list-item>
      <sd-list>
        <template #header>Language</template>
        <sd-list-item>C++</sd-list-item>
        <sd-list-item>JavaScript</sd-list-item>
        <sd-list-item>Python</sd-list-item>
      </sd-list>
    </sd-list-item>
    <sd-list-item>
      <sd-list>
        <template #header>Component</template>
        <sd-list-item>Button</sd-list-item>
        <sd-list-item>Breadcrumb</sd-list-item>
        <sd-list-item>Transfer</sd-list-item>
      </sd-list>
    </sd-list-item>
  </sd-list>
</template>
