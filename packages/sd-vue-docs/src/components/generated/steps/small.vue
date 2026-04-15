<template>
  <div>
    <sd-steps :current="2" small>
      <sd-step>Succeeded</sd-step>
      <sd-step>Processing</sd-step>
      <sd-step>Pending</sd-step>
    </sd-steps>
    <sd-divider />
    <div style="color: #c9cdd4; line-height: 140px; text-align: center"> Step 2 Content </div>
  </div>
</template>
