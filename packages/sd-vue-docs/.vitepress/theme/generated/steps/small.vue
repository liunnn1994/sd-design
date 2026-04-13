<template>
  <div>
    <a-steps :current="2" small>
      <a-step>Succeeded</a-step>
      <a-step>Processing</a-step>
      <a-step>Pending</a-step>
    </a-steps>
    <a-divider />
    <div style="line-height: 140px; text-align: center; color: #c9cdd4"> Step 2 Content </div>
  </div>
</template>
