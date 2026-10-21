<template>
  <div :class="`${prefixCls}__time-column`">
    <div :class="`${prefixCls}__time-column-inner`">
      <div v-if="config.allDayEvents" :class="`${prefixCls}__all-day-label`">
        <slot name="all-day-label">{{ calendar.texts.allDay }}</slot>
      </div>

      <div
        v-for="(time, i) in timeCells"
        :key="i"
        :style="{ height: time.height || undefined }"
        :class="`${prefixCls}__time-cell`"
      >
        <slot
          name="time-cell"
          :index="i"
          :minutes="time.minutes"
          :hours="time.hours"
          :minutes-sum="time.minutesSum"
          :format12="time.formatted12"
          :format24="time.formatted24"
        >
          <label>{{ config.twelveHour ? time.formatted12 : time.formatted24 }}</label>
        </slot>
      </div>

      <div
        v-if="config.currentTimeLabel"
        :style="view.nowLine.style"
        :title="view.nowLine.currentTime"
        :class="`${prefixCls}__current-time`"
      >
        <slot name="current-time-label" :now="view.now" :time-formatted="view.nowLine.currentTime">
          <span>{{ view.nowLine.currentTime }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';

  import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';

  import { calendarInjectionKey } from '../context';

  const calendar = inject(calendarInjectionKey)!;
  const { config, view } = calendar;
  const prefixCls = calendar.prefixCls;

  const rules = createCalendarSurfaceRules(calendar, { isDark: false, hasTimeColumn: false });
  const timeCells = computed(rules.timeCells);
</script>
