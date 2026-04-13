<template>
  <a-input-number v-model="value" :style="{width:'320px'}" placeholder="Please Enter" class="input-demo" :min="10" :max="100" model-event="input"/>
  <div>value: {{value}}</div>
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
