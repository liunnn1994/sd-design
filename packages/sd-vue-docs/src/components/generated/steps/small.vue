<template>
  <div>
    <sd-steps :current="2" small>
      <sd-step>已成功</sd-step>
      <sd-step>处理中</sd-step>
      <sd-step>等待中</sd-step>
    </sd-steps>
    <sd-divider />
    <div class="sd:text-[#c9cdd4] sd:leading-35 sd:text-center"> 步骤 2 的内容 </div>
  </div>
</template>
