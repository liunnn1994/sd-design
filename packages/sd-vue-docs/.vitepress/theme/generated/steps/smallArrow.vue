<template>
  <div>
    <a-steps type="arrow" :current="2" small style="margin-bottom: 20px;">
      <a-step description="This is a description">Succeeded</a-step>
      <a-step description="This is a description">Processing</a-step>
      <a-step description="This is a description">Pending</a-step>
    </a-steps>
    <a-steps type="arrow" :current="2" small status="error">
      <a-step description="This is a description">Succeeded</a-step>
      <a-step description="This is a description">Processing</a-step>
      <a-step description="This is a description">Pending</a-step>
    </a-steps>
  </div>
</template>
