export function createDialogDrag(adapter: {
  readonly modal: HTMLElement | undefined;
  readonly wrapper: HTMLElement | undefined;
  readonly draggable: boolean;
  readonly alignCenter: boolean;
  setPosition(value: [number, number]): void;
}) {
  let dragging = false;
  let startMouse = [0, 0];
  let initialPosition = [0, 0];
  let minPosition = [0, 0];
  let maxPosition = [0, 0];

  function measure() {
    if (adapter.wrapper && adapter.modal) {
      const { top: wrapperTop, left: wrapperLeft } = adapter.wrapper.getBoundingClientRect();
      const { clientWidth: wrapperWidth, clientHeight: wrapperHeight } = adapter.wrapper;
      const { top, left, width, height } = adapter.modal.getBoundingClientRect();
      const offsetTop = adapter.alignCenter ? 0 : adapter.modal.offsetTop;
      const initialX = left - wrapperLeft;
      const initialY = top - wrapperTop - offsetTop;
      if (initialX !== initialPosition[0] || initialY !== initialPosition[1])
        initialPosition = [initialX, initialY];
      const maxX = wrapperWidth > width ? wrapperWidth - width : 0;
      const maxY = wrapperHeight > height ? wrapperHeight - height - offsetTop : 0;
      if (maxX !== maxPosition[0] || maxY !== maxPosition[1]) maxPosition = [maxX, maxY];
      if (offsetTop) minPosition = [0, -offsetTop];
    }
  }
  function move(event: MouseEvent) {
    if (dragging) {
      let x = initialPosition[0] + (event.x - startMouse[0]);
      let y = initialPosition[1] + (event.y - startMouse[1]);
      if (x < minPosition[0]) x = minPosition[0];
      if (x > maxPosition[0]) x = maxPosition[0];
      if (y < minPosition[1]) y = minPosition[1];
      if (y > maxPosition[1]) y = maxPosition[1];
      adapter.setPosition([x, y]);
    }
  }
  function up() {
    dragging = false;
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
    window.removeEventListener('contextmenu', up);
  }
  function down(event: MouseEvent) {
    if (adapter.draggable) {
      event.preventDefault();
      dragging = true;
      measure();
      startMouse = [event.x, event.y];
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      window.addEventListener('contextmenu', up);
    }
  }
  return { down, up };
}
