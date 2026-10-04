import { getScrollBarWidth } from '../../_utils/dom';
import Modal from '../index';

describe('body scroll lock compensation', () => {
  it('never reports a negative scrollbar width for BODY', () => {
    // 旧实现用 scrollWidth 推算，body 被撑宽时会得到负数，
    // 进而让 use-overflow 把 body 宽度再撑大。iframe 里 scrollWidth 会被钳住，
    // 所以直接给 body 设一个超宽内联宽度来复现。
    const previous = document.body.style.width;
    document.body.style.width = '4000px';
    try {
      expect(getScrollBarWidth(document.body)).to.be.at.least(0);
    } finally {
      document.body.style.width = previous;
    }
  });

  it('restores the body style exactly after the modal closes', () => {
    const before = {
      overflow: document.body.style.overflow,
      width: document.body.style.width,
      boxSizing: document.body.style.boxSizing,
    };

    cy.mount(Modal, {
      props: { visible: true, footer: false, renderToBody: true },
    });
    cy.get('.sd-modal').should('exist');

    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => {
      expect(document.body.style.overflow).to.eq(before.overflow);
      expect(document.body.style.width).to.eq(before.width);
      expect(document.body.style.boxSizing).to.eq(before.boxSizing);
    });
  });
});
