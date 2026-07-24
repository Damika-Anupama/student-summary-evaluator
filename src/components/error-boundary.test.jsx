import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorBoundary } from "./error-boundary";

afterEach(cleanup);

const Boom = () => {
	throw new Error("boom");
};

describe("ErrorBoundary", () => {
	it("renders its children when there is no error", () => {
		render(
			<ErrorBoundary>
				<p>all good</p>
			</ErrorBoundary>
		);
		expect(screen.getByText("all good")).toBeInTheDocument();
	});

	it("shows the fallback when a child throws", () => {
		// React logs caught render errors; silence it for a clean test run.
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		render(
			<ErrorBoundary>
				<Boom />
			</ErrorBoundary>
		);
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /reload/i })
		).toBeInTheDocument();
		spy.mockRestore();
	});
});
