<template>
  <a-steps :current="2" status="error">
    <a-step description="This is a description">Succeeded</a-step>
    <a-step description="This is a description">Error</a-step>
    <a-step description="This is a description">Pending</a-step>
  </a-steps>
</template>
