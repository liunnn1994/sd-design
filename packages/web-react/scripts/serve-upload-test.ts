import { createServer, type ServerResponse } from 'node:http';

const requests: {
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}[] = [];
const pending = new Set<ServerResponse>();
const allowedOrigins = new Set(
  [5187, 5190, 5191, 5193, 5194].map((port) => `http://127.0.0.1:${port}`),
);
const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin))
    response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Headers', 'X-Upload-Test');
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.setHeader('Content-Type', 'application/json');
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }
  if (request.url === '/state') {
    response.end(JSON.stringify(requests));
    return;
  }
  if (request.url === '/reset') {
    requests.length = 0;
    response.end('{}');
    return;
  }
  if (request.url === '/release') {
    for (const target of pending) target.end(JSON.stringify({ url: '/late' }));
    pending.clear();
    response.end('{}');
    return;
  }
  if (request.method !== 'POST' || !['/upload', '/error', '/slow'].includes(request.url ?? '')) {
    response.writeHead(404).end('{}');
    return;
  }
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 2 * 1024 * 1024) {
      response.writeHead(413).end('{}');
      return;
    }
    chunks.push(chunk);
  }
  requests.push({
    path: request.url!,
    headers: request.headers,
    body: Buffer.concat(chunks).toString('utf8'),
  });
  if (request.url === '/slow') {
    pending.add(response);
    response.on('close', () => pending.delete(response));
    return;
  }
  response
    .writeHead(request.url === '/error' ? 500 : 200)
    .end(
      JSON.stringify(
        request.url === '/error'
          ? { message: 'Rejected by test server' }
          : { url: '/uploaded.txt' },
      ),
    );
});
server.listen(5192, '127.0.0.1', () => console.log('Upload test receiver: http://127.0.0.1:5192'));
