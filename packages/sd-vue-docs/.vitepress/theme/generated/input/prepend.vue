<template>
  <a-space direction="vertical" size="large">
    <a-input :style="{width:'320px'}" placeholder="Please enter something" allow-clear>
      <template #prepend>
        +86
      </template>
    </a-input>
    <a-input :style="{width:'320px'}" placeholder="Please enter something" allow-clear>
      <template #append>
        RMB
      </template>
    </a-input>

    <a-input :style="{width:'320px'}" placeholder="Please enter something" allow-clear prepend="+86">
    </a-input>
    <a-input :style="{width:'320px'}" placeholder="Please enter something" allow-clear append="RMB">
    </a-input>
  </a-space>
</template>
