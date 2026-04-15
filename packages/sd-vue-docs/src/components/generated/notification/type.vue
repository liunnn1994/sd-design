<template>
  <sd-space>
    <sd-button type="primary" @click="() => this.$notification.info('This is an info message!')">
      Info
    </sd-button>
    <sd-button
      type="primary"
      status="success"
      @click="() => this.$notification.success('This is a success message!')"
    >
      Success
    </sd-button>
    <sd-button
      type="primary"
      status="warning"
      @click="() => this.$notification.warning('This is a warning message!')"
    >
      Warning
    </sd-button>
    <sd-button
      type="primary"
      status="danger"
      @click="() => this.$notification.error('This is an error message!')"
    >
      Error
    </sd-button>
    <sd-button
      type="secondary"
      @click="
        () =>
          this.$notification.info({
            content: 'This is an error message!',
            showIcon: false,
          })
      "
    >
      Normal
    </sd-button>
  </sd-space>
</template>
