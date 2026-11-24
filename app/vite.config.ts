import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ command, mode }) => {
  const { VITE_MASTER_CODE_HASH } = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build' && !/^[a-f0-9]{64}$/i.test(VITE_MASTER_CODE_HASH ?? '')) {
    throw new Error(
      'Master-Zugang nicht konfiguriert. npm run configure-access ausfuehren ' +
      'oder VITE_MASTER_CODE_HASH als SHA-256-Pruefwert setzen.',
    )
  }

  return {
    base: '/seal_kickerturnier_app/',
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      restoreMocks: true,
    },
  }
})
