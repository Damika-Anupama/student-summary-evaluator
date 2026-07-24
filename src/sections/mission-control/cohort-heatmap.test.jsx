import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CohortHeatmap } from "./cohort-heatmap";

afterEach(cleanup);

const matrix = {
	columns: [{ id: 1, label: "Water Cycle" }],
	rows: [
		{
			studentId: 7,
			student: "Ava Anderson",
			avg: 58,
			cells: [{ assignmentId: 1, score: 58 }],
		},
	],
};

describe("CohortHeatmap", () => {
	it("renders a row per student", () => {
		render(<CohortHeatmap matrix={matrix} />);
		expect(screen.getByText("Ava Anderson")).toBeInTheDocument();
	});

	it("exposes the student name cell as a keyboard-reachable button", () => {
		const onCellClick = vi.fn();
		render(<CohortHeatmap matrix={matrix} onCellClick={onCellClick} />);
		const nameCell = screen.getByRole("button", {
			name: /open ava anderson's profile/i,
		});
		expect(nameCell).toHaveAttribute("tabindex", "0");
	});

	it("opens the profile from the name cell via Enter and Space", () => {
		const onCellClick = vi.fn();
		render(<CohortHeatmap matrix={matrix} onCellClick={onCellClick} />);
		const nameCell = screen.getByRole("button", {
			name: /open ava anderson's profile/i,
		});
		fireEvent.keyDown(nameCell, { key: "Enter" });
		fireEvent.keyDown(nameCell, { key: " " });
		expect(onCellClick).toHaveBeenCalledTimes(2);
		expect(onCellClick).toHaveBeenCalledWith(7);
	});

	it("leaves the name cell inert when there is no click handler", () => {
		render(<CohortHeatmap matrix={matrix} />);
		expect(
			screen.queryByRole("button", { name: /open ava anderson's profile/i })
		).not.toBeInTheDocument();
	});
});
