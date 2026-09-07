import { defineComponent, h } from 'vue';

import QrCode from '../index';

const value = 'https://sd-design.js.org';

describe('QrCode', () => {
  it('uses a dark QR palette and dark status mask in dark theme', () => {
    cy.mount(
      defineComponent({
        components: { QrCode },
        data: () => ({ value }),
        template: `
          <div sd-theme="dark">
            <QrCode :value="value" type="svg" status="expired" />
          </div>
        `,
      }),
    );

    cy.get('.sd-qr-code')
      .should('have.css', 'background-color', 'rgb(35, 35, 36)')
      .find('.sd-qr-code-cover')
      .should(($cover) => {
        const backgroundColor = getComputedStyle($cover[0]).backgroundColor;
        expect(backgroundColor).to.contain('0.88');
        expect(backgroundColor).not.to.equal('rgba(255, 255, 255, 0.88)');
      });
    cy.get('.sd-qr-code-svg svg path').eq(0).should('have.attr', 'fill', '#232324');
    cy.get('.sd-qr-code-svg svg path').eq(1).should('have.attr', 'stroke', '#f6f6f6');
  });

  it('renders svg markup when type is svg', () => {
    cy.mount(QrCode, { props: { value, type: 'svg' } });
    cy.get('.sd-qr-code-svg').should('exist');
  });

  it('renders the icon slot without an icon prop', () => {
    cy.mount(QrCode, {
      props: { value },
      slots: { icon: '<span class="custom-icon">QR</span>' },
    });
    cy.get('.sd-qr-code-icon .custom-icon').should('exist');
  });

  it('emits refresh when the expired action is clicked', () => {
    cy.mount(QrCode, { props: { value, status: 'expired' } });
    cy.get('.sd-qr-code-refresh-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('refresh')).to.have.length(1);
    });
  });

  it('supports a custom status render', () => {
    cy.mount(QrCode, {
      props: {
        value,
        status: 'scanned',
        statusRender: ({ status }: { status: string }) =>
          h('span', { class: 'custom-status' }, status),
      },
    });
    cy.get('.custom-status').should('have.text', 'scanned');
  });

  it('passes spinProps to the loading spin', () => {
    cy.mount(QrCode, {
      props: { value, status: 'loading', spinProps: { size: 10, dot: true } },
    });
    cy.get('.sd-spin-icon').invoke('attr', 'style').should('contain', 'font-size: 10px');
    cy.get('.sd-dot-loading').invoke('attr', 'style').should('contain', 'width: 70px');
  });

  it('renders nothing when value is empty', () => {
    cy.mount(QrCode, { props: { value: '' } });
    cy.get('.sd-qr-code').should('not.exist');
  });

  it('renders a canvas by default with img role and value in the accessible name', () => {
    cy.mount(QrCode, { props: { value } });
    cy.get('.sd-qr-code-canvas')
      .should('have.attr', 'role', 'img')
      .and('have.attr', 'width', '160')
      .and(($canvas) => {
        const label = $canvas[0].getAttribute('aria-label');
        expect(label).to.contain(value);
      });
  });

  it('applies size, borderless class and bgColor to the root', () => {
    cy.mount(QrCode, {
      props: { value, size: 200, bordered: false, bgColor: '#fffbfb' },
    });
    cy.get('.sd-qr-code')
      .should('have.css', 'width', '200px')
      .and('have.css', 'height', '200px')
      .and('have.class', 'sd-qr-code-borderless')
      .and('have.css', 'background-color', 'rgb(255, 251, 251)');
  });

  it('applies color and bgColor to the svg output', () => {
    cy.mount(QrCode, {
      props: { value, type: 'svg', color: '#0b8457', bgColor: '#fffbfb' },
    });
    cy.get('.sd-qr-code-svg svg path').eq(0).should('have.attr', 'fill', '#fffbfb');
    cy.get('.sd-qr-code-svg svg path').eq(1).should('have.attr', 'stroke', '#0b8457');
  });

  it('joins array values with newlines in the accessible name', () => {
    cy.mount(QrCode, {
      props: { value: ['https://a.example', 'https://b.example'], type: 'svg' },
    });
    cy.get('.sd-qr-code-svg').should(($el) => {
      const label = $el[0].getAttribute('aria-label');
      expect(label).to.contain('https://a.example');
      expect(label).to.contain('https://b.example');
    });
  });

  it('applies marginSize to the quiet zone', () => {
    cy.mount(QrCode, { props: { value, type: 'svg', marginSize: 10 } });
    cy.get('.sd-qr-code-svg svg').should(($svg) => {
      const viewBox = $svg[0].getAttribute('viewBox') ?? '';
      const moduleCount = Number(viewBox.split(' ')[2]);
      expect(moduleCount).to.be.greaterThan(30);
    });
  });

  it('renders the icon prop with custom iconSize', () => {
    cy.mount(QrCode, {
      props: {
        value,
        icon: '/logo.png',
        iconAlt: 'logo',
        iconSize: { width: 24, height: 36 },
      },
    });
    cy.get('.sd-qr-code-icon img')
      .should('have.attr', 'src', '/logo.png')
      .and('have.attr', 'alt', 'logo')
      .and('have.css', 'width', '24px')
      .and('have.css', 'height', '36px');
  });

  it('exposes the status overlay as a live region in loading state', () => {
    cy.mount(QrCode, { props: { value, status: 'loading' } });
    cy.get('.sd-qr-code-cover').should('exist');
    cy.get('.sd-qr-code-status')
      .should('have.attr', 'role', 'status')
      .and('have.attr', 'aria-live', 'polite');
    cy.get('.sd-spin-icon').should('exist');
  });

  it('supports the status slot with scoped status and onRefresh', () => {
    cy.mount(
      defineComponent({
        components: { QrCode },
        data: () => ({ value }),
        template: `
          <QrCode :value="value" status="expired" @refresh="$emit('refresh')">
            <template #status="{ status, onRefresh }">
              <span class="slot-status">{{ status }}</span>
              <button class="slot-refresh" @click="onRefresh">refresh</button>
            </template>
          </QrCode>
        `,
      }),
    );
    cy.get('.slot-status').should('have.text', 'expired');
    cy.get('.slot-refresh').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('refresh') ?? [];
      expect(events.length).to.equal(1);
    });
  });

  it('re-renders the accessible name when the value changes', () => {
    cy.mount(
      defineComponent({
        components: { QrCode },
        data: () => ({ value }),
        template: `
          <div>
            <button @click="value = 'https://changed.example'">change</button>
            <QrCode :value="value" type="svg" />
          </div>
        `,
      }),
    );
    cy.get('.sd-qr-code-svg').should(($el) => {
      const label = $el[0].getAttribute('aria-label');
      expect(label).to.contain(value);
    });
    cy.get('button').click();
    cy.get('.sd-qr-code-svg').should(($el) => {
      const label = $el[0].getAttribute('aria-label');
      expect(label).to.contain('https://changed.example');
    });
  });
});
