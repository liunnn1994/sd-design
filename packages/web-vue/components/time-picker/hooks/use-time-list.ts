import type { TimeListProps } from '@sdata/web-core/time-picker/options';

import { computed } from 'vue';

import {
  getTimeHours,
  getTimeMinutes,
  getTimeSeconds,
  getTimeAmpm,
} from '@sdata/web-core/time-picker/options';

export default function useTimeList(props: TimeListProps) {
  return {
    hours: computed(() => getTimeHours(props)),
    minutes: computed(() => getTimeMinutes(props)),
    seconds: computed(() => getTimeSeconds(props)),
    ampmList: computed(() => getTimeAmpm(props)),
  };
}
