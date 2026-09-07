import Grid, { GridItem } from '../index';

const { Row, Col } = Grid;

describe('Grid', () => {
  it('should render Col children inside Row', () => {
    cy.mount(Row, { slots: { default: [Col, Col, Col] } });
    cy.get('.sd-col').should('have.length', 3);
  });

  it('should render Col text content', () => {
    cy.mount(Col, { slots: { default: `<div class="text">abc</div>` } });
    cy.get('.text').should('contain.text', 'abc');
  });

  it('should apply base span, offset, and order styles', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row style="width: 960px">
          <Col :span="24" data-testid="full-width" />
          <Col :span="6" :offset="6" :order="2" data-testid="configured" />
        </Row>
      `,
    });

    cy.get('[data-testid="full-width"]').should('have.css', 'width', '960px');
    cy.get('[data-testid="configured"]')
      .should('have.css', 'width', '240px')
      .and('have.css', 'margin-left', '240px')
      .and('have.css', 'order', '2');
  });

  it('renders a css grid with cols and gaps', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="3" :row-gap="16" :col-gap="8" style="width: 900px">
          <GridItem v-for="i in 3" :key="i" class="cell">cell</GridItem>
        </Grid>
      `,
    });

    cy.get('.sd-grid')
      .should('have.attr', 'style')
      .and('include', 'grid-template-columns:repeat(3, minmax(0px, 1fr))')
      .and('include', 'gap:16px 8px');
  });

  it('applies default span of 1 and explicit span to GridItem', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="4">
          <GridItem class="default-item">a</GridItem>
          <GridItem :span="2" class="span-item">b</GridItem>
        </Grid>
      `,
    });

    cy.get('.default-item').should('have.css', 'grid-column-start', 'span 1');
    cy.get('.span-item').should('have.css', 'grid-column-start', 'span 2');
  });

  it('indents GridItem by offset via margin-left', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="3" style="width: 900px">
          <GridItem :span="1" :offset="1" class="cell">a</GridItem>
        </Grid>
      `,
    });

    // resolveItemData inflates span to span + offset (2 here), so the item's
    // grid area is 2 columns wide (600px) and margin-left = 600px * 1/2 = 300px.
    cy.get('.cell').should('have.css', 'margin-left', '300px');
  });

  it('pins suffix GridItem to the last column', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="4">
          <GridItem class="cell">a</GridItem>
          <GridItem class="cell">b</GridItem>
          <GridItem suffix class="suffix-item">s</GridItem>
        </Grid>
      `,
    });

    cy.get('.suffix-item').should('have.css', 'grid-column-start', '4');
  });

  it('hides items beyond collapsed rows and reports overflow through the suffix slot', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="4" collapsed>
          <GridItem v-for="i in 4" :key="i" class="cell" />
          <GridItem suffix #default="{ overflow }">
            <span class="overflow-flag">{{ overflow ? 'yes' : 'no' }}</span>
          </GridItem>
        </Grid>
      `,
    });

    cy.get('.cell').should('have.length', 4);
    cy.get('.cell').eq(3).should('have.css', 'display', 'none');
    cy.get('.cell').eq(2).should('have.css', 'display', 'block');
    cy.get('.overflow-flag').should('have.text', 'yes');
  });

  it('shows all items when they fit within collapsed rows', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="4" collapsed :collapsed-rows="2">
          <GridItem v-for="i in 5" :key="i" class="cell" />
          <GridItem suffix #default="{ overflow }">
            <span class="overflow-flag">{{ overflow ? 'yes' : 'no' }}</span>
          </GridItem>
        </Grid>
      `,
    });

    cy.get('.cell').should(($cells) => {
      $cells.each((_i, cell) => {
        expect(getComputedStyle(cell).display).to.equal('block');
      });
    });
    cy.get('.overflow-flag').should('have.text', 'no');
  });

  it('hides GridItem with span 0', () => {
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="4">
          <GridItem :span="0" class="cell" />
        </Grid>
      `,
    });

    cy.get('.cell').should('have.css', 'display', 'none');
  });

  it('resolves responsive cols at xs viewport', () => {
    cy.viewport(500, 660);
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="{ xs: 2, md: 4 }">
          <GridItem v-for="i in 2" :key="i" class="cell">cell</GridItem>
        </Grid>
      `,
    });

    cy.get('.sd-grid').should('have.attr', 'style').and('include', 'repeat(2, minmax(0px, 1fr))');
  });

  it('resolves responsive cols at md viewport', () => {
    cy.viewport(800, 660);
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="{ xs: 2, md: 4 }">
          <GridItem v-for="i in 2" :key="i" class="cell">cell</GridItem>
        </Grid>
      `,
    });

    cy.get('.sd-grid').should('have.attr', 'style').and('include', 'repeat(4, minmax(0px, 1fr))');
  });

  it('resolves responsive span on GridItem', () => {
    cy.viewport(800, 660);
    cy.mount({
      components: { Grid, GridItem },
      template: `
        <Grid :cols="4">
          <GridItem :span="{ xs: 1, md: 3 }" class="cell" />
        </Grid>
      `,
    });

    cy.get('.cell').should('have.css', 'grid-column-start', 'span 3');
  });

  it('applies number gutter as negative Row margins and half Col paddings', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row :gutter="16" style="width: 960px">
          <Col :span="8" class="cell">a</Col>
          <Col :span="8" class="cell">b</Col>
        </Row>
      `,
    });

    cy.get('.sd-row')
      .should('have.css', 'margin-left', '-8px')
      .and('have.css', 'margin-right', '-8px');
    cy.get('.cell')
      .first()
      .should('have.css', 'padding-left', '8px')
      .and('have.css', 'padding-right', '8px');
  });

  it('applies array gutter as horizontal and vertical spacing', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row :gutter="[16, 24]" style="width: 960px">
          <Col :span="8" class="cell">a</Col>
          <Col :span="8" class="cell">b</Col>
        </Row>
      `,
    });

    cy.get('.sd-row')
      .should('have.css', 'margin-left', '-8px')
      .and('have.css', 'margin-right', '-8px')
      .and('have.css', 'margin-top', '-12px')
      .and('have.css', 'margin-bottom', '-12px');
    cy.get('.cell')
      .first()
      .should('have.css', 'padding-left', '8px')
      .and('have.css', 'padding-top', '12px');
  });

  it('resolves responsive gutter at xs viewport', () => {
    cy.viewport(500, 660);
    cy.mount({
      components: { Row, Col },
      template: `
        <Row :gutter="{ xs: 8, md: 16 }" style="width: 960px">
          <Col :span="8" class="cell">a</Col>
        </Row>
      `,
    });

    cy.get('.sd-row').should('have.css', 'margin-left', '-4px');
    cy.get('.cell').should('have.css', 'padding-left', '4px');
  });

  it('applies justify and align classes to Row', () => {
    cy.mount(Row, { props: { justify: 'center', align: 'center' } });

    cy.get('.sd-row')
      .should('have.class', 'sd-row-justify-center')
      .and('have.class', 'sd-row-align-center');
  });

  it('adds nowrap class when wrap is false', () => {
    cy.mount(Row, { props: { wrap: false } });

    cy.get('.sd-row').should('have.class', 'sd-row-nowrap');
  });

  it('renders Row and Col as plain divs when div is set', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row div>
          <Col :span="12" class="plain">x</Col>
        </Row>
      `,
    });

    cy.get('.sd-row').should('not.exist');
    cy.get('.sd-col').should('not.exist');
    cy.get('.plain').should('exist');
  });

  it('applies md responsive span, offset, and order classes to Col', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row>
          <Col :md="{ span: 8, offset: 4, order: 3 }" class="cell" />
        </Row>
      `,
    });

    cy.get('.cell')
      .should('have.class', 'sd-col-md-8')
      .and('have.class', 'sd-col-md-offset-4')
      .and('have.class', 'sd-col-md-order-3')
      .and('not.have.class', 'sd-col-24');
  });

  it('applies numeric xs span class to Col', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row>
          <Col :span="24" :xs="12" class="cell" />
        </Row>
      `,
    });

    cy.get('.cell').should('have.class', 'sd-col-xs-12').and('not.have.class', 'sd-col-24');
  });

  it('removes Col from the DOM when responsive span resolves to 0', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row>
          <Col :xs="{ span: 0 }" class="hidden-cell" />
          <Col :xs="12" class="visible-cell" />
        </Row>
      `,
    });

    cy.get('.hidden-cell').should('not.exist');
    cy.get('.visible-cell').should('exist');
  });

  it('applies allowable flex values to Col and drops span classes', () => {
    cy.mount({
      components: { Row, Col },
      template: `
        <Row>
          <Col flex="200px" class="flex-cell" />
          <Col flex="auto" class="auto-cell" />
        </Row>
      `,
    });

    cy.get('.flex-cell').should('have.css', 'flex', '0 0 200px').and('not.have.class', 'sd-col-24');
    cy.get('.auto-cell').should('have.css', 'flex-grow', '1').and('have.css', 'flex-basis', 'auto');
  });
});
