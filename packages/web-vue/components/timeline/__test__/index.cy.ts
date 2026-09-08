import Timeline from '../index';

const { Item } = Timeline;

describe('Timeline', () => {
  it('applies the reverse class', () => {
    cy.mount(Timeline, { props: { reverse: true } });
    cy.get('.sd-timeline').should('have.class', 'sd-timeline-is-reverse');
  });

  it('renders timeline items', () => {
    cy.mount(Timeline, {
      global: { components: { TimelineItem: Item } },
      slots: { default: '<timeline-item>1</timeline-item><timeline-item>2</timeline-item>' },
    });
    cy.get('.sd-timeline-item').should('have.length', 2);
  });

  it('passes spinProps to the pending node', () => {
    cy.mount(Timeline, {
      props: { pending: true, spinProps: { dot: true, tip: '等待中' } },
      global: { components: { TimelineItem: Item } },
      slots: { default: '<timeline-item>1</timeline-item>' },
    });
    cy.get('.sd-dot-loading').should('exist');
    cy.get('.sd-spin-tip').should('have.text', '等待中');
  });

  it('applies dot type and dot color', () => {
    cy.mount(Item, { props: { label: 'hello world', dotColor: 'rgb(10, 180, 42)' } });
    cy.get('.sd-timeline-item-dot')
      .invoke('attr', 'style')
      .should('contain', 'background-color: rgb(10, 180, 42)');
  });

  it('applies mode and direction classes', () => {
    cy.mount(Timeline, { props: { mode: 'right', direction: 'horizontal' } });
    cy.get('.sd-timeline').should('have.class', 'sd-timeline-right');
    cy.get('.sd-timeline').should('have.class', 'sd-timeline-direction-horizontal');
  });

  it('alternates item positions and honors an explicit position override', () => {
    cy.mount(Timeline, {
      props: { mode: 'alternate' },
      global: { components: { TimelineItem: Item } },
      slots: {
        default:
          '<timeline-item>1</timeline-item><timeline-item>2</timeline-item><timeline-item position="right">3</timeline-item>',
      },
    });
    cy.get('.sd-timeline-item').eq(0).should('have.class', 'sd-timeline-item-vertical-left');
    cy.get('.sd-timeline-item').eq(1).should('have.class', 'sd-timeline-item-vertical-right');
    cy.get('.sd-timeline-item').eq(2).should('have.class', 'sd-timeline-item-vertical-right');
  });

  it('places horizontal items on the top position when mode is left', () => {
    cy.mount(Timeline, {
      props: { direction: 'horizontal' },
      global: { components: { TimelineItem: Item } },
      slots: { default: '<timeline-item>1</timeline-item><timeline-item>2</timeline-item>' },
    });
    cy.get('.sd-timeline-item').should('have.class', 'sd-timeline-item-horizontal-top');
  });

  it('marks only the last item as last, and shifts the marker when reversed', () => {
    cy.mount(Timeline, {
      global: { components: { TimelineItem: Item } },
      slots: {
        default:
          '<timeline-item>1</timeline-item><timeline-item>2</timeline-item><timeline-item>3</timeline-item>',
      },
    });
    cy.get('.sd-timeline-item').eq(0).should('not.have.class', 'sd-timeline-item-last');
    cy.get('.sd-timeline-item').eq(2).should('have.class', 'sd-timeline-item-last');

    cy.mount(Timeline, {
      props: { reverse: true },
      global: { components: { TimelineItem: Item } },
      slots: {
        default:
          '<timeline-item>1</timeline-item><timeline-item>2</timeline-item><timeline-item>3</timeline-item>',
      },
    });
    cy.get('.sd-timeline-item').eq(0).should('have.class', 'sd-timeline-item-last');
    cy.get('.sd-timeline-item').eq(2).should('not.have.class', 'sd-timeline-item-last');
  });

  it('renders the pending node with a dashed line and marks it as last', () => {
    cy.mount(Timeline, {
      props: { pending: '加载中' },
      global: { components: { TimelineItem: Item } },
      slots: { default: '<timeline-item>1</timeline-item><timeline-item>2</timeline-item>' },
    });
    cy.get('.sd-timeline-item').should('have.length', 3);
    cy.get('.sd-timeline-item').eq(1).should('not.have.class', 'sd-timeline-item-last');
    cy.get('.sd-timeline-item').eq(2).should('have.class', 'sd-timeline-item-last');
    cy.get('.sd-timeline-item').eq(2).should('contain', '加载中');
    cy.get('.sd-timeline-item')
      .eq(2)
      .find('.sd-timeline-item-dot-line')
      .invoke('attr', 'style')
      .should('contain', 'dashed');
  });

  it('uses the timeline dot slot for the pending node dot', () => {
    cy.mount(Timeline, {
      props: { pending: true },
      global: { components: { TimelineItem: Item } },
      slots: {
        default: '<timeline-item>1</timeline-item>',
        dot: '<span class="ghost-dot">G</span>',
      },
    });
    cy.get('.sd-timeline-item-dot-custom').find('.ghost-dot').should('exist');
    cy.get('.sd-dot-loading').should('not.exist');
  });

  it('renders the ghost node when only the pending slot is provided', () => {
    cy.mount(Timeline, {
      global: { components: { TimelineItem: Item } },
      slots: {
        default: '<timeline-item>1</timeline-item>',
        pending: '<div class="ghost-content">加载中</div>',
      },
    });
    cy.get('.sd-timeline-item').should('have.length', 2);
    cy.get('.sd-timeline-item').eq(1).should('have.class', 'sd-timeline-item-last');
    cy.get('.sd-timeline-item').eq(1).find('.ghost-content').should('have.text', '加载中');
  });

  it('prefers the pending slot content over the pending prop text', () => {
    cy.mount(Timeline, {
      props: { pending: '正在加载' },
      global: { components: { TimelineItem: Item } },
      slots: {
        default: '<timeline-item>1</timeline-item>',
        pending: '<div class="ghost-content">自定义加载中</div>',
      },
    });
    cy.get('.sd-timeline-item').eq(1).find('.ghost-content').should('have.text', '自定义加载中');
    cy.get('.sd-timeline-item').eq(1).should('not.contain', '正在加载');
  });

  it('renders labels inside the content wrapper by default and outside when relative', () => {
    cy.mount(Timeline, {
      global: { components: { TimelineItem: Item } },
      slots: {
        default:
          '<timeline-item label="L1">1</timeline-item><timeline-item label="L2">2</timeline-item>',
      },
    });
    cy.get('.sd-timeline-item-content-wrapper')
      .find('.sd-timeline-item-label')
      .should('have.length', 2);
    cy.get('.sd-timeline-item-content-wrapper')
      .find('.sd-timeline-item-label')
      .eq(0)
      .should('have.text', 'L1');

    cy.mount(Timeline, {
      props: { labelPosition: 'relative' },
      global: { components: { TimelineItem: Item } },
      slots: {
        default:
          '<timeline-item label="L1">1</timeline-item><timeline-item label="L2">2</timeline-item>',
      },
    });
    cy.get('.sd-timeline-item-content-wrapper').find('.sd-timeline-item-label').should('not.exist');
    cy.get('.sd-timeline-item').children('.sd-timeline-item-label').should('have.length', 2);
  });

  it('supports the label slot on an item', () => {
    cy.mount(Item, {
      props: { label: 'plain' },
      slots: { label: '<b class="custom-label">自定义标签</b>' },
    });
    cy.get('.sd-timeline-item-label').find('.custom-label').should('exist');
    cy.get('.sd-timeline-item-label').should('not.contain', 'plain');
  });

  it('applies the hollow dot type and border color', () => {
    cy.mount(Item, { props: { dotType: 'hollow', dotColor: 'rgb(10, 180, 42)' } });
    cy.get('.sd-timeline-item-dot-hollow').should('exist');
    cy.get('.sd-timeline-item-dot')
      .invoke('attr', 'style')
      .should('contain', 'border-color: rgb(10, 180, 42)');
  });

  it('applies line type and line color to the dot line', () => {
    cy.mount(Item, { props: { lineType: 'dashed', lineColor: 'rgb(255, 0, 0)' } });
    cy.get('.sd-timeline-item-dot-line')
      .invoke('attr', 'style')
      .should('contain', 'border-left-style: dashed')
      .should('contain', 'border-color: rgb(255, 0, 0)');
  });

  it('renders a custom dot slot instead of the built-in dot', () => {
    cy.mount(Item, { slots: { dot: '<span class="custom-dot">D</span>' } });
    cy.get('.sd-timeline-item-dot-custom').find('.custom-dot').should('exist');
    cy.get('.sd-timeline-item-dot').should('not.exist');
  });
});
