<template>
  <div ref="bodyEl" :style="bodyStyles" :class="`${prefixCls}__body`">
    <transition :name="`${prefixCls}-shrink`">
      <div
        v-if="config.timeAtCursor && (cursorXPercent !== null || cursorYPercent !== null)"
        :style="timeAtCursor.style"
        :class="`${prefixCls}__time-at-cursor`"
      >
        <label>{{ timeAtCursor.time }}</label>
      </div>
    </transition>
    <VueCalCell
      v-for="(date, i) in view.cellDates"
      :key="i"
      :start="date.start"
      :end="date.end"
      :index="Number(i)"
    >
      <template v-if="$slots.cell" #cell="params">
        <slot name="cell" v-bind="params"></slot>
      </template>
      <template v-if="$slots['cell-date']" #cell-date="params">
        <slot name="cell-date" v-bind="params"></slot>
      </template>
      <template v-if="$slots['cell-content']" #cell-content="params">
        <slot name="cell-content" v-bind="params"></slot>
      </template>
      <template v-if="$slots['cell-events']" #cell-events="params">
        <slot name="cell-events" v-bind="params"></slot>
      </template>
      <template v-if="$slots[`event.${view.id}`]" #[`event.${view.id}`]="params">
        <slot :name="`event.${view.id}`" v-bind="params"></slot>
      </template>
      <template v-if="$slots['event.all-day']" #event.all-day="params">
        <slot name="event.all-day" v-bind="params"></slot>
      </template>
      <template v-if="$slots.event" #event="params">
        <slot name="event" v-bind="params"></slot>
      </template>
      <template v-if="$slots['event-count']" #event-count="params">
        <slot name="event-count" v-bind="params"></slot>
      </template>
      <template v-if="$slots['special-hours-label']" #special-hours-label="params">
        <slot name="special-hours-label" v-bind="params"></slot>
      </template>
      <template v-if="$slots['now-line']" #now-line="params">
        <slot name="now-line" v-bind="params"></slot>
      </template>
    </VueCalCell>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';

  import { createCalendarBodyController } from '@sdata/web-core/calendar/surface-interaction';
  import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';

  import { calendarInjectionKey } from '../context';
  import VueCalCell from './cell.vue';

  const calendar = inject(calendarInjectionKey)!;
  const { view, config, eventsManager } = calendar;
  const prefixCls = calendar.prefixCls;

  const bodyEl = ref<HTMLElement | null>(null);
  const cursorXPercent = ref<number | null>(null);
  const cursorYPercent = ref<number | null>(null);

  const cursor = {
    get x() {
      return cursorXPercent.value;
    },
    set x(value: number | null) {
      cursorXPercent.value = value;
    },
    get y() {
      return cursorYPercent.value;
    },
    set y(value: number | null) {
      cursorYPercent.value = value;
    },
  };
  const rules = createCalendarSurfaceRules(
    calendar,
    { isDark: false, hasTimeColumn: false },
    cursor,
  );
  // Use resizing state from events composable.
  const { resizeState } = eventsManager;

  // These CSS variables must stay at this level and not at the root, because they need to be "dead"
  // and frozen with the animated container when leaving in a vue transition, for a successful smooth
  // transition. In other terms, there can be 2 sd-calendar__scrollable elements that are animated with
  // different values of these CSS variables at the same time. Beautiful :)
  const bodyStyles = computed(rules.bodyStyles);

  // Computes the time at the current cursor position.
  const timeAtCursor = computed(rules.timeAtCursor);

  const controller = createCalendarBodyController(calendar, cursor, {
    get element() {
      return bodyEl.value;
    },
    resizeState,
  });
  onMounted(controller.mount);
  onBeforeUnmount(controller.dispose);
</script>
