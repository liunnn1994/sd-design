<template>
  <div
    ref="cellEl"
    v-on="cellEventListeners"
    :data-start="props.start.getTime()"
    :class="[`${prefixCls}__cell`, classes]"
  >
    <slot v-if="$slots.cell" name="cell" :cell="cellInfo"></slot>

    <template v-if="specialHours?.default?.length && !config.schedules?.length">
      <div
        v-for="(range, i) in specialHours.default"
        :style="range.style"
        :class="[`${prefixCls}__special-hours`, range.class]"
      >
        <slot name="special-hours-label" :range="range">{{ range.label }}</slot>
      </div>
    </template>

    <template v-if="!$slots.cell && config.schedules">
      <div
        v-for="{ schedule, ranges } in schedulesWithCellSpecialHours"
        :key="schedule.id"
        :class="[`${prefixCls}__schedule`, `${prefixCls}__schedule--cell`, schedule.class]"
        :style="schedule.style || null"
        :data-schedule="schedule.id"
      >
        <template v-if="ranges.length">
          <div
            v-for="(range, i) in ranges"
            :key="`${schedule.id}-${i}`"
            :style="range.style"
            :class="[`${prefixCls}__special-hours`, range.class]"
          >
            <slot name="special-hours-label" :range="range" :schedule="schedule">{{
              range.label
            }}</slot>
          </div>
        </template>
        <div v-if="formattedCellDate || $slots['cell-date']" :class="`${prefixCls}__cell-date`">
          <slot
            name="cell-date"
            :cell="cellInfo"
            :view="view"
            :schedule="schedule"
            :events="scheduleEvents(schedule)"
            >{{ formattedCellDate }}</slot
          >
        </div>
        <div v-if="$slots['cell-content']" :class="`${prefixCls}__cell-content`">
          <slot
            name="cell-content"
            :cell="cellInfo"
            :view="view"
            :schedule="schedule"
            :events="scheduleEvents(schedule)"
          ></slot>
        </div>
        <div v-if="$slots['cell-events']" :class="`${prefixCls}__cell-events`">
          <slot
            name="cell-events"
            :cell="cellInfo"
            :view="view"
            :schedule="schedule"
            :events="scheduleEvents(schedule)"
          ></slot>
        </div>
        <!-- Animate event deletions. -->
        <transition-group
          v-else-if="cellEvents.length || transitioning"
          :name="`${prefixCls}-event-delete`"
          @before-leave="transitioning = true"
          @after-leave="afterDelete"
          tag="div"
          :class="`${prefixCls}__cell-events`"
        >
          <event
            v-for="event in cellEventsPerSchedule?.[schedule.id]"
            :key="event._.id"
            :event="event"
            @event-deleted="onEventDelete"
            :in-all-day-bar="props.allDay"
            :cell-start="props.start"
            :cell-end="props.end"
            :style="eventStyles[event._.id]"
          >
            <template v-if="$slots['event.all-day'] && props.allDay" #event.all-day="params">
              <slot name="event.all-day" v-bind="params"></slot>
            </template>
            <template v-if="$slots[`event.${view.id}`]" #[`event.${view.id}`]="params">
              <slot :name="`event.${view.id}`" v-bind="params"></slot>
            </template>
            <template v-if="$slots.event" #event="params">
              <slot name="event" v-bind="params"></slot>
            </template>
            <template v-if="$slots['event-content']" #event-content="params">
              <slot name="event-content" v-bind="params"></slot>
            </template>
          </event>
        </transition-group>
        <div
          v-if="isCreatingEvent && touch.schedule === schedule.id && !props.allDay"
          :style="eventPlaceholder.style"
          :class="`${prefixCls}__event-placeholder`"
        >
          {{ eventPlaceholder.start }} - {{ eventPlaceholder.end }}
        </div>
      </div>
    </template>

    <template v-if="!$slots.cell && !config.schedules">
      <div v-if="formattedCellDate || $slots['cell-date']" :class="`${prefixCls}__cell-date`">
        <slot name="cell-date" :cell="cellInfo" :view="view">{{ formattedCellDate }}</slot>
      </div>
      <div v-if="$slots['cell-content']" :class="`${prefixCls}__cell-content`">
        <slot name="cell-content" :cell="cellInfo" :view="view"></slot>
      </div>
      <div v-if="$slots['cell-events'] && cellEvents.length" :class="`${prefixCls}__cell-events`">
        <slot name="cell-events" :cell="cellInfo" :view="view"></slot>
      </div>
      <!-- Animate event deletions. -->
      <transition-group
        v-else-if="
          !(view.isMonth && !config.eventsOnMonthView) &&
          !view.isYear &&
          !view.isYears &&
          (cellEvents.length || transitioning)
        "
        :name="`${prefixCls}-event-delete`"
        @before-leave="transitioning = true"
        @after-leave="afterDelete"
        tag="div"
        :class="`${prefixCls}__cell-events`"
      >
        <event
          v-for="event in cellEvents"
          :key="event._.id"
          :event="event"
          @event-deleted="onEventDelete"
          :in-all-day-bar="props.allDay"
          :cell-start="props.start"
          :cell-end="props.end"
          :class="eventClasses[event._.id]"
          :style="eventStyles[event._.id]"
        >
          <template v-if="$slots['event.all-day'] && props.allDay" #event.all-day="params">
            <slot name="event.all-day" v-bind="params"></slot>
          </template>
          <template v-if="$slots[`event.${view.id}`]" #[`event.${view.id}`]="params">
            <slot :name="`event.${view.id}`" v-bind="params"></slot>
          </template>
          <template v-if="$slots.event" #event="params">
            <slot name="event" v-bind="params"></slot>
          </template>
          <template v-if="$slots['event-content']" #event-content="params">
            <slot name="event-content" v-bind="params"></slot>
          </template>
        </event>
      </transition-group>
      <div
        v-if="isCreatingEvent"
        :style="eventPlaceholder.style"
        :class="`${prefixCls}__event-placeholder`"
      >
        {{ eventPlaceholder.start }} - {{ eventPlaceholder.end }}
      </div>
    </template>

    <slot v-if="$slots['event-count']" name="event-count" :events="cellForegroundEvents"></slot>
    <div v-else-if="showCellEventCount" :class="`${prefixCls}__cell-events-count`">
      {{ cellForegroundEvents.length }}
    </div>

    <div
      v-if="view.nowLine.show && isToday && !allDay"
      :style="view.nowLine.style"
      :title="view.nowLine.currentTime"
      :class="`${prefixCls}__now-line`"
    >
      <slot name="now-line" :now="view.now" :time-formatted="view.nowLine.currentTime">
        <span>{{ view.nowLine.currentTime }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CalendarCellDerived } from '@sdata/web-core/calendar/cell';

  import type { CSSProperties } from 'vue';
  import {
    computed,
    inject,
    nextTick,
    onBeforeUnmount,
    reactive,
    ref,
    shallowRef,
    watch,
  } from 'vue';

  import { createCalendarCellRules, createCalendarCellTouch } from '@sdata/web-core/calendar/cell';
  import { createCalendarCellInteraction } from '@sdata/web-core/calendar/cell-interaction';

  import type { CalendarEvent, CalendarId, CalendarSchedule, CalendarListener } from '../types';

  import { calendarInjectionKey } from '../context';
  import Event from './event.vue';

  const props = defineProps({
    // Even with time=false, the date of the cell will still be provided in order to attach
    // events to a specific date.
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    index: { type: Number, required: true },
    allDay: { type: Boolean, default: false }, // True when the cell is an all-day cell.
  });

  const calendar = inject(calendarInjectionKey)!;
  const { view, config, eventsManager } = calendar;
  const prefixCls = calendar.prefixCls;
  const touch = reactive(createCalendarCellTouch());
  const derived: CalendarCellDerived = {
    get awaitingEventCreation() {
      return awaitingEventCreation.value;
    },
    get isToday() {
      return isToday.value;
    },
    get cellEvents() {
      return cellEvents.value;
    },
    get cellForegroundEvents() {
      return cellForegroundEvents.value;
    },
    get overlappingEvents() {
      return overlappingEvents.value;
    },
    get specialHours() {
      return specialHours.value;
    },
    get isBeforeMinDate() {
      return isBeforeMinDate.value;
    },
    get isAfterMaxDate() {
      return isAfterMaxDate.value;
    },
    get isDisabled() {
      return isDisabled.value;
    },
    get deletedIds() {
      return eventsDeleted.value;
    },
  };
  const rules: ReturnType<typeof createCalendarCellRules<CalendarSchedule & { id: CalendarId }>> =
    createCalendarCellRules(calendar, props, touch, derived);
  const isToday = computed(rules.isToday);

  const cellEl = ref<HTMLElement | null>(null);
  // Store deleted events per cell and filter them out in that specific cell.
  // Only delete the events for good when unmounting the cell, in order to avoid re-rendering all the
  // cells in the view when deleting in the source of truth.
  const eventsDeleted = ref<string[]>([]);
  // Wait for the event deletion transition end before unmounting the events container if no event.
  const transitioning = ref(false);
  const onEventDelete = (e: CustomEvent) => {
    eventsDeleted.value.push(e.detail);
    transitioning.value = true;
  };
  const afterDelete = () => setTimeout(() => (transitioning.value = false), 300);

  // The touch/mouse events listeners are always attached to the cell, but if the event.target is a schedule,
  // display the event placeholder in that schedule.

  const awaitingEventCreation = ref(false);

  // Overlapping events calculation (only updates when event IDs or date ranges change).
  const overlappingEvents = ref<{
    cellOverlaps: Record<
      string,
      { overlaps: CalendarId[]; maxConcurrent: number; position: number }
    >;
    longestStreak: number;
  }>({
    cellOverlaps: {},
    longestStreak: 0,
  });

  // While dragging in the cell render an event placeholder, before it becomes a normal calendar event.
  // The calendar creation could be canceled for different wanted reasons at the end of dragging.
  const eventPlaceholder = computed(rules.eventPlaceholder);

  const isCreatingEvent = computed(rules.isCreatingEvent);

  const classes = computed(rules.classes);

  const startFormatted = computed(rules.startFormatted);

  // Note: This will recompute when the locale changes (from formatDate) or xs prop changes for instance.
  // So it needs to be a distinct computed from the events.
  const formattedCellDate = computed(rules.formattedCellDate);

  const cellEvents = computed<CalendarEvent[]>(rules.cellEvents);

  const cellForegroundEvents = computed(rules.cellForegroundEvents);

  /**
   * Generates an object containing events grouped by schedule ID.
   *
   * @returns {Object} An object where keys are schedule IDs, and values are arrays of event IDs
   *                   that correspond to each schedule.
   */
  const cellEventsPerSchedule = computed(rules.cellEventsPerSchedule);

  // Compute styles for event width & offset.
  const eventStyles = computed<Record<CalendarId, CSSProperties>>(rules.eventStyles);

  /**
   * Generates an object containing event classes based on the stack position and length.
   * This lets the user style visually stacked events in full control.
   *
   * @returns {Object} An object where keys are event IDs, and values are strings
   *                   representing the event class.
   */
  const eventClasses = computed(rules.eventClasses);

  const showCellEventCount = computed(rules.showCellEventCount);

  /**
   * The special hours of the current cell day.
   * returns an array if the view is day, days, week and the specialHours prop is set correctly.
   */
  const specialHours = computed(rules.specialHours);

  // One lookup per schedule per computed refresh (avoids calling a lookup fn twice per render in the template).
  const schedulesWithCellSpecialHours = computed(rules.schedulesWithCellSpecialHours);

  const isBeforeMinDate = computed(rules.isBeforeMinDate);

  const isAfterMaxDate = computed(rules.isAfterMaxDate);

  // Is the current cell disabled or not (disabled date or before min date or after max date).
  const isDisabled = computed(rules.isDisabled);

  // Automatically forwards any event listener attached to calendar starting with @cell- to the cell.
  // Uses shallowRef + watch instead of computed so the listeners object reference stays stable
  // unless the set of external event listeners or disabled state actually changes.
  const cellEventListeners = shallowRef<Record<string, CalendarListener>>({});

  const interaction = createCalendarCellInteraction(calendar, props, touch, {
    get element() {
      return cellEl.value;
    },
    get info() {
      return cellInfo.value;
    },
    get cursor() {
      return cursorInfo.value;
    },
    get placeholder() {
      return eventPlaceholder.value;
    },
    get isCreating() {
      return isCreatingEvent.value;
    },
    get isDisabled() {
      return isDisabled.value;
    },
    get listeners() {
      return cellEventListeners.value;
    },
    get awaitingEventCreation() {
      return awaitingEventCreation.value;
    },
    set awaitingEventCreation(value) {
      awaitingEventCreation.value = value;
    },
    get deletedIds() {
      return eventsDeleted.value;
    },
  });
  watch(
    () => [isDisabled.value, config.eventListeners.cell, config.editableEvents.drag],
    () => {
      cellEventListeners.value = interaction.buildListeners();
    },
    { immediate: true },
  );

  const cellInfo = computed(() => ({
    start: props.start,
    end: props.end,
    events: cellEvents,
    today: isToday.value,
    content: formattedCellDate.value,
    ...(touch.schedule !== null ? { schedule: touch.schedule } : {}),
    goNarrower: () => view.narrower(),
    goBroader: () => view.broader(),
    broader: view.broaderView,
    narrower: view.narrowerView,
  }));

  const scheduleEvents = (schedule: CalendarSchedule & { id: CalendarId }) => {
    return cellEventsPerSchedule.value?.[schedule.id] || [];
  };

  const cursorInfo = computed(rules.cursorInfo);

  const recalculateOverlaps = () => {
    overlappingEvents.value = eventsManager.getCellOverlappingEvents(
      props.start,
      props.end,
      props.allDay,
    );
  };

  watch(
    rules.overlapKey,
    async () => {
      await nextTick(); // Use nextTick to avoid recursive updates.
      // Recalculate overlaps when events change (added, deleted, date change, schedule change).
      recalculateOverlaps();
    },
    { immediate: true, flush: 'post' }, // Use flush: 'post' to prevent infinite updates.
  );

  onBeforeUnmount(async () => {
    interaction.dispose();
    await nextTick();
  });
</script>
