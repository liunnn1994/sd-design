<template>
  <sd-space direction="vertical" size="large" class="sd:w-full">
    <sd-mention :data="['研发团队', '设计团队', '产品团队']" placeholder="输入 @" />
    <sd-mention :data="['研发团队', '设计团队', '产品团队']" prefix="#" placeholder="输入 #" />
    <sd-mention :data="['研发团队', '设计团队', '产品团队']" prefix="$" placeholder="输入 $" />
  </sd-space>
</template>
