import { h } from 'vue';

import Card from '../index';

const { Meta, Grid } = Card;

describe('Card', () => {
  it('should have the sd-card class', () => {
    cy.mount(Card);
    cy.get('.sd-card').should('exist');
  });

  it('title should render', () => {
    cy.mount(Card, { props: { title: 'Card title' } });
    cy.get('.sd-card-header-title').should('contain.text', 'Card title');
  });

  it('passes spinProps to its loading Spin', () => {
    cy.mount(Card, { props: { loading: true, spinProps: { tip: '卡片加载中', dot: true } } });
    cy.get('.sd-card-body .sd-dot-loading').should('exist');
    cy.get('.sd-card-body .sd-spin-tip').should('have.text', '卡片加载中');
  });

  it('extra slot should render', () => {
    cy.mount(Card, { slots: { extra: `<div id="extra-content">Extra content</div>` } });
    cy.get('#extra-content').should('exist');
  });

  it('card meta should render', () => {
    cy.mount(Card, { slots: { default: () => h(Meta, { title: 'Card meta title' }) } });
    cy.get('.sd-card-meta-title').should('contain.text', 'Card meta title');
  });

  it('card grid should render', () => {
    cy.mount(Card, { slots: { default: () => [h(Grid), h(Grid), h(Grid)] } });
    cy.get('.sd-card-grid').should('have.length', 3);
  });

  it('fullHeight should add the full-height class', () => {
    cy.mount(Card, { props: { fullHeight: true } });
    cy.get('.sd-card').should('have.class', 'sd-card-full-height');
  });

  it('fullHeight should wrap the body in Scrollbar by default', () => {
    cy.mount(Card, {
      props: { fullHeight: true },
      slots: { default: '<div id="card-content">content</div>' },
    });
    cy.get('.sd-card-body').should('have.class', 'sd-card-body-scroll');
    cy.get('.sd-card-body-scrollbar').should('exist');
    cy.get('#card-content').should('exist');
  });

  it('fullHeight with scrollbar=false should use native overflow', () => {
    cy.mount(Card, {
      props: { fullHeight: true, scrollbar: false },
      slots: { default: '<div id="card-content">content</div>' },
    });
    cy.get('.sd-card-body').should('have.class', 'sd-card-body-native');
    cy.get('.sd-card-body-scrollbar').should('not.exist');
  });

  it('fullHeight native scroll should make the body scrollable', () => {
    cy.mount({
      setup() {
        return () =>
          h('div', { style: 'height: 200px' }, [
            h(Card, { fullHeight: true, scrollbar: false }, () =>
              h('div', { style: 'height: 600px' }),
            ),
          ]);
      },
    });
    cy.get('.sd-card-body').should(($el) => {
      const el = $el[0];
      expect(el.scrollHeight).to.greaterThan(el.clientHeight);
    });
  });

  it('bordered should be true by default', () => {
    cy.mount(Card);
    cy.get('.sd-card').should('have.class', 'sd-card-bordered');
  });

  it('bordered=false should not render the border class', () => {
    cy.mount(Card, { props: { bordered: false } });
    cy.get('.sd-card').should('not.have.class', 'sd-card-bordered');
  });

  it('hoverable should add the hoverable class', () => {
    cy.mount(Card, { props: { hoverable: true } });
    cy.get('.sd-card').should('have.class', 'sd-card-hoverable');
  });

  it('size should default to medium', () => {
    cy.mount(Card);
    cy.get('.sd-card').should('have.class', 'sd-card-size-medium');
  });

  it('size=small should add the size-small class', () => {
    cy.mount(Card, { props: { size: 'small' } });
    cy.get('.sd-card').should('have.class', 'sd-card-size-small');
  });

  it('headerStyle and bodyStyle should be applied inline', () => {
    cy.mount(Card, {
      props: {
        title: 'Styled card',
        headerStyle: { padding: '20px' },
        bodyStyle: { padding: '30px' },
      },
    });
    cy.get('.sd-card-header').should('have.css', 'padding', '20px');
    cy.get('.sd-card-body').should('have.css', 'padding', '30px');
  });

  it('title slot should take precedence over the title prop', () => {
    cy.mount(Card, {
      props: { title: 'Prop title' },
      slots: { title: () => h('span', { id: 'title-slot' }, 'Slot title') },
    });
    cy.get('#title-slot').should('contain.text', 'Slot title');
    cy.get('.sd-card-header-title').should('not.contain.text', 'Prop title');
  });

  it('extra prop should render in the header extra area', () => {
    cy.mount(Card, { props: { title: 'Card title', extra: 'More' } });
    cy.get('.sd-card-header-extra').should('contain.text', 'More');
  });

  it('header with only extra should have the no-title modifier', () => {
    cy.mount(Card, { props: { extra: 'More' } });
    cy.get('.sd-card-header').should('have.class', 'sd-card-header-no-title');
  });

  it('header with title should not have the no-title modifier', () => {
    cy.mount(Card, { props: { title: 'Card title' } });
    cy.get('.sd-card-header').should('not.have.class', 'sd-card-header-no-title');
  });

  it('loading should replace the body content with a Spin', () => {
    cy.mount(Card, {
      props: { loading: true },
      slots: { default: '<div id="card-content">content</div>' },
    });
    cy.get('.sd-card').should('have.class', 'sd-card-loading');
    cy.get('.sd-card-body .sd-spin').should('exist');
    cy.get('#card-content').should('not.exist');
  });

  it('cover slot should render in the cover area', () => {
    cy.mount(Card, { slots: { cover: '<div id="card-cover">cover</div>' } });
    cy.get('.sd-card-cover').should('contain.text', 'cover');
  });

  it('actions slot should render action items in the body', () => {
    cy.mount(Card, {
      slots: {
        actions: () => [h('span', 'Reply'), h('span', 'Delete')],
      },
    });
    cy.get('.sd-card-body .sd-card-actions').should('exist');
    cy.get('.sd-card-actions-item').should('have.length', 2);
    cy.get('.sd-card-actions-item').eq(0).should('contain.text', 'Reply');
    cy.get('.sd-card-actions-item').eq(1).should('contain.text', 'Delete');
  });

  it('actions slot should move into the meta footer when Meta is present', () => {
    cy.mount(Card, {
      slots: {
        default: () => h(Meta, { title: 'Meta title' }),
        actions: () => h('span', 'Act'),
      },
    });
    cy.get('.sd-card-meta-footer .sd-card-actions').should('exist');
    cy.get('.sd-card-body > .sd-card-actions').should('not.exist');
    cy.get('.sd-card-meta-footer .sd-card-actions-item').should('contain.text', 'Act');
  });

  it('meta should render description and support the avatar slot', () => {
    cy.mount(Card, {
      slots: {
        default: () =>
          h(
            Meta,
            { title: 'Meta title', description: 'Meta description' },
            {
              avatar: () => h('div', { id: 'meta-avatar' }, 'A'),
            },
          ),
      },
    });
    cy.get('.sd-card-meta-title').should('contain.text', 'Meta title');
    cy.get('.sd-card-meta-description').should('contain.text', 'Meta description');
    cy.get('#meta-avatar').should('exist');
  });

  it('meta title and description slots should take precedence over props', () => {
    cy.mount(Card, {
      slots: {
        default: () =>
          h(
            Meta,
            { title: 'Prop title', description: 'Prop description' },
            {
              title: () => h('span', { id: 'meta-title-slot' }, 'Slot title'),
              description: () => h('span', { id: 'meta-desc-slot' }, 'Slot description'),
            },
          ),
      },
    });
    cy.get('#meta-title-slot').should('exist');
    cy.get('#meta-desc-slot').should('exist');
    cy.get('.sd-card-meta-title').should('not.contain.text', 'Prop title');
    cy.get('.sd-card-meta-description').should('not.contain.text', 'Prop description');
  });

  it('meta footer with actions but no avatar should have the only-actions modifier', () => {
    cy.mount(Card, {
      slots: {
        default: () => h(Meta, { title: 'Meta title' }),
        actions: () => h('span', 'Act'),
      },
    });
    cy.get('.sd-card-meta-footer').should('have.class', 'sd-card-meta-footer-only-actions');
  });

  it('meta footer with avatar and actions should not have the only-actions modifier', () => {
    cy.mount(Card, {
      slots: {
        default: () =>
          h(
            Meta,
            { title: 'Meta title' },
            {
              avatar: () => h('div', 'A'),
            },
          ),
        actions: () => h('span', 'Act'),
      },
    });
    cy.get('.sd-card-meta-footer').should('not.have.class', 'sd-card-meta-footer-only-actions');
  });

  it('hoverable grid should add the hoverable modifier', () => {
    cy.mount(Card, { slots: { default: () => h(Grid, { hoverable: true }) } });
    cy.get('.sd-card-grid').should('have.class', 'sd-card-grid-hoverable');
  });

  it('card containing a grid should have the contain-grid class', () => {
    cy.mount(Card, { slots: { default: () => h(Grid) } });
    cy.get('.sd-card').should('have.class', 'sd-card-contain-grid');
  });

  it('without fullHeight the body should not enable the scrollbar', () => {
    cy.mount(Card, { slots: { default: '<div id="card-content">content</div>' } });
    cy.get('.sd-card-body').should('not.have.class', 'sd-card-body-scroll');
    cy.get('.sd-card-body-scrollbar').should('not.exist');
  });
});
