import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "src/theme";
import { AssignmentInsightPanel } from "./assignment-insight-panel";

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock("axios", () => ({ default: { get: mockGet } }));

const renderPanel = () =>
	render(
		<ThemeProvider theme={createTheme("light")}>
			<AssignmentInsightPanel assignmentId={1} title="Climate Change" />
		</ThemeProvider>
	);

const insightWith = (topGap) => ({
	data: {
		insight: {
			summary: "Most students captured the main idea.",
			strengths: [],
			gaps: [],
			commonErrors: [],
			topGap,
		},
	},
});

beforeEach(() => mockGet.mockReset());

describe("AssignmentInsightPanel biggest gap", () => {
	it("renders the share-of-submissions label from the API", async () => {
		mockGet.mockResolvedValue(
			insightWith({
				error: "Copies source wording",
				count: 3,
				submissionCount: 9,
				pct: 33,
				label: "3 of 9 submissions (33%)",
			})
		);

		renderPanel();

		await waitFor(() =>
			expect(
				screen.getByText(/3 of 9 submissions \(33%\)/)
			).toBeInTheDocument()
		);
		expect(screen.getByText(/Copies source wording/)).toBeInTheDocument();
	});

	it("shows an occurrence count instead of a bogus percentage", async () => {
		// When the tally outgrows the submission count it is occurrences, not
		// students, so the API sends pct: null. The panel used to hardcode
		// "affects {pct}% of the class" and would render "affects null%".
		mockGet.mockResolvedValue(
			insightWith({
				error: "Missing supporting detail",
				count: 14,
				submissionCount: 9,
				pct: null,
				label: "14 occurrences",
			})
		);

		renderPanel();

		await waitFor(() =>
			expect(screen.getByText(/14 occurrences/)).toBeInTheDocument()
		);
		expect(screen.queryByText(/null/)).not.toBeInTheDocument();
		expect(screen.queryByText(/% of the class/)).not.toBeInTheDocument();
	});
});
