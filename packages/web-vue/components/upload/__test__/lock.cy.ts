import type { FileItem, RequestOption } from '../interfaces';

import Upload from '../index';

const select = (fileName = 'a.txt') =>
  cy
    .get('input[type=file]')
    .selectFile({ contents: Cypress.Buffer.from('content'), fileName }, { force: true });

describe('Upload cross-tab locks', () => {
  let peer: Window;
  let releasePeer: (() => void) | undefined;
  let key: string;

  beforeEach(() => {
    key = `test-${crypto.randomUUID()}`;
    cy.window().then((win) => {
      peer = win.open('about:blank', '_blank')!;
      expect(peer, 'second browser tab').not.to.equal(null);
    });
  });

  afterEach(() => {
    releasePeer?.();
    releasePeer = undefined;
    peer?.close();
  });

  const holdInPeer = () =>
    cy.then(
      () =>
        new Promise<void>((acquired) => {
          void peer.navigator.locks.request(`sd-upload:${key}`, () => {
            const held = new Promise<void>((resolve) => {
              releasePeer = resolve;
            });
            acquired();
            return held;
          });
        }),
    );

  const expectPeerCanAcquire = (available: boolean) =>
    cy.then(() =>
      peer.navigator.locks.request(
        `sd-upload:${key}`,
        available ? { signal: AbortSignal.timeout(2000) } : { ifAvailable: true },
        (lock) => {
          expect(Boolean(lock)).to.equal(available);
        },
      ),
    );

  it('rejects an occupied key without sending or queueing a request, then permits retry', () => {
    const requests: RequestOption[] = [];
    cy.mount(Upload, {
      props: {
        lockKey: key,
        customRequest: (option: RequestOption) => {
          requests.push(option);
          return {};
        },
      },
    });
    holdInPeer();
    select();
    cy.get('.sd-upload-list-item-error').should('exist');
    cy.get('@vue').then(({ wrapper }) => {
      expect(requests).to.have.length(0);
      const file = wrapper.emitted('error')?.[0]?.[0] as FileItem;
      expect(file.response).to.have.property('code', 'UPLOAD_LOCK_BUSY');
      releasePeer?.();
    });
    expectPeerCanAcquire(true);
    cy.then(() => {
      expect(requests).to.have.length(0);
    });
    cy.get('.sd-upload-icon-upload').click();
    cy.wrap(requests).should('have.length', 1);
    expectPeerCanAcquire(false);
    cy.then(() => requests[0].onSuccess('ok'));
    expectPeerCanAcquire(true);
  });

  for (const end of ['success', 'error', 'cancel', 'remove', 'controlled', 'unmount'] as const) {
    it(`holds the lock until ${end} and then releases it`, () => {
      let request!: RequestOption;
      const abort = Cypress.sinon.spy();
      cy.mount(Upload, {
        props: {
          lockKey: key,
          customRequest: (option: RequestOption) => {
            request = option;
            return { abort };
          },
        },
      });
      select();
      cy.get('@vue').should(() => {
        expect(request).not.to.equal(undefined);
      });
      expectPeerCanAcquire(false);
      if (end === 'cancel') cy.get('.sd-upload-icon-cancel').click();
      if (end === 'remove') cy.get('.sd-upload-list-item-operation [role=button]').click();
      cy.get('@vue').then(async ({ wrapper }) => {
        if (end === 'success') request.onSuccess('ok');
        if (end === 'error') request.onError('failed');
        if (end === 'controlled') await wrapper.setProps({ fileList: [] });
        if (end === 'unmount') wrapper.unmount();
        expect(abort.callCount).to.equal(end === 'success' || end === 'error' ? 0 : 1);
      });
      expectPeerCanAcquire(true);
    });
  }

  it('allows different resolved keys to upload concurrently', () => {
    const requests: RequestOption[] = [];
    cy.mount(Upload, {
      props: {
        lockKey: (file: FileItem) => `${key}:${file.name}`,
        customRequest: (option: RequestOption) => {
          requests.push(option);
          return {};
        },
      },
    });
    select();
    select('b.txt');
    cy.wrap(requests).should('have.length', 2);
    cy.then(() => requests.forEach((request) => request.onSuccess()));
  });

  it('keeps the captured key when props change and releases synchronous requests', () => {
    let request!: RequestOption;
    cy.mount(Upload, {
      props: {
        lockKey: key,
        customRequest: (option: RequestOption) => {
          request = option;
          return {};
        },
      },
    });
    select();
    cy.get('@vue').should(() => {
      expect(request).not.to.equal(undefined);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ lockKey: `${key}:new` }));
    expectPeerCanAcquire(false);
    cy.then(() => request.onSuccess());
    expectPeerCanAcquire(true);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        lockKey: key,
        customRequest: (option: RequestOption) => {
          option.onSuccess();
          return {};
        },
      }),
    );
    select('b.txt');
    cy.get('.sd-upload-list-item-done').should('have.length', 2);
    expectPeerCanAcquire(true);
  });

  it('does not send the default XHR when another tab owns the key', () => {
    const sent = Cypress.sinon.spy();
    cy.intercept('POST', '/locked-upload', (req) => {
      sent();
      req.reply('ok');
    });
    cy.mount(Upload, { props: { lockKey: key, action: '/locked-upload' } });
    holdInPeer();
    select();
    cy.get('.sd-upload-list-item-error').should('exist');
    cy.then(() => {
      expect(sent.callCount).to.equal(0);
      releasePeer?.();
    });
    expectPeerCanAcquire(true);
    cy.get('.sd-upload-icon-upload').click();
    cy.get('.sd-upload-list-item-done').should('exist');
    cy.then(() => {
      expect(sent.callCount).to.equal(1);
    });
    expectPeerCanAcquire(true);
  });

  it('cancels before the lock callback without starting a request', () => {
    const request = Cypress.sinon.spy(() => ({}));
    cy.mount(Upload, { props: { lockKey: key, customRequest: request } });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.upload([new File(['content'], 'a.txt')]);
      const files = wrapper.emitted('update:fileList')?.at(-1)?.[0] as FileItem[];
      wrapper.vm.abort(files[0]);
    });
    expectPeerCanAcquire(true);
    cy.then(() => {
      expect(request.callCount).to.equal(0);
    });
  });

  it('releases the lock if customRequest throws', () => {
    cy.mount(Upload, {
      props: {
        lockKey: key,
        customRequest: () => {
          throw new Error('request failed');
        },
      },
    });
    select();
    cy.get('.sd-upload-list-item-error').should('exist');
    expectPeerCanAcquire(true);
  });

  it('fails explicitly when locks are unavailable but permits opt-out', () => {
    const request = Cypress.sinon.spy((option: RequestOption) => {
      option.onSuccess();
      return {};
    });
    cy.window().then((win) => {
      cy.stub(win.navigator, 'locks').get(() => undefined);
    });
    cy.mount(Upload, { props: { lockKey: key, customRequest: request } });
    select();
    cy.get('.sd-upload-list-item-error').should('exist');
    cy.get('@vue').then(({ wrapper }) => {
      expect(request.callCount).to.equal(0);
      const file = wrapper.emitted('error')?.[0]?.[0] as FileItem;
      expect(file.response).to.have.property('code', 'UPLOAD_LOCK_UNSUPPORTED');
      return wrapper.setProps({ lockKey: () => undefined });
    });
    cy.get('.sd-upload-icon-upload').click();
    cy.get('.sd-upload-list-item-done').should('exist');
    cy.then(() => {
      expect(request.callCount).to.equal(1);
    });
  });
});
