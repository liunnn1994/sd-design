import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { docsE2eSpecs } from './docs-e2e-specs.ts';

interface Summary {
  spec: string;
  status: string;
  tests: number;
  passed: number;
  failed: number;
  pending: number;
  skipped: number;
  error?: string;
}
const complete = (result: Summary) =>
  result.status === 'finished' &&
  result.tests > 0 &&
  result.passed === result.tests &&
  result.failed === 0 &&
  result.pending === 0 &&
  result.skipped === 0;
const script = fileURLToPath(import.meta.url);
const project = resolve(dirname(script), '..');
const [mode, selected, outputArg] = process.argv.slice(2);
if (mode === '--self-test') {
  const passing: Summary = {
    spec: 'fixture',
    status: 'finished',
    tests: 2,
    passed: 2,
    failed: 0,
    pending: 0,
    skipped: 0,
  };
  assert.ok(complete(passing));
  for (const change of [
    { tests: 0, passed: 0 },
    { failed: 1 },
    { pending: 1 },
    { skipped: 1 },
    { passed: 1 },
    { status: 'failed' },
  ])
    assert.equal(complete({ ...passing, ...change }), false);
  console.log('Isolated E2E result validation passed');
} else if (mode === '--worker') {
  const { default: cypress } = await import('cypress');
  const spec = `tests/browser/${selected}`;
  try {
    const result = await cypress.run({
      project,
      browser: 'chrome',
      spec: resolve(project, spec),
      ...(docsE2eSpecs.includes(spec)
        ? { configFile: resolve(project, 'cypress.docs.config.ts') }
        : { config: { e2e: { baseUrl: 'http://127.0.0.1:5190' } } }),
    });
    const summary: Summary =
      'totalTests' in result
        ? {
            spec: selected!,
            status: 'finished',
            tests: result.totalTests,
            passed: result.totalPassed,
            failed: result.totalFailed,
            pending: result.totalPending,
            skipped: result.totalSkipped,
          }
        : {
            spec: selected!,
            status: 'failed',
            tests: 0,
            passed: 0,
            failed: result.failures,
            pending: 0,
            skipped: 0,
            error: result.message,
          };
    writeFileSync(outputArg!, JSON.stringify(summary, null, 2));
    process.exitCode = complete(summary) ? 0 : 1;
  } catch (error) {
    writeFileSync(
      outputArg!,
      JSON.stringify({ spec: selected, status: 'error', error: String(error) }),
    );
    process.exitCode = 1;
  }
} else {
  const specs = readdirSync(resolve(project, 'tests/browser'))
    .filter((name) => name.endsWith('.cy.ts'))
    .sort();
  if (mode === '--spec') {
    assert.ok(
      selected && specs.includes(selected),
      'Selected spec must exist in the formal browser suite',
    );
    specs.splice(0, specs.length, selected);
  } else
    assert.equal(mode, undefined, 'Use no arguments for the complete suite, or --spec <filename>');
  const output = resolve(project, `isolated-e2e-${Date.now()}`);
  mkdirSync(output);
  writeFileSync(resolve(output, 'inventory.json'), JSON.stringify(specs, null, 2));
  console.log(`Running ${specs.length} specs; evidence: ${output}`);
  const summaries: Summary[] = [];
  for (const spec of specs) {
    console.log(`Starting ${summaries.length + 1}/${specs.length}: ${spec}`);
    const resultPath = resolve(output, `${spec}.json`);
    const result = spawnSync(process.execPath, [script, '--worker', spec, resultPath], {
      cwd: project,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    writeFileSync(resolve(output, `${spec}.log`), `${result.stdout ?? ''}${result.stderr ?? ''}`);
    let summary: Summary;
    try {
      summary = JSON.parse(readFileSync(resultPath, 'utf8'));
    } catch {
      summary = {
        spec,
        status: 'error',
        tests: 0,
        passed: 0,
        failed: 1,
        pending: 0,
        skipped: 0,
        error: String(result.error ?? `Worker exit ${result.status}`),
      };
    }
    if (result.status !== 0 && complete(summary)) summary.status = 'error';
    summaries.push(summary);
    writeFileSync(resolve(output, 'summary.json'), JSON.stringify(summaries, null, 2));
    console.log(
      `${complete(summary) ? 'PASS' : 'FAIL'} ${spec}: ${summary.passed}/${summary.tests}`,
    );
  }
  const passed = summaries.length === specs.length && summaries.every(complete);
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${summaries.length}/${specs.length} specs completed`);
  process.exitCode = passed ? 0 : 1;
}
