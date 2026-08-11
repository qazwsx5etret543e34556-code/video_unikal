import { buildApp } from './app.js';

async function main() {
  const app = await buildApp();

  const host = process.env.HOST || '0.0.0.0';
  const port = parseInt(process.env.PORT || '3001');

  try {
    await app.listen({ port, host });
    console.log(`License server running on http://${host}:${port}`);
    console.log(`Health check: http://${host}:${port}/api/v1/health`);
    console.log(`Admin API: http://${host}:${port}/api/admin`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
