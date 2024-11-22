/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['src'],
      include: ['test/**/*.ts'],
      provider: 'v8',
    },
  },
});
