// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { useMockedUser } from "./use-mocked-user";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("useMockedUser", () => {
	it("returns the teacher persona by default", async () => {
		const { result } = renderHook(() => useMockedUser());
		await waitFor(() => expect(result.current.name).toBe("Amara Perera"));
		expect(result.current.role).toBe("teacher");
	});

	it("returns the student persona when the student role is active", async () => {
		localStorage.setItem("userRole", "student");
		const { result } = renderHook(() => useMockedUser());
		await waitFor(() => expect(result.current.name).toBe("John Doe"));
		expect(result.current.role).toBe("student");
		expect(result.current.email).toBe("john.doe@school.demo");
	});
});
