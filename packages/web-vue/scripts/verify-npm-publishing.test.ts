import { parseYAML } from 'confbox/yaml';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { verifyNpmPublishing } from './verify-npm-publishing.ts';

const env = {
  ACTIONS_ID_TOKEN_REQUEST_URL: 'https://actions.example.test/token?existing=1',
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'actions-secret',
};

test('workflow requires authentication and both test suites before publishing', async () => {
  const workflow = parseYAML<{
    on: { push: { branches: string[] } };
    concurrency: { 'group': string; 'cancel-in-progress': boolean };
    jobs: Record<
      string,
      {
        needs?: string | string[];
        uses?: string;
        with?: Record<string, unknown>;
        if?: string;
        steps?: { if?: string; run?: string }[];
      }
    >;
  }>(await readFile(new URL('../../../.github/workflows/release.yml', import.meta.url), 'utf8'));
  assert.deepEqual(workflow.on.push, { branches: ['main'] });
  assert.deepEqual(workflow.concurrency, {
    'group':
      "release-web-vue-${{ github.event_name == 'workflow_dispatch' && inputs.dry_run && 'dry-run-' || '' }}${{ github.ref }}",
    'cancel-in-progress': false,
  });
  const { preflight, browser, 'non-browser': nonBrowser, release } = workflow.jobs;
  const verify = preflight.steps?.find(
    (step) => step.run === 'node packages/web-vue/scripts/verify-npm-publishing.ts',
  );
  assert.equal(verify?.if, "github.event_name != 'workflow_dispatch' || !inputs.dry_run");
  assert.equal(browser.needs, 'preflight');
  assert.equal(browser.uses, './.github/workflows/browser-tests.yml');
  assert.equal(browser.with?.full_suite, true);
  assert.equal(nonBrowser.needs, 'preflight');
  assert.equal(nonBrowser.uses, './.github/workflows/non-browser-tests.yml');
  assert.deepEqual(release.needs, ['browser', 'non-browser']);
  assert.equal(release.if, undefined);
});

test('checks each package with the real OIDC exchange protocol before publishing', async (t) => {
  const request = t.mock.fn<typeof fetch>(async (url, options) => {
    if (String(url).startsWith('https://actions.example.test/')) {
      assert.equal(new URL(String(url)).searchParams.get('audience'), 'npm:registry.npmjs.org');
      assert.equal(new URL(String(url)).searchParams.get('existing'), '1');
      assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer actions-secret');
      return Response.json({ value: 'oidc-secret' });
    }
    assert.equal(options?.method, 'POST');
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer oidc-secret');
    return Response.json({ token: 'npm-secret' }, { status: 201 });
  });
  const log = t.mock.method(console, 'log', () => {});
  await verifyNpmPublishing(env, request);
  assert.deepEqual(
    request.mock.calls.slice(1).map((call) => String(call.arguments[0])),
    [
      'https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/%40sdata%2Fweb-core',
      'https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/%40sdata%2Fweb-vue',
      'https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/%40sdata%2Fweb-react',
    ],
  );
  assert.equal(log.mock.callCount(), 3);
  assert.ok(!JSON.stringify(log.mock.calls).includes('secret'));
});

test('the observed React OIDC 404 stops preflight without exposing credentials', async (t) => {
  const request = t.mock.fn<typeof fetch>(async (url) => {
    if (String(url).startsWith('https://actions.example.test/'))
      return Response.json({ value: 'oidc-secret' });
    return Response.json(
      { token: 'npm-secret' },
      { status: String(url).endsWith('web-react') ? 404 : 201 },
    );
  });
  t.mock.method(console, 'log', () => {});
  await assert.rejects(verifyNpmPublishing(env, request), (error: Error) => {
    assert.match(error.message, /@sdata\/web-react: HTTP 404/);
    assert.match(error.message, /workflow release.yml/);
    assert.ok(!error.message.includes('secret'));
    return true;
  });
});

test('missing or invalid GitHub credentials fail before any npm exchange', async (t) => {
  const request = t.mock.fn<typeof fetch>(async () => new Response(null, { status: 403 }));
  await assert.rejects(verifyNpmPublishing({}, request), /id-token: write/);
  assert.equal(request.mock.callCount(), 0);
  await assert.rejects(verifyNpmPublishing(env, request), /GitHub OIDC request failed: HTTP 403/);
  assert.equal(request.mock.callCount(), 1);
});
