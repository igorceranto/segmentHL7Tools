import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: { resolve: true },
  tsconfig: 'tsconfig.json',
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  target: 'node16',
  platform: 'node',
  esbuildOptions(options) {
    options.banner = {
      js: '// segmentHL7Tools - Ferramentas para manipulação de segmentos HL7\n',
    };
  },
});
