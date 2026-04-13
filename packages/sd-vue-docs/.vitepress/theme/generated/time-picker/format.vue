<template>
  <a-time-picker format="HH:mm" :defaultValue="defaultValue" style="width: 130px;" />
</template>
<script>
export default {
  data() {
    return {
      defaultValue: '09:24'
    }
  }
}
</script>
