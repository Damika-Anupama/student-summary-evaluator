import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// The app uses .js files that contain JSX (Next.js convention), so tell
	// esbuild to parse JSX in .js with the automatic runtime.
	esbuild: {
		loader: "jsx",
		jsx: "automatic",
		include: /src\/.*\.jsx?$/,
		exclude: [],
	},
	optimizeDeps: {
		esbuildOptions: { loader: { ".js": "jsx" } },
	},
	resolve: {
		// Mirror the jsconfig baseUrl so `src/...` imports resolve in tests.
		alias: [{ find: /^src\//, replacement: resolve(process.cwd(), "src") + "/" }],
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.js"],
		include: ["src/**/*.test.{js,jsx}"],
		// A page test renders a whole MUI dashboard page — modals, pickers and
		// all — into jsdom, several times over, while every other test file runs
		// in a parallel worker. The 5s default left the slowest under a second of
		// headroom, so it failed on load rather than on behaviour: the same test
		// passes in ~500ms run on its own. Verified against an untouched
		// checkout, so this predates the persistence work.
		testTimeout: 20000,
		hookTimeout: 20000,
	},
});
