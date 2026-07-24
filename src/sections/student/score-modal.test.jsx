import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ScoreAssignmentModal } from "./score-modal";

// The modal fetches AI suggestions on open; stub it so tests don't hit network.
vi.mock("axios", () => ({
	default: {
		post: vi.fn(() =>
			Promise.resolve({ data: { result: { bullets: [] } } })
		),
	},
}));

afterEach(cleanup);

const noop = () => {};

describe("ScoreAssignmentModal", () => {
	it("shows a loading indicator while evaluating", () => {
		render(
			<ScoreAssignmentModal open loading setOpen={noop} />
		);
		expect(screen.getByText(/evaluating your summary/i)).toBeInTheDocument();
		// No onward CTA until results are ready.
		expect(
			screen.queryByRole("link", { name: /see your progress/i })
		).not.toBeInTheDocument();
	});

	it("renders the score dials and verdict when results are ready", async () => {
		render(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={74}
				wordingScore={80}
				wordCount={42}
			/>
		);
		// findBy flushes the async suggestions effect (avoids act warnings).
		// content 74, wording 80, overall round((74+80)/2)=77
		expect(await screen.findByText("74")).toBeInTheDocument();
		expect(screen.getByText("80")).toBeInTheDocument();
		expect(screen.getByText("77")).toBeInTheDocument();
		expect(screen.getByText(/good work/i)).toBeInTheDocument();
		expect(screen.getByText(/42 words evaluated/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /see your progress/i })
		).toHaveAttribute("href", "/history-student");
	});

	it("highlights matched and missed key concepts when provided", async () => {
		render(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={70}
				wordingScore={70}
				wordCount={30}
				matchedTerms={["greenhouse", "temperatures"]}
				missedTerms={["fuels"]}
			/>
		);
		expect(
			await screen.findByText(/key concepts from the source/i)
		).toBeInTheDocument();
		expect(screen.getByText(/covered in your summary/i)).toBeInTheDocument();
		expect(screen.getByText("greenhouse")).toBeInTheDocument();
		expect(screen.getByText(/consider adding/i)).toBeInTheDocument();
		expect(screen.getByText("fuels")).toBeInTheDocument();
	});

	it("shows the readability label next to the word count when provided", async () => {
		render(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={62}
				wordingScore={88}
				wordCount={30}
				readability={{ label: "Clear", avgSentenceLength: 12 }}
			/>
		);
		expect(
			await screen.findByText(/30 words evaluated · readability: clear/i)
		).toBeInTheDocument();
	});

	it("offers a copy-summary action that fires onCopyResult, only when provided", async () => {
		const onCopyResult = vi.fn();
		const { rerender } = render(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={62}
				wordingScore={88}
				wordCount={30}
			/>
		);
		await screen.findByText("62");
		expect(
			screen.queryByRole("button", { name: /copy summary/i })
		).not.toBeInTheDocument();

		rerender(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={62}
				wordingScore={88}
				wordCount={30}
				onCopyResult={onCopyResult}
			/>
		);
		fireEvent.click(await screen.findByRole("button", { name: /copy summary/i }));
		expect(onCopyResult).toHaveBeenCalledTimes(1);
	});

	it("offers a copy-link action that fires onShare, only when provided", async () => {
		const onShare = vi.fn();
		const { rerender } = render(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={62}
				wordingScore={88}
				wordCount={30}
			/>
		);
		await screen.findByText("62");
		// No share handler → no button.
		expect(
			screen.queryByRole("button", { name: /copy link/i })
		).not.toBeInTheDocument();

		rerender(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={62}
				wordingScore={88}
				wordCount={30}
				onShare={onShare}
			/>
		);
		const btn = await screen.findByRole("button", { name: /copy link/i });
		fireEvent.click(btn);
		expect(onShare).toHaveBeenCalledTimes(1);
	});

	it("omits the concepts section when no terms are provided", async () => {
		render(
			<ScoreAssignmentModal
				open
				loading={false}
				setOpen={noop}
				contentScore={62}
				wordingScore={88}
				wordCount={30}
			/>
		);
		// Distinct scores (overall = 75) so this findBy resolves a single node.
		await screen.findByText("62");
		expect(
			screen.queryByText(/key concepts from the source/i)
		).not.toBeInTheDocument();
	});
});
