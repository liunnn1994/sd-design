import cypress from 'cypress';

export async function runCypressShard(spec: string, run = cypress.run): Promise<number> {
  const options = { browser: 'chrome', testingType: 'component', quiet: true } as const;
  const result = await run({ ...options, spec });
  if ('status' in result || result.runs.some(({ error }) => error)) {
    return 1;
  }
  if (result.totalFailed === 0) {
    return 0;
  }

  // shortcut: retry entry-module loads in a fresh session until Cypress can retry spec startup.
  const retrySpecs = result.runs
    .filter(({ spec, tests }) => {
      const [test] = tests;
      if (
        tests.length !== 1 ||
        test.state !== 'failed' ||
        test.title.join(' ') !== 'An uncaught error was detected outside of a test'
      ) {
        return false;
      }
      const modulePath = test.displayError?.match(
        /Failed to fetch dynamically imported module: http:\/\/localhost:\d+\/__cypress\/src\/([^\s?]+)/,
      )?.[1];
      const specPath = spec.absolute.replaceAll('\\', '/').replace(/^\//, '');
      return modulePath === 'cypress/support/component.ts' || modulePath === `@fs/${specPath}`;
    })
    .map(({ spec }) => spec.relative.replaceAll('\\', '/'));
  if (retrySpecs.length !== result.totalFailed) {
    return 1;
  }

  console.log(`Retrying Cypress spec startup for ${retrySpecs.join(', ')}`);
  const retry = await run({ ...options, spec: retrySpecs.join(',') });
  return 'status' in retry ||
    retry.totalFailed > 0 ||
    retry.runs.length !== retrySpecs.length ||
    retry.runs.some(({ error }) => error)
    ? 1
    : 0;
}

if (import.meta.main) {
  const spec = process.argv[2];
  if (!spec) {
    throw new Error('Expected a comma-separated list of Cypress specs');
  }
  process.exitCode = await runCypressShard(spec);
}
