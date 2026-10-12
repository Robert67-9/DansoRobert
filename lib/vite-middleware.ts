// Dev-only Vite middleware mounting.
//
// This module is intentionally never imported with a statically analyzable
// specifier from server.ts / api/index.ts. Vercel's serverless bundler traces
// static `import('vite')` strings and pulls the entire Vite dev server
// (native binaries, @vitejs/devtools) into the API function, which crashes
// cold start with FUNCTION_INVOCATION_FAILED. Keeping the only reference
// behind a computed specifier (see server.ts) guarantees Vite stays local.
import type { Express } from 'express';

export async function mountViteMiddleware(app: Express): Promise<void> {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  console.log('Vite middleware mounted in development mode');
}
