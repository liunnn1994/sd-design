<template>
  <a-slider :default-value="5" :style="{ width: '300px' }" :max="15" :marks="marks" />
</template>

<script>
export default {
  setup() {
    const marks = {
      0: '0km',
      5: '5km',
      10: '10km',
      15: '15km'
    };
    return {
      marks
    }
  },
}
</script>
