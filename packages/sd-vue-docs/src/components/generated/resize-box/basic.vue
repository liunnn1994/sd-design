<template>
  <div>
    <sd-resize-box
      :directions="['right', 'bottom']"
      :style="{
        width: '500px',
        minWidth: '100px',
        maxWidth: '100%',
        height: '200px',
        textAlign: 'center',
      }"
    >
      <sd-typography-paragraph
        >We are building the future of content discovery and creation.</sd-typography-paragraph
      >
      <sd-divider />
      <sd-typography-paragraph>
        ByteDance's content platforms enable people to enjoy content powered by AI technology. We
        inform, entertain, and inspire people across language, culture and geography.
      </sd-typography-paragraph>
      <sd-divider>ByteDance</sd-divider>
      <sd-typography-paragraph
        >Yiming Zhang is the founder and CEO of ByteDance.</sd-typography-paragraph
      >
    </sd-resize-box>
  </div>
</template>
