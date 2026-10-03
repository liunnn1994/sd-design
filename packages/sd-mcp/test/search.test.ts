import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const serverEntry = fileURLToPath(new URL('../dist/index.js', import.meta.url));

const connect = async () => {
  const client = new Client({ name: 'sd-mcp-search-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverEntry],
    cwd: packageRoot,
    stderr: 'pipe',
  });
  await client.connect(transport);
  return client;
};

const search = async (client: Client, query: string) => {
  const result = await client.callTool({
    name: 'search_components',
    arguments: { query },
  });
  const parsed = JSON.parse((result.content as Array<{ text: string }>)[0].text) as {
    total: number;
  };
  return parsed.total;
};

test('search matches props by camelCase as well as kebab-case', async () => {
  const client = await connect();
  try {
    // 属性名在数据里是 kebab-case，调用方却多半按代码写法提问
    const camel = await search(client, 'allowClear');
    const kebab = await search(client, 'allow-clear');
    assert.ok(camel > 0, 'camelCase 查询应当有命中');
    assert.equal(camel, kebab, '两种写法应当命中相同的数量');

    const total = await search(client, 'showTotal');
    assert.ok(total > 0, 'showTotal 应当能搜到');
  } finally {
    await client.close();
  }
});

test('search still matches plain and Chinese keywords', async () => {
  const client = await connect();
  try {
    assert.ok((await search(client, 'pagination')) > 0);
    assert.ok((await search(client, '日期')) > 0);
    assert.equal(await search(client, '   '), 0, '空白查询应返回空');
  } finally {
    await client.close();
  }
});
