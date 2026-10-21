import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('operation width declarations require a value guard when the original descriptor owns undefined', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'sd-core-table-operation-types-'));
  const compiler = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
  const module = fileURLToPath(new URL('../dist/table/layout.js', import.meta.url)).replaceAll(
    '\\',
    '/',
  );
  const source = `import { getTableOperations } from ${JSON.stringify(module)};
const operation = getTableOperations({ hasLeftFixedColumn: false, hasRightFixedColumn: false, hasLeftFixedDataColumns: false, draggable: { title: 'Move' }, expandable: undefined, rowSelection: undefined, operations: undefined })[0]!;
`;
  function check(name: string, guard: string) {
    const file = path.join(directory, `${name}.mts`);
    writeFileSync(file, `${source}${guard}\n`);
    return spawnSync(
      process.execPath,
      [
        compiler,
        '--ignoreConfig',
        '--noEmit',
        '--strict',
        '--exactOptionalPropertyTypes',
        '--skipLibCheck',
        '--module',
        'nodenext',
        '--moduleResolution',
        'nodenext',
        '--target',
        'es2022',
        file,
      ],
      { encoding: 'utf8', windowsHide: true },
    );
  }
  try {
    const safe = check('safe', 'if (operation.width !== undefined) operation.width.toFixed();');
    assert.equal(safe.error, undefined);
    assert.equal(safe.status, 0, safe.stdout + safe.stderr);
    const unsafe = check('unsafe', "if ('width' in operation) operation.width.toFixed();");
    assert.equal(unsafe.error, undefined);
    assert.notEqual(
      unsafe.status,
      0,
      'Presence alone must not narrow an owned undefined width to number.',
    );
    assert.match(unsafe.stdout + unsafe.stderr, /(?:TS18048|TS2532).*undefined/);
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('sd-core-table-operation-types-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
