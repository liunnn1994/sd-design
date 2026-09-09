import FilePreviewer from '../index';

function silentWav() {
  const samples = 8000;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++)
      view.setUint8(offset + index, value.charCodeAt(index));
  };
  text(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

describe('FilePreviewer real media lifecycle', () => {
  let src: string;
  beforeEach(() => {
    src = silentWav();
  });
  afterEach(() => {
    URL.revokeObjectURL(src);
  });

  for (const type of ['audio', 'video'] as const) {
    it(`loads and plays a WAV stream in ${type}, then stops on close`, () => {
      let media: HTMLMediaElement;
      const onLoadedData = cy.spy().as('loaded');
      cy.mount(FilePreviewer, {
        props: {
          type,
          src,
          defaultVisible: true,
          mediaProps: { skin: 'native', muted: true, loop: true, onLoadedData },
        },
      });
      cy.get(type)
        .should(($media) => {
          expect(($media[0] as HTMLMediaElement).readyState).to.be.at.least(2);
        })
        .then(($media) => {
          media = $media[0] as HTMLMediaElement;
          return media.play();
        });
      cy.get('@loaded').should('have.been.calledOnce');
      cy.get('.sd-file-previewer-loading').should('not.exist');
      cy.get(type).should(() => {
        expect(media.paused).to.equal(false);
        expect(media.currentTime).to.be.greaterThan(0);
      });
      cy.get('.sd-file-previewer-close-btn').click();
      cy.get(type).should('not.exist');
      cy.wrap(null).should(() => {
        expect(media.paused).to.equal(true);
      });
    });
  }
});
