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

  it('applies dot type and dot color', () => {
    cy.mount(Item, { props: { label: 'hello world', dotColor: 'rgb(10, 180, 42)' } });
    cy.get('.sd-timeline-item-dot')
      .invoke('attr', 'style')
      .should('contain', 'background-color: rgb(10, 180, 42)');
  });
});
