export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }
    const key = new URL(request.url).pathname.replace(/^\/media\//, '');
    const headers = new Headers();
    for (const h of ['range', 'if-none-match', 'if-modified-since']) if (request.headers.has(h)) headers.set(h, request.headers.get(h));
    const upstream = await fetch(env.MEDIA_URL + key, { method: request.method, headers });
    const response = new Response(upstream.body, upstream);
    if (upstream.ok) response.headers.set('cache-control', 'public, max-age=31536000, immutable');
    return response;
  },
};
