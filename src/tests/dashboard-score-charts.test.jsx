// Lives outside src/pages because anything with a page extension under
// src/pages/ becomes a Next.js route.
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
} from "@testing-library/react";
import axios from "axios";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import Dashboard from "src/pages/index";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

vi.mock("next/router", () => ({
	useRouter: () => ({ push: vi.fn(), pathname: "/", query: {} }),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

const ASSIGNMENTS = [{ id: 1, question: "Water Cycle", textTitle: "Water" }];

const renderDashboard = () =>
	render(
		<SnackbarProvider>
			<Dashboard assignments={ASSIGNMENTS} />
		</SnackbarProvider>
	);

beforeEach(() => {
	axios.get.mockReset();
});

afterEach(cleanup);

describe("dashboard score charts", () => {
	it("shows an inline error state when the summaries request fails", async () => {
		axios.get.mockImplementation((url) =>
			url.startsWith("/api/dashboard/summaries/")
				? Promise.reject(new Error("boom"))
				: Promise.resolve({ data: {} })
		);

		renderDashboard();

		// One message per histogram card, not a silently empty chart.
		const messages = await screen.findAllByText(
			/score data for this assignment could not be loaded/i
		);
		expect(messages).toHaveLength(3);
		expect(
			screen.getByText(/could not load scores for this assignment/i)
		).toBeInTheDocument();
	});

	it("refetches when the error state's retry button is pressed", async () => {
		axios.get.mockImplementation((url) =>
			url.startsWith("/api/dashboard/summaries/")
				? Promise.reject(new Error("boom"))
				: Promise.resolve({ data: {} })
		);

		renderDashboard();
		await screen.findAllByText(
			/score data for this assignment could not be loaded/i
		);

		const summaryCalls = () =>
			axios.get.mock.calls.filter(([url]) =>
				url.startsWith("/api/dashboard/summaries/")
			).length;
		const before = summaryCalls();

		fireEvent.click(screen.getAllByRole("button", { name: /try again/i })[0]);

		await waitFor(() => expect(summaryCalls()).toBe(before + 1));
	});

	it("renders the histograms once the summaries load", async () => {
		axios.get.mockImplementation((url) =>
			url.startsWith("/api/dashboard/summaries/")
				? Promise.resolve({
						data: {
							summaries: [
								{
									id: 1,
									question_id: 1,
									is_submitted: true,
									content_score: 80,
									wording_score: 90,
									submitted_on: "2026-01-01",
									eval_students: { firstName: "Ava" },
								},
							],
						},
				  })
				: Promise.resolve({ data: {} })
		);

		renderDashboard();

		await waitFor(() =>
			expect(
				screen.queryByText(/score data for this assignment could not be loaded/i)
			).not.toBeInTheDocument()
		);
		expect(screen.getByText("Content score")).toBeInTheDocument();
		expect(screen.getByText("Wording score")).toBeInTheDocument();
	});
});
