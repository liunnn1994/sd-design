import { off, on } from '../_utils/dom.js';
export interface ColumnResizeState {
  readonly thElements: Record<string, HTMLElement>;
  resizingColumn: string;
  readonly columnWidth: Record<string, number>;
}
export function createColumnResizeFoundation(
  state: ColumnResizeState,
  emit: (name: 'columnResize', field: string, width: number) => unknown,
) {
  const handleThMouseDown = (dataIndex: string, ev: MouseEvent) => {
    ev.preventDefault();

    state.resizingColumn = dataIndex;
    on(window, 'mousemove', handleThMouseMoving);
    on(window, 'mouseup', handleThMouseUp);
    on(window, 'contextmenu', handleThMouseUp);
  };

  const handleThMouseUp = () => {
    state.resizingColumn = '';
    off(window, 'mousemove', handleThMouseMoving);
    off(window, 'mouseup', handleThMouseUp);
    off(window, 'contextmenu', handleThMouseUp);
  };

  const dispose = () => {
    if (state.resizingColumn) handleThMouseUp();
  };

  const handleThMouseMoving = (ev: MouseEvent) => {
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
  };

  return { handleThMouseDown, handleThMouseUp, dispose };
}
