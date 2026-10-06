import Watermark from '../index';

describe('Watermark staggered opacity', () => {
  it('keeps both copies at the requested opacity', () => {
    cy.mount(Watermark, {
      props: {
        content: 'SD',
        width: 100,
        height: 40,
        gap: [20, 20],
        rotate: 0,
        alpha: 0.5,
        font: { color: '#000', fontSize: 24 },
      },
    });
    cy.get('.sd-watermark').then(async ($container) => {
      const layer = $container[0].lastElementChild as HTMLElement;
      const img = new Image();
      img.src = layer.style.backgroundImage.slice(5, -2);
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;
      const maxAlpha = (x: number, y: number) => {
        const { data } = ctx.getImageData(x, y, halfWidth, halfHeight);
        let max = 0;
        for (let i = 3; i < data.length; i += 4) max = Math.max(max, data[i]);
        return max;
      };
      const first = maxAlpha(0, 0);
      expect(first).to.be.within(127, 128);
      expect(maxAlpha(halfWidth, halfHeight)).to.equal(first);
    });
  });
});
