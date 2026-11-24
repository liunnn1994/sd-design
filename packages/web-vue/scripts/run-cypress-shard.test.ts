import assert from 'node:assert/strict';
import test from 'node:test';

import { runCypressShard } from './run-cypress-shard.ts';

const passing = 'components/markdown-render/__test__/cursor-contract.cy.ts';
const failed = 'components/markdown-render/__test__/custom-children.cy.ts';
const loadError = {
  title: ['An uncaught error was detected outside of a test'],
  state: 'failed',
  displayError:
    'TypeError\n\n  > Failed to fetch dynamically imported module: http://localhost:5173/__cypress/src/cypress/support/component.ts\n',
};

function runResult(
  path: string,
  tests: Array<Pick<CypressCommandLine.TestResult, 'title' | 'state' | 'displayError'>> = [],
) {
  return {
    spec: { relative: path, absolute: `/workspace/${path.replaceAll('\\', '/')}` },
    tests,
    error: null,
  } as CypressCommandLine.RunResult;
}

function shardResult(totalFailed: number, ...runs: CypressCommandLine.RunResult[]) {
  return { totalFailed, runs } as CypressCommandLine.CypressRunResult;
}

test('retries only the spec with a support module load error', async () => {
  const run = test.mock.fn(async (options: { spec?: string }) =>
    options.spec === failed
      ? shardResult(0, runResult(failed))
      : shardResult(1, runResult(passing), runResult(failed.replaceAll('/', '\\'), [loadError])),
  );
  assert.equal(await runCypressShard(`${passing},${failed}`, run), 0);
  assert.deepEqual(
    run.mock.calls.map(({ arguments: [options] }) => options.spec),
    [`${passing},${failed}`, failed],
  );
});

test('preserves test failures in a shard that also has a support module load error', async () => {
  const run = test.mock.fn(async () =>
    shardResult(
      2,
      runResult(passing, [
        { title: ['checks cursor'], state: 'failed', displayError: 'AssertionError' },
      ]),
      runResult(failed, [loadError]),
    ),
  );
  assert.equal(await runCypressShard(`${passing},${failed}`, run), 1);
  assert.equal(run.mock.callCount(), 1);
});

test('retries the active spec entry load, leaving other module errors as failures', async () => {
  for (const [modulePath, expected] of [
    [failed, 2],
    [passing, 1],
  ] as const) {
    const run = test.mock.fn(async () =>
      shardResult(
        1,
        runResult(failed, [
          {
            ...loadError,
            displayError: loadError.displayError.replace(
              'cypress/support/component.ts',
              `@fs/workspace/${modulePath}`,
            ),
          },
        ]),
      ),
    );
    assert.equal(await runCypressShard(failed, run), 1);
    assert.equal(run.mock.callCount(), expected);
  }
});

test('fails a spec that still cannot load after one retry', async () => {
  const run = test.mock.fn(async () => shardResult(1, runResult(failed, [loadError])));
  assert.equal(await runCypressShard(failed, run), 1);
  assert.equal(run.mock.callCount(), 2);
});
