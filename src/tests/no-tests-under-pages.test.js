import { describe, it, expect } from "vitest";
import { readdirSync } from "fs";
import { join, relative } from "path";

const PAGES_DIR = join(process.cwd(), "src", "pages");

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = join(dir, entry.name);
		return entry.isDirectory() ? walk(full) : [full];
	});

describe("src/pages hygiene", () => {
	// Next.js turns every .js/.jsx file under src/pages into a route, so a test
	// file placed next to the handler it covers silently ships as a public
	// endpoint — `/api/assignments/assignments-api.test` was a real serverless
	// function until it was moved here. Colocate page/API tests in src/tests.
	it("contains no test files that would become routes", () => {
		const offenders = walk(PAGES_DIR)
			.filter((f) => /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f))
			.map((f) => relative(process.cwd(), f));

		expect(offenders).toEqual([]);
	});
});
