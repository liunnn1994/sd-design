<template>
  <div>
    <sd-steps type="arrow" :current="2" small class="sd:mb-5">
      <sd-step description="这是一段描述">已成功</sd-step>
      <sd-step description="这是一段描述">处理中</sd-step>
      <sd-step description="这是一段描述">等待中</sd-step>
    </sd-steps>
    <sd-steps type="arrow" :current="2" small status="error">
      <sd-step description="这是一段描述">已成功</sd-step>
      <sd-step description="这是一段描述">处理中</sd-step>
      <sd-step description="这是一段描述">等待中</sd-step>
    </sd-steps>
  </div>
</template>
