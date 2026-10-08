import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  for (const [name, value] of Object.entries(env)) {
    let privileged = /service.?role|secret.?key/i.test(name) || value.startsWith('sb_secret_');
    try {
      privileged ||= JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString()).role === 'service_role';
    } catch { /* Publishable keys need not be JWTs. */ }
    if (privileged) throw new Error(`Credencial privilegiada proibida em ${name}. Use somente a chave pública do Supabase.`);
  }
  return { plugins: [react()], server: { host: '127.0.0.1' } };
});
