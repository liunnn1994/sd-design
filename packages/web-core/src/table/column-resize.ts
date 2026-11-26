import { createPointerDrag } from '../_utils/pointer-drag.js';
export interface ColumnResizeState {
  readonly thElements: Record<string, HTMLElement>;
  resizingColumn: string;
  readonly columnWidth: Record<string, number>;
}
export function createColumnResizeFoundation(
  state: ColumnResizeState,
  emit: (name: 'columnResize', field: string, width: number) => unknown,
) {
  const drag = createPointerDrag(move, () => {
    state.resizingColumn = '';
  });

  const handleThPointerDown = (dataIndex: string, ev: PointerEvent, handle?: HTMLElement) => {
    if (!drag.start(ev, handle)) return;
    ev.preventDefault();
    state.resizingColumn = dataIndex;
  };

  const stopResize = () => {
    drag.stop();
    state.resizingColumn = '';
  };

  function move(ev: PointerEvent) {
    const element = state.thElements[state.resizingColumn];
    if (element) {
      const { clientX } = ev;
      const { x } = element.getBoundingClientRect();
      let width = Math.ceil(clientX - x);
      if (width < 40) {
        width = 40;
      }
      state.columnWidth[state.resizingColumn] = width;
      emit('columnResize', state.resizingColumn, width);
    }
  }

  return { handleThPointerDown, stopResize, dispose: stopResize };
}
