import { getScrollBarWidth } from '../dom';

describe('getScrollBarWidth', () => {
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement('style');
    document.head.appendChild(style);
  });

  afterEach(() => {
    style.remove();
  });

  it('does not return a negative width for BODY when the page overflows horizontally', () => {
    style.textContent = 'body { height: 3000px } #sd-probe-wide { width: 4000px }';
    const wide = document.createElement('div');
    wide.id = 'sd-probe-wide';
    document.body.appendChild(wide);

    // 横向溢出时 scrollWidth 大于视口宽度，不能拿它算滚动条宽度
    expect(getScrollBarWidth(document.body)).to.be.at.least(0);

    wide.remove();
  });

  it('measures a scrollable element from its offset and client width', () => {
    style.textContent = '#sd-probe-scroll { width: 100px; height: 50px; overflow: scroll }';
    const el = document.createElement('div');
    el.id = 'sd-probe-scroll';
    document.body.appendChild(el);

    expect(getScrollBarWidth(el)).to.eq(el.offsetWidth - el.clientWidth);

    el.remove();
  });
});
