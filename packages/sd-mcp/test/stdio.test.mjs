import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const serverEntry = fileURLToPath(new URL('../dist/index.js', import.meta.url));

const connect = async (options) => {
  const client = new Client({ name: 'sd-mcp-test', version: '1.0.0' }, options);
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverEntry],
    cwd: packageRoot,
    stderr: 'pipe',
  });

  await client.connect(transport);
  return client;
};

test('serves tools over the 2026-07-28 protocol', async () => {
  const client = await connect({
    versionNegotiation: { mode: { pin: '2026-07-28' } },
  });

  try {
    assert.equal(client.getProtocolEra(), 'modern');
    assert.deepEqual(client.getServerVersion(), {
      name: '@sdata/web-vue-mcp',
      version: '9.8.7-test',
    });

    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map(({ name }) => name),
      [
        'list_components',
        'get_categories',
        'get_component',
        'search_components',
        'get_component_props',
        'get_component_events',
        'get_component_slots',
        'find_by_prop',
      ],
    );

    const response = await client.callTool({
      name: 'get_component',
      arguments: { name: 'Button' },
    });
    const content = response.content[0];
    assert.equal(content?.type, 'text');
    assert.equal(JSON.parse(content.text).name, 'sd-button');
  } finally {
    await client.close();
  }
});

test('continues to serve legacy MCP clients', async () => {
  const client = await connect();

  try {
    assert.equal(client.getProtocolEra(), 'legacy');

    const response = await client.callTool({
      name: 'get_categories',
      arguments: {},
    });
    const content = response.content[0];
    assert.equal(content?.type, 'text');
    assert.ok(JSON.parse(content.text).total > 0);
  } finally {
    await client.close();
  }
});
