<template>
  <sd-steps :current="2" status="error">
    <sd-step description="This is a description">Succeeded</sd-step>
    <sd-step description="This is a description">Error</sd-step>
    <sd-step description="This is a description">Pending</sd-step>
  </sd-steps>
</template>
