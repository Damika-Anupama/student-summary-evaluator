// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { useLocalStorageState } from "./use-local-storage-state";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("useLocalStorageState", () => {
	it("starts with the default and persists updates", () => {
		const { result } = renderHook(() =>
			useLocalStorageState("prefs", { email: true })
		);
		expect(result.current[0]).toEqual({ email: true });
		act(() => result.current[1]({ email: false }));
		expect(JSON.parse(localStorage.getItem("prefs"))).toEqual({
			email: false,
		});
	});

	it("restores the saved value on a fresh mount", async () => {
		localStorage.setItem("prefs", JSON.stringify({ email: false }));
		const { result } = renderHook(() =>
			useLocalStorageState("prefs", { email: true })
		);
		await waitFor(() => expect(result.current[0]).toEqual({ email: false }));
	});

	it("supports functional updates", () => {
		const { result } = renderHook(() => useLocalStorageState("count", 1));
		act(() => result.current[1]((n) => n + 1));
		expect(result.current[0]).toBe(2);
		expect(JSON.parse(localStorage.getItem("count"))).toBe(2);
	});

	it("ignores corrupt stored values", async () => {
		localStorage.setItem("prefs", "{not json");
		const { result } = renderHook(() =>
			useLocalStorageState("prefs", "fallback")
		);
		await waitFor(() => expect(result.current[0]).toBe("fallback"));
	});
});
