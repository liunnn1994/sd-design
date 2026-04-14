<template>
  <div>
    <a-resize-box
      :directions="['right', 'bottom']"
      :style="{
        width: '500px',
        minWidth: '100px',
        maxWidth: '100%',
        height: '200px',
        textAlign: 'center',
      }"
    >
      <a-typography-paragraph
        >We are building the future of content discovery and creation.</a-typography-paragraph
      >
      <a-divider />
      <a-typography-paragraph>
        ByteDance's content platforms enable people to enjoy content powered by AI technology. We
        inform, entertain, and inspire people across language, culture and geography.
      </a-typography-paragraph>
      <a-divider>ByteDance</a-divider>
      <a-typography-paragraph
        >Yiming Zhang is the founder and CEO of ByteDance.</a-typography-paragraph
      >
    </a-resize-box>
  </div>
</template>
