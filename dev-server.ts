// Local development entrypoint: Express API + Vite middleware (HMR + SPA transform).
//
// This file is intentionally never imported by api/index.ts, so the Vite dev
// server can be imported here with a plain static import while staying out of
// the Vercel serverless bundle entirely (Vite pulls native binaries and
// @vitejs/devtools, which crash function cold start).
import { createServer as createViteServer } from 'vite';
import app from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});
app.use(vite.middlewares);
console.log('Vite middleware mounted in development mode');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio dev server running at http://localhost:${PORT}`);
});
