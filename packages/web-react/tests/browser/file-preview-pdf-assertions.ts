export function expectPdfCanvasPixel(expected: readonly number[]) {
  cy.get('canvas').should(($canvas) => {
    const canvas = $canvas[0] as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    expect(context, 'canvas 2D context').not.to.equal(null);
    const pixel = context!.getImageData(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1,
    ).data;
    expect(Array.from(pixel), 'painted PDF page center').to.deep.equal(expected);
  });
}
