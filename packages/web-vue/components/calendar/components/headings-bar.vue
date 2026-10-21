<template>
  <div v-if="showHeadings" :class="`${prefixCls}__headings`">
    <div v-if="!view.isDay" :class="`${prefixCls}__weekdays-headings`">
      <div
        v-for="(day, i) in weekDays"
        :key="i"
        @click="domEvents.click(day.date)"
        :class="[`${prefixCls}__weekday`, { [`${prefixCls}__weekday--today`]: day.isToday }]"
      >
        <slot
          name="weekday-heading"
          :label="day[dayLabelSize]"
          :id="day.id"
          :date="day.date"
          :view="view"
        >
          <span :class="`${prefixCls}__weekday-day`">{{ day[dayLabelSize] }}</span>
          <strong v-if="!view.isMonth" :class="`${prefixCls}__weekday-date`">{{
            day.dateNumber
          }}</strong>
        </slot>
      </div>
    </div>
    <div v-if="config.schedules" :class="`${prefixCls}__schedules-headings`">
      <template v-for="(day, i) in weekDays" :key="i">
        <template v-for="(schedule, j) in config.schedules" :key="j">
          <div
            v-if="$slots['schedule-heading']"
            :class="[`${prefixCls}__schedule`, `${prefixCls}__schedule--heading`, schedule.class]"
          >
            <slot
              name="schedule-heading"
              :schedule="schedule"
              :view="view"
              :cell="headingCell(day)"
            ></slot>
          </div>
          <div
            v-else
            :class="[`${prefixCls}__schedule`, `${prefixCls}__schedule--heading`, schedule.class]"
          >
            <PerformantEllipsis>{{ schedule.label }}</PerformantEllipsis>
          </div>
        </template>
      </template>
    </div>
    <div v-if="config.allDayEvents" :class="`${prefixCls}__all-day`">
      <cell
        v-for="(day, i) in weekDays"
        :key="i"
        :class="[`${prefixCls}__all-day-cell`, { [`${prefixCls}__weekday--today`]: day.isToday }]"
        :start="day.date"
        :end="headingEnd(day.date)"
        :index="Number(i)"
        all-day
      >
        <template v-if="$slots['event.all-day']" #event.all-day="params">
          <slot name="event.all-day" v-bind="params"></slot>
        </template>
        <template v-else #event="params">
          <slot name="event" v-bind="params"></slot>
        </template>
      </cell>
      <div
        @mousedown="allDayResizer.handleMouseDown"
        @touchstart="allDayResizer.handleTouchStart"
        :class="`${prefixCls}__all-day-resizer`"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onBeforeUnmount } from 'vue';

  import { createCalendarAllDayResizer } from '@sdata/web-core/calendar/all-day-resizer';
  import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';

  import { PerformantEllipsis } from '../../ellipsis';
  import { calendarInjectionKey, calendarElInjectionKey } from '../context';
  import Cell from './cell.vue';

  const calendar = inject(calendarInjectionKey)!;
  const $calendarEl = inject(calendarElInjectionKey)!;
  const { view, config } = calendar;
  const prefixCls = calendar.prefixCls;

  const rules = createCalendarSurfaceRules(calendar, { isDark: false, hasTimeColumn: false });
  const dayLabelSize = computed(rules.dayLabelSize);

  const showHeadings = computed(rules.showHeadings);

  // Only for days, week and month views.
  // The props sm and xs are not used in the computed so switching doesn't recompute.
  const weekDays = computed(rules.weekDays);

  const headingCell = rules.headingCell;
  const headingEnd = rules.headingEnd;
  const domEvents = rules.domEvents;
  const allDayResizer = createCalendarAllDayResizer(config, prefixCls, {
    get element() {
      return $calendarEl.value;
    },
  });
  onBeforeUnmount(allDayResizer.cleanup);
</script>
