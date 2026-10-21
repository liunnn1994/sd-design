import { computed, toRefs } from 'vue';

import { getPanelSpan, getPanelSuperSpan } from '@sdata/web-core/date-picker/header';

import { Mode } from '../interface';

interface PanelSpanProps {
  mode: Mode;
}

export default function usePanelSpan(props: PanelSpanProps) {
  const { mode } = toRefs(props);

  const span = computed(() => getPanelSpan(mode.value));
  const superSpan = computed(() => getPanelSuperSpan(mode.value));

  return {
    span,
    superSpan,
  };
}
