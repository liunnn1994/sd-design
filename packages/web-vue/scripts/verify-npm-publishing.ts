import { releasePackages } from './release-config.ts';

export async function verifyNpmPublishing(env = process.env, request: typeof fetch = fetch) {
  if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    throw new Error('npm publishing requires GitHub Actions OIDC (id-token: write).');
  }
  const url = new URL(env.ACTIONS_ID_TOKEN_REQUEST_URL);
  url.searchParams.set('audience', 'npm:registry.npmjs.org');
  const identity = await request(url, {
    headers: { Authorization: `Bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
  });
  if (!identity.ok) throw new Error(`GitHub OIDC request failed: HTTP ${identity.status}.`);
  const { value } = await identity.json();
  if (typeof value !== 'string' || !value) throw new Error('GitHub OIDC response has no token.');
  for (const name of releasePackages) {
    const packageName = `@sdata/${name}`;
    const response = await request(
      `https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(packageName)}`,
      { method: 'POST', headers: { Authorization: `Bearer ${value}` } },
    );
    await response.body?.cancel();
    if (!response.ok) {
      throw new Error(
        `npm trusted publishing rejected ${packageName}: HTTP ${response.status}. Check its npm trusted publisher: repository liunnn1994/sd-design, workflow release.yml, and environment. Publishing stopped before release steps.`,
      );
    }
    console.log(`npm trusted publishing verified: ${packageName}`);
  }
}

if (import.meta.main) await verifyNpmPublishing();
