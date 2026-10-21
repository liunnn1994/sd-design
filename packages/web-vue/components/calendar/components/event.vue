<template>
  <div
    v-on="eventListeners"
    ref="eventEl"
    :class="[`${prefixCls}__event`, classes]"
    :style="styles"
    :draggable="isDraggable ? 'true' : undefined"
    @dragstart="isDraggable && dnd.eventDragStart($event, event)"
    @dragend="isDraggable && dnd.eventDragEnd($event, event)"
  >
    <div :class="`${prefixCls}__event-details`">
      <slot v-if="$slots['event.all-day']" name="event.all-day" :event="event"></slot>
      <slot v-else-if="$slots[`event.${view.id}`]" :name="`event.${view.id}`" :event="event"></slot>
      <slot v-else name="event" :event="event">
        <PerformantEllipsis :class="`${prefixCls}__event-title`">{{
          event.title
        }}</PerformantEllipsis>
        <div
          v-if="config.time && !inAllDayBar && !(event._.multiday && !eventStartsInThisCell)"
          :class="`${prefixCls}__event-time`"
        >
          <span v-if="view.isMonth" :class="`${prefixCls}__event-comma`">,&nbsp;</span>
          <PerformantEllipsis :class="`${prefixCls}__event-time-text`"
            ><span :class="`${prefixCls}__event-start`">{{
              event._[`startTimeFormatted${config.twelveHour ? 12 : 24}`]
            }}</span>
            <span v-if="!view.isMonth" :class="`${prefixCls}__event-end`">
              &nbsp;-&nbsp;{{ event._[`endTimeFormatted${config.twelveHour ? 12 : 24}`] }}
              <span v-if="event._.multiday && eventStartsInThisCell"
                >+{{ plusDaysIndicator }}d</span
              >
            </span></PerformantEllipsis
          >
        </div>
        <div v-if="!inAllDayBar" :class="`${prefixCls}__event-content`">
          <slot name="event-content" :event="event">{{ event.content }}</slot>
        </div>
      </slot>
    </div>
    <div v-if="isResizable" @dragstart.prevent.stop :class="`${prefixCls}__event-resizer`"></div>
    <transition :name="`${prefixCls}-delete-btn`">
      <div
        v-if="event._.deleting"
        @click.stop="event.delete(3)"
        :class="`${prefixCls}__event-delete`"
      >
        {{ calendar.texts.deleteEvent }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  /**
   * This component renders an event in full in a cell if the event is not multi-day.
   * If the event is multi-day, it renders a fragment of the event only.
   */

  import type { PropType, CSSProperties } from 'vue';
  import {
    computed,
    inject,
    onMounted,
    reactive,
    ref,
    shallowRef,
    watch,
    onBeforeUnmount,
  } from 'vue';

  import {
    createCalendarEventRules,
    createCalendarEventInteraction,
  } from '@sdata/web-core/calendar/event';

  import type { CalendarEvent, CalendarListener } from '../types';

  import { PerformantEllipsis } from '../../ellipsis';
  import { calendarInjectionKey } from '../context';

  const props = defineProps({
    event: { type: Object as PropType<CalendarEvent>, required: true },
    inAllDayBar: { type: Boolean, default: false },
    cellStart: { type: Date, required: true },
    cellEnd: { type: Date, required: true },
  });

  defineEmits(['event-drag-start', 'event-drag-end', 'event-resize-start', 'event-resize-end']);

  const calendar = inject(calendarInjectionKey)!;
  const { config, view, dnd, eventsManager } = calendar;
  const prefixCls = calendar.prefixCls;
  const { handleEventResize } = eventsManager;
  const eventEl = ref<HTMLElement | null>(null);
  const event = reactive(props.event);
  const touch = reactive({ canTouchAndDrag: null as boolean | null });
  const rules = createCalendarEventRules(calendar, props, event, {
    get canTouchAndDrag() {
      return touch.canTouchAndDrag;
    },
    get startsInCell(): boolean {
      return eventStartsInThisCell.value;
    },
    get endsInCell(): boolean {
      return eventEndsInThisCell.value;
    },
  });
  const isDraggable = computed(rules.isDraggable);

  const isResizable = computed(rules.isResizable);

  const classes = computed(rules.classes);

  const eventStartsInThisCell = computed(rules.eventStartsInThisCell);

  const eventEndsInThisCell = computed(rules.eventEndsInThisCell);

  const plusDaysIndicator = computed(rules.plusDaysIndicator);

  const styles = computed<CSSProperties | false>(rules.styles);

  // Automatically forwards any event listener attached to calendar starting with @event- to the
  // (calendar) event.
  // Uses shallowRef + watch instead of computed so the listeners object reference stays stable
  // unless the set of external event listeners actually changes — preventing unnecessary
  // remove/re-add of DOM event listeners via v-on on every render.
  const eventListeners = shallowRef<Record<string, CalendarListener>>({});

  const interaction = createCalendarEventInteraction(
    {
      prefixCls,
      event,
      element: () => eventEl.value!,
      listeners: () => eventListeners.value,
      resize: handleEventResize,
    },
    touch,
  );
  watch(
    () => config.eventListeners.event,
    (listeners) => {
      eventListeners.value = interaction.buildListeners(listeners);
    },
    { immediate: true },
  );

  // Register the DOM node within the event in order to emit `event-deleted` to the cell.
  onMounted(() => event._.register!(eventEl.value!));

  onBeforeUnmount(() => {
    interaction.dispose();
    event._.unregister!();
  });
</script>
