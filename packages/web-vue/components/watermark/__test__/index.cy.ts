import Watermark from '../index';

const flushMutations = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const layerOf = ($container: JQuery<HTMLElement>) => $container[0].lastElementChild as HTMLElement;

describe('Watermark', () => {
  it('renders a relative container with the slotted content and forwarded attrs', () => {
    cy.mount(Watermark, {
      slots: { default: '<div class="wm-content">Body</div>' },
      attrs: { 'data-test': 'wm' },
    });
    cy.get('.sd-watermark').should('have.attr', 'data-test', 'wm');
    cy.get('.sd-watermark .wm-content').should('have.text', 'Body');
    cy.get('.sd-watermark').then(($container) => {
      const el = $container[0];
      expect(el.style.position).to.equal('relative');
      expect(el.style.overflow).to.equal('hidden');
    });
  });

  it('appends a non-interactive layer with background image and z-index', () => {
    cy.mount(Watermark, { props: { content: 'SD Design', zIndex: 10 } });
    cy.get('.sd-watermark').should(($container) => {
      const layer = layerOf($container);
      expect(layer.style.pointerEvents).to.equal('none');
      expect(layer.style.zIndex).to.equal('10');
      expect(layer.style.backgroundImage.includes('data:image/png')).to.equal(true);
      expect(layer.style.backgroundRepeat).to.equal('repeat');
      // a single-value background-size is serialized as "<N>px auto" by CSSOM
      expect(layer.style.backgroundSize).to.match(/^\d+(\.\d+)?px/);
    });
  });

  it('offsets the layer by offset minus half the gap', () => {
    cy.mount(Watermark, { props: { content: 'SD', offset: [80, 80] } });
    cy.get('.sd-watermark').then(($container) => {
      const layer = layerOf($container);
      expect(layer.style.left).to.equal('35px');
      expect(layer.style.top).to.equal('35px');
      expect(layer.style.width).to.equal('calc(100% - 35px)');
      expect(layer.style.height).to.equal('calc(100% - 35px)');
      expect(layer.style.backgroundPosition).to.equal('0px 0px');
    });
  });

  it('doubles the background tile size when staggered (default)', () => {
    cy.mount(Watermark, { props: { content: 'SD', width: 100, gap: [10, 20] } });
    cy.get('.sd-watermark').should(($container) => {
      const layer = layerOf($container);
      expect(layer.style.backgroundSize).to.match(/^220px/);
    });
  });

  it('uses a single tile size when staggered is false', () => {
    cy.mount(Watermark, {
      props: { content: 'SD', width: 100, gap: [10, 20], staggered: false },
    });
    cy.get('.sd-watermark').should(($container) => {
      const layer = layerOf($container);
      expect(layer.style.backgroundSize).to.match(/^110px/);
    });
  });

  it('does not repeat the watermark when repeat is false', () => {
    cy.mount(Watermark, {
      props: { content: 'SD', width: 100, gap: [10, 20], repeat: false },
    });
    cy.get('.sd-watermark').should(($container) => {
      const layer = layerOf($container);
      expect(layer.style.backgroundRepeat).to.equal('no-repeat');
      expect(layer.style.backgroundSize).to.match(/^110px/);
    });
  });

  it('draws multi-line content', () => {
    cy.mount(Watermark, { props: { content: ['SD', 'Design'] } });
    cy.get('.sd-watermark').then(($container) => {
      const layer = layerOf($container);
      expect(layer.style.backgroundImage.startsWith('url("data:image/png')).to.equal(true);
    });
  });

  it('redraws the layer when props change', () => {
    let layerBefore: HTMLElement | undefined;
    cy.mount(Watermark, { props: { content: 'A' } });
    cy.get('.sd-watermark').then(($container) => {
      layerBefore = layerOf($container);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ content: 'B' }));
    cy.get('.sd-watermark').should(($container) => {
      expect(layerOf($container)).to.not.equal(layerBefore);
    });
  });

  it('re-creates the layer after it is removed (anti-tamper)', () => {
    cy.mount(Watermark, { props: { content: 'SD' } });
    cy.get('.sd-watermark').then(async ($container) => {
      const container = $container[0];
      const removed = container.lastElementChild as HTMLElement;
      removed.remove();
      await flushMutations();
      // the anti-tamper observer re-appends a fresh layer element
      expect(container.lastElementChild, 'layer re-created after removal').to.not.equal(null);
      const layer = container.lastElementChild as HTMLElement;
      expect(layer).to.not.equal(removed);
      expect(layer.style.pointerEvents).to.equal('none');
      expect(layer.style.backgroundImage.includes('data:image/png')).to.equal(true);
    });
  });

  it('restores the layer when its style attribute is tampered with', () => {
    cy.mount(Watermark, { props: { content: 'SD' } });
    cy.get('.sd-watermark').then(async ($container) => {
      const container = $container[0];
      const tampered = container.lastElementChild as HTMLElement;
      tampered.style.setProperty('display', 'none');
      await flushMutations();
      // a tampered style attribute is rolled back by re-drawing a fresh layer
      expect(container.lastElementChild, 'layer re-created after style tamper').to.not.equal(null);
      const layer = container.lastElementChild as HTMLElement;
      expect(layer).to.not.equal(tampered);
      expect(layer.style.display).to.not.equal('none');
      expect(layer.style.pointerEvents).to.equal('none');
    });
  });

  it('does not redraw when unrelated slot content mutates', () => {
    let layerBefore: HTMLElement | undefined;
    cy.mount(Watermark, { slots: { default: '<div class="wm-content">Body</div>' } });
    cy.get('.sd-watermark').then(async ($container) => {
      const container = $container[0];
      layerBefore = layerOf($container);
      const content = container.querySelector('.wm-content') as HTMLElement;
      content.appendChild(document.createElement('span'));
      await flushMutations();
      expect(layerOf($container)).to.equal(layerBefore);
    });
  });

  it('keeps the layer removed when antiTamper is false', () => {
    cy.mount(Watermark, { props: { content: 'SD', antiTamper: false } });
    cy.get('.sd-watermark').then(async ($container) => {
      const container = $container[0];
      layerOf($container).remove();
      await flushMutations();
      expect(container.childElementCount).to.equal(0);
    });
  });

  it('redraws the layer when the body theme attribute changes', () => {
    let layerBefore: HTMLElement | undefined;
    cy.mount(Watermark, { props: { content: 'SD' } });
    cy.get('.sd-watermark').then(($container) => {
      layerBefore = layerOf($container);
      document.body.setAttribute('sd-theme', 'dark');
    });
    cy.get('.sd-watermark').then(async ($container) => {
      await flushMutations();
      expect(layerOf($container)).to.not.equal(layerBefore);
      document.body.removeAttribute('sd-theme');
      await flushMutations();
    });
  });

  it('draws an image watermark from a data URI source', () => {
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    cy.mount(Watermark, { props: { image: png, width: 20, height: 20 } });
    cy.get('.sd-watermark').should(($container) => {
      const layer = layerOf($container);
      expect(layer.style.backgroundImage.indexOf('data:image/png') >= 0).to.equal(true);
    });
  });

  it('measures mark size with the full font shorthand (bold is not clipped)', () => {
    let normalTile = 0;
    let boldTile = 0;
    cy.mount(Watermark, { props: { content: 'SD Design' } });
    cy.get('.sd-watermark').then(($container) => {
      normalTile = Number.parseFloat(layerOf($container).style.backgroundSize);
    });
    cy.mount(Watermark, { props: { content: 'SD Design', font: { fontWeight: 'bold' } } });
    cy.get('.sd-watermark').then(($container) => {
      boldTile = Number.parseFloat(layerOf($container).style.backgroundSize);
    });
    cy.then(() => {
      expect(boldTile).to.be.greaterThan(normalTile);
    });
  });

  it('falls back to the untinted layer when grayscale getImageData throws', () => {
    // 跨域未带 CORS 头的图片会污染 canvas；灰阶处理失败时应仍渲染未灰阶图层
    cy.window().then((win) => {
      cy.stub(win.CanvasRenderingContext2D.prototype, 'getImageData').throws(
        new Error('SecurityError'),
      );
    });
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    cy.mount(Watermark, { props: { image: png, width: 20, height: 20, grayscale: true } });
    cy.get('.sd-watermark').should(($container) => {
      const layer = layerOf($container);
      expect(layer.style.backgroundImage.indexOf('data:image/png') >= 0).to.equal(true);
    });
  });
});
