<template>
  <a-space direction="vertical" size="large">
    <a-input-number v-model="value" :style="{width:'320px'}" placeholder="Please Enter" class="input-demo" :min="10" :max="100"/>
    <a-input-number :style="{width:'320px'}" placeholder="Please Enter" class="input-demo" :min="10" :max="100"/>
    <a-input-number :style="{width:'320px'}" placeholder="Please Enter" :default-value="500" class="input-demo" disabled/>
  </a-space>
</template>

<script>
export default {
  data(){
    return {
      value:15
    }

  }
}
</script>
