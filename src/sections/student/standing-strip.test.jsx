import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StandingStrip } from "./standing-strip";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(() =>
			Promise.resolve({
				data: {
					profile: { overallAvg: 82, submittedCount: 5, missingCount: 0 },
				},
			})
		),
	},
}));

afterEach(cleanup);

describe("StandingStrip", () => {
	it("shows the student's standing once loaded", async () => {
		render(<StandingStrip />);
		expect(await screen.findByText("82")).toBeInTheDocument();
		expect(screen.getByText(/of 5/)).toBeInTheDocument();
		expect(screen.getByText(/your average/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /see your progress/i })
		).toHaveAttribute("href", "/history-student");
	});
});
