import { scrollTo } from '../utils';

const createColumn = () => {
  const element = document.createElement('div');
  Object.defineProperty(element, 'scrollTop', {
    writable: true,
    configurable: true,
    value: 0,
  });
  document.body.appendChild(element);
  return element;
};

describe('scrollTo', () => {
  it('scrolls instantly when the duration is not positive', () => {
    const element = createColumn();

    scrollTo(element, 120, 0);

    expect(element.scrollTop).to.eq(120);
  });

  it('keeps the latest target when a new scroll interrupts a running animation', () => {
    const element = createColumn();

    // 第一段动画还没跑完就发起第二段更短的滚动
    scrollTo(element, 100, 100);
    cy.wait(30).then(() => {
      scrollTo(element, 300, 20);
    });
    cy.wait(400).then(() => {
      // 后一次滚动必须获胜：上一段动画未停止的话会继续写 scrollTop，把结果拉回 100
      expect(element.scrollTop).to.eq(300);
    });
  });
});
