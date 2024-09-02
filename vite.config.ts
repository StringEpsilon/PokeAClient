import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [dts({rollupTypes: true})],
	build: {
		lib: {
			entry: "./src/main.ts",
			name: 'pokeaclient',
			fileName: (format) => `main.js`,
			formats: ["es"]
		},
		rollupOptions: {
			external: ["@microsoft/signalr"],
		},
	}
});