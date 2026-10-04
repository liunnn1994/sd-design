import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const serverEntry = fileURLToPath(new URL('../dist/index.js', import.meta.url));

const connect = async (options?: ConstructorParameters<typeof Client>[1]) => {
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

test('serves recovered APIs and valid clamp imports', async () => {
  const client = await connect();
  try {
    const get = async (name: string) => {
      const response = await client.callTool({ name: 'get_component', arguments: { name } });
      const content = response.content[0];
      assert.equal(content?.type, 'text');
      return JSON.parse(content.text);
    };
    for (const name of ['Calendar', 'Trigger', 'MarkdownRender']) {
      const api = await get(name);
      assert.ok(api.props.length > 0, `${name} should expose props`);
    }
    const clamp = await get('clamp');
    assert.equal(clamp.name, 'sd-line-clamp');
    assert.equal(clamp.import.named, "import { LineClamp } from '@sdata/web-vue';");
    assert.equal((await get('WrapClamp')).name, 'sd-wrap-clamp');
    const message = await get('Message');
    assert.equal(message.kind, 'service');
    assert.equal(message.configCount, 9);
    assert.ok(message.methods.some((method: { name: string }) => method.name === 'success'));
    assert.equal((await get('Notification')).configCount, 14);
    const search = await client.callTool({
      name: 'search_components',
      arguments: { query: 'resetOnHover' },
    });
    const content = search.content[0];
    assert.equal(content?.type, 'text');
    assert.ok(
      JSON.parse(content.text).matches.some(
        (match: { component: { name: string } }) => match.component.name === 'sd-message',
      ),
    );
  } finally {
    await client.close();
  }
});

test('find_by_prop accepts camelCase and kebab-case prop names', async () => {
  const client = await connect();
  try {
    const find = async (prop: string) => {
      const response = await client.callTool({ name: 'find_by_prop', arguments: { prop } });
      const content = response.content[0];
      assert.equal(content?.type, 'text');
      return JSON.parse(content.text) as { total: number };
    };
    const camel = await find('allowClear');
    const kebab = await find('allow-clear');
    assert.ok(camel.total > 0, 'camelCase 查询应当有命中');
    assert.equal(camel.total, kebab.total, '两种写法命中数应一致');
    assert.ok((await find('showTotal')).total > 0);
  } finally {
    await client.close();
  }
});
