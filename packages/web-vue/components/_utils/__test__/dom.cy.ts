import { getScrollBarWidth } from '../dom';

// Cypress 的 AUT 跑在 iframe 里，documentElement.scrollWidth 会被钳到视口宽度，
// 加一个超宽的子节点并不会真正产生横向溢出。要让旧实现算出负数，
// 必须直接把 body 撑宽（body.offsetWidth 会跟着变，而 scrollWidth 不会）。
const withOversizedBody = (run: () => void) => {
  const previous = document.body.style.width;
  document.body.style.width = '4000px';
  try {
    run();
  } finally {
    document.body.style.width = previous;
  }
};

describe('getScrollBarWidth', () => {
  it('does not return a negative width for BODY when the page overflows horizontally', () => {
    withOversizedBody(() => {
      // 旧实现用 scrollWidth 推算，这里会得到 500 - 4000 = -3500
      expect(getScrollBarWidth(document.body)).to.be.at.least(0);
    });
  });

  it('measures a scrollable element from its offset and client width', () => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { writable: true, configurable: true, value: 0 });
    element.style.width = '100px';
    element.style.height = '50px';
    element.style.overflow = 'scroll';
    document.body.appendChild(element);

    expect(getScrollBarWidth(element)).to.eq(element.offsetWidth - element.clientWidth);

    element.remove();
  });
});
