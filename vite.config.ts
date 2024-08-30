import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [dts()],
	build: {
		lib: {
			entry: "./src/main.ts",
			name: 'PokeAClient',
			fileName: (format) => `main.js`,
			formats: ["es"]
		},
		rollupOptions: {
			// Add _all_ external dependencies here
			external: ["@microsoft/signalr"],
		}
	}
});