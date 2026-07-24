import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PreviousAssignmentTable } from "./previous-assignment-table";
import { indexRemarks } from "src/demo/remarks";

// Scrollbar (simplebar) calls getComputedStyle with pseudo-elements, which
// jsdom doesn't implement; stub it to a passthrough for a clean, focused test.
vi.mock("src/components/scrollbar", () => ({
	Scrollbar: ({ children }) => <div>{children}</div>,
}));

afterEach(cleanup);

const rows = [
	{
		id: 1,
		studentId: 1,
		assignmentId: 1,
		assignment: "Climate Change",
		submitted_on: "2025-09-20T09:30:00.000Z",
		content_score: 85,
		wording_score: 78,
	},
];

const remarks = indexRemarks([
	{
		id: "1:1",
		studentId: 1,
		assignmentId: 1,
		text: "Strong on causes — say more about the consequences.",
		author: "Amara Perera",
	},
]);

describe("PreviousAssignmentTable", () => {
	it("renders a row with scores and the computed overall", () => {
		render(<PreviousAssignmentTable items={rows} count={1} rowsPerPage={5} />);
		expect(screen.getByText("Climate Change")).toBeInTheDocument();
		expect(screen.getByText("85%")).toBeInTheDocument();
		expect(screen.getByText("78%")).toBeInTheDocument();
		// overall = round((85 + 78) / 2) = 82
		expect(screen.getByText("82%")).toBeInTheDocument();
	});

	it("shows an empty state when there are no items", () => {
		render(<PreviousAssignmentTable items={[]} count={0} rowsPerPage={5} />);
		expect(screen.getByText(/no graded summaries yet/i)).toBeInTheDocument();
	});

	it("marks a row that has a teacher remark and expands it on demand", () => {
		render(
			<PreviousAssignmentTable
				items={rows}
				count={1}
				rowsPerPage={5}
				remarks={remarks}
			/>
		);

		const chip = screen.getByText("Remark");
		// Collapsed until asked for, so the table still reads as a score table.
		expect(
			screen.queryByText(/say more about the consequences/i)
		).not.toBeInTheDocument();

		fireEvent.click(chip);

		expect(
			screen.getByText(/say more about the consequences/i)
		).toBeInTheDocument();
		expect(screen.getByText(/Amara Perera/)).toBeInTheDocument();
	});

	it("keeps the remark chip keyboard operable and labelled", () => {
		render(
			<PreviousAssignmentTable
				items={rows}
				count={1}
				rowsPerPage={5}
				remarks={remarks}
			/>
		);

		const chip = screen.getByRole("button", { name: /remark/i });
		expect(chip).toHaveAttribute("aria-expanded", "false");
		expect(chip).toHaveAttribute("aria-controls", "remark-panel-1");

		chip.focus();
		fireEvent.keyDown(chip, { key: "Enter" });
		fireEvent.keyUp(chip, { key: "Enter" });

		expect(
			screen.getByText(/say more about the consequences/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /hide remark/i })
		).toHaveAttribute("aria-expanded", "true");
	});

	it("shows nothing for a row the teacher has not commented on", () => {
		render(
			<PreviousAssignmentTable
				items={[{ ...rows[0], id: 2, assignmentId: 3 }]}
				count={1}
				rowsPerPage={5}
				remarks={remarks}
			/>
		);
		expect(screen.queryByText("Remark")).not.toBeInTheDocument();
		expect(screen.getByText("—")).toBeInTheDocument();
	});
});
