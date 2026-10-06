<template>
  <div>
    <sd-progress
      :percent="0.8"
      class="sd:w-[50%]"
      :color="{
        '0%': 'rgb(var(--sd-primary-6))',
        '100%': 'rgb(var(--sd-success-6))',
      }"
    />
    <br />
    <br />

    <sd-progress
      :percent="1"
      class="sd:w-[50%]"
      :color="{
        '0%': 'rgb(var(--sd-primary-6))',
        '100%': 'rgb(var(--sd-success-6))',
      }"
    />
    <br />
    <br />
    <sd-space size="large">
      <sd-progress
        type="circle"
        :percent="0.8"
        :color="{
          '0%': 'rgb(var(--sd-primary-6))',
          '100%': 'rgb(var(--sd-success-6))',
        }"
      />

      <sd-progress
        type="circle"
        :percent="1"
        :color="{
          '0%': 'rgb(var(--sd-primary-6))',
          '100%': 'rgb(var(--sd-success-6))',
        }"
      />
    </sd-space>
  </div>
</template>
